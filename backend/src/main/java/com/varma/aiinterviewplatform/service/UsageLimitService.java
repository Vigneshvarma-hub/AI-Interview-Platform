
package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.entity.Subscription;
import com.varma.aiinterviewplatform.entity.UsageRecord;
import com.varma.aiinterviewplatform.entity.User;

import com.varma.aiinterviewplatform.repository.SubscriptionRepository;
import com.varma.aiinterviewplatform.repository.UsageRecordRepository;
import com.varma.aiinterviewplatform.repository.UserRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class UsageLimitService {

    private final UserRepository userRepository;
    private final UsageRecordRepository usageRecordRepository;
    private final SubscriptionRepository subscriptionRepository;

    public UsageLimitService(
            UserRepository userRepository,
            UsageRecordRepository usageRecordRepository,
            SubscriptionRepository subscriptionRepository
    ) {
        this.userRepository = userRepository;
        this.usageRecordRepository = usageRecordRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    /**
     * Reserve one unit before starting a feature.
     *
     * The idempotency key must be unique for each user operation.
     */
    @Transactional
    public UsageRecord reserveUsage(
            String email,
            String featureCode,
            String idempotencyKey,
            String referenceId
    ) {

        validateInput(email, featureCode, idempotencyKey);

        var existing = usageRecordRepository
                .findByIdempotencyKey(idempotencyKey);

        if (existing.isPresent()) {
            UsageRecord record = existing.get();

            if (!record.getUser().getEmail().equalsIgnoreCase(email.trim())) {
                throw new AccessDeniedException(
                        "Invalid usage reservation."
                );
            }

            if (SubscriptionPlanCatalog.RELEASED.equals(
                    record.getUsageStatus())) {
                throw new IllegalStateException(
                        "This usage reservation was already released."
                );
            }

            return record;
        }

        User user = userRepository.findByEmail(
                        email.trim().toLowerCase()
                )
                .orElseThrow(() ->
                        new AccessDeniedException("User account not found.")
                );

        String planCode = resolvePlanCode(user);

        SubscriptionPlanCatalog.Plan plan =
                SubscriptionPlanCatalog.getPlan(planCode);

        int limit = plan.getLimit(featureCode);

        if (limit <= 0) {
            throw new AccessDeniedException(
                    "This feature is not available in your current plan."
            );
        }

        Period period = resolvePeriod(user, plan);

        Long consumed = usageRecordRepository
                .sumQuantityByUserAndFeatureAndStatusAndPeriod(
                        user.getId(),
                        featureCode,
                        SubscriptionPlanCatalog.CONSUMED,
                        period.start(),
                        period.end()
                );

        Long reserved = usageRecordRepository
                .sumQuantityByUserAndFeatureAndStatusAndPeriod(
                        user.getId(),
                        featureCode,
                        SubscriptionPlanCatalog.RESERVED,
                        period.start(),
                        period.end()
                );

        long totalUsed = safeValue(consumed) + safeValue(reserved);

        if (totalUsed >= limit) {
            throw new AccessDeniedException(
                    "You have reached your " + featureCode
                            + " limit for the " + plan.name()
                            + " plan. Please upgrade your plan."
            );
        }

        UsageRecord record = new UsageRecord();

        record.setUser(user);
        record.setFeatureCode(featureCode);
        record.setQuantity(1);
        record.setUsageStatus(SubscriptionPlanCatalog.RESERVED);
        record.setPeriodStart(period.start());
        record.setPeriodEnd(period.end());
        record.setIdempotencyKey(idempotencyKey);
        record.setReferenceId(referenceId);

        return usageRecordRepository.save(record);
    }

    /**
     * Mark a successful operation as consumed.
     */
    @Transactional
    public UsageRecord consumeUsage(String idempotencyKey) {

        UsageRecord record = findReservation(idempotencyKey);

        if (SubscriptionPlanCatalog.CONSUMED.equals(
                record.getUsageStatus())) {
            return record;
        }

        if (!SubscriptionPlanCatalog.RESERVED.equals(
                record.getUsageStatus())) {
            throw new IllegalStateException(
                    "Only reserved usage can be consumed."
            );
        }

        record.setUsageStatus(SubscriptionPlanCatalog.CONSUMED);

        return usageRecordRepository.save(record);
    }

    /**
     * Release a reservation when the operation fails.
     */
    @Transactional
    public UsageRecord releaseUsage(String idempotencyKey) {

        UsageRecord record = findReservation(idempotencyKey);

        if (SubscriptionPlanCatalog.RELEASED.equals(
                record.getUsageStatus())) {
            return record;
        }

        if (!SubscriptionPlanCatalog.RESERVED.equals(
                record.getUsageStatus())) {
            throw new IllegalStateException(
                    "Only reserved usage can be released."
            );
        }

        record.setUsageStatus(SubscriptionPlanCatalog.RELEASED);

        return usageRecordRepository.save(record);
    }

    /**
     * Return current usage for all supported features.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUsageSummary(String email) {

        User user = userRepository.findByEmail(
                        email.trim().toLowerCase()
                )
                .orElseThrow(() ->
                        new AccessDeniedException("User account not found.")
                );

        String planCode = resolvePlanCode(user);

        SubscriptionPlanCatalog.Plan plan =
                SubscriptionPlanCatalog.getPlan(planCode);

        Period period = resolvePeriod(user, plan);

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("plan", plan.code());
        result.put("planName", plan.name());

        Map<String, Object> features = new LinkedHashMap<>();

        for (String feature : new String[]{
                SubscriptionPlanCatalog.AI_INTERVIEW,
                SubscriptionPlanCatalog.RESUME_ANALYSIS,
                SubscriptionPlanCatalog.MCQ,
                SubscriptionPlanCatalog.TEST_CENTER,
                SubscriptionPlanCatalog.CODING
        }) {

            Long consumed = usageRecordRepository
                    .sumQuantityByUserAndFeatureAndStatusAndPeriod(
                            user.getId(),
                            feature,
                            SubscriptionPlanCatalog.CONSUMED,
                            period.start(),
                            period.end()
                    );

            Long reserved = usageRecordRepository
                    .sumQuantityByUserAndFeatureAndStatusAndPeriod(
                            user.getId(),
                            feature,
                            SubscriptionPlanCatalog.RESERVED,
                            period.start(),
                            period.end()
                    );

            int limit = plan.getLimit(feature);
            long used = safeValue(consumed);
            long pending = safeValue(reserved);

            Map<String, Object> featureUsage = new LinkedHashMap<>();

            featureUsage.put("limit", limit);
            featureUsage.put("used", used);
            featureUsage.put("reserved", pending);
            featureUsage.put(
                    "remaining",
                    Math.max(0, limit - used - pending)
            );

            features.put(feature, featureUsage);
        }

        result.put("features", features);
        result.put("periodStart", period.start());
        result.put("periodEnd", period.end());

        return result;
    }

    private UsageRecord findReservation(String idempotencyKey) {

        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException(
                    "Idempotency key is required."
            );
        }

        return usageRecordRepository
                .findByIdempotencyKey(idempotencyKey)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usage reservation not found."
                ));
    }

    private String resolvePlanCode(User user) {

        String currentPlan = user.getSubscriptionPlan();

        if ("TRIAL".equalsIgnoreCase(currentPlan)) {
            return SubscriptionPlanCatalog.TRIAL;
        }

        if ("FREE".equalsIgnoreCase(currentPlan)
                || currentPlan == null
                || currentPlan.isBlank()) {
            return SubscriptionPlanCatalog.FREE;
        }

        if ("PREMIUM".equalsIgnoreCase(currentPlan)) {

            Subscription subscription = subscriptionRepository
                    .findFirstByUser_IdOrderByCreatedAtDesc(user.getId())
                    .orElse(null);

            if (subscription != null
                    && "ACTIVE".equalsIgnoreCase(subscription.getStatus())) {
                return subscription.getPlanCode();
            }

            return SubscriptionPlanCatalog.MONTHLY;
        }

        return currentPlan.toUpperCase();
    }

    private Period resolvePeriod(
            User user,
            SubscriptionPlanCatalog.Plan plan
    ) {

        LocalDateTime now = LocalDateTime.now();

        if ("LIFETIME".equals(plan.billingCycle())) {
            return new Period(
                    LocalDateTime.of(2000, 1, 1, 0, 0),
                    LocalDateTime.of(9999, 12, 31, 23, 59, 59)
            );
        }

        if ("TRIAL".equals(plan.billingCycle())) {

            LocalDateTime start = user.getTrialStartDate() != null
                    ? user.getTrialStartDate()
                    : now;

            LocalDateTime end = user.getTrialEndDate() != null
                    ? user.getTrialEndDate()
                    : start.plusDays(7);

            return new Period(start, end);
        }

        Subscription subscription = subscriptionRepository
                .findFirstByUser_IdOrderByCreatedAtDesc(user.getId())
                .orElse(null);

        if (subscription != null
                && subscription.getCurrentPeriodStart() != null
                && subscription.getCurrentPeriodEnd() != null) {

            return new Period(
                    subscription.getCurrentPeriodStart(),
                    subscription.getCurrentPeriodEnd()
            );
        }

        if ("WEEKLY".equals(plan.billingCycle())) {

            LocalDate monday = LocalDate.now()
                    .with(TemporalAdjusters.previousOrSame(
                            java.time.DayOfWeek.MONDAY
                    ));

            return new Period(
                    monday.atStartOfDay(),
                    monday.plusDays(7).atStartOfDay().minusNanos(1)
            );
        }

        LocalDate firstDay = LocalDate.now()
                .withDayOfMonth(1);

        LocalDateTime start = firstDay.atStartOfDay();

        LocalDateTime end = firstDay
                .plusMonths(1)
                .atStartOfDay()
                .minusNanos(1);

        return new Period(start, end);
    }

    private void validateInput(
            String email,
            String featureCode,
            String idempotencyKey
    ) {

        if (email == null || email.isBlank()) {
            throw new AccessDeniedException("Please log in to continue.");
        }

        if (!SubscriptionPlanCatalog.isValidFeature(featureCode)) {
            throw new IllegalArgumentException(
                    "Invalid subscription feature."
            );
        }

        if (idempotencyKey == null || idempotencyKey.isBlank()
                || idempotencyKey.length() > 150) {
            throw new IllegalArgumentException(
                    "A valid idempotency key is required."
            );
        }
    }

    private long safeValue(Long value) {
        return value == null ? 0L : value;
    }

    private record Period(
            LocalDateTime start,
            LocalDateTime end
    ) {
    }
}
