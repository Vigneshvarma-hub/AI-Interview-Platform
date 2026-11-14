
package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.entity.User;
import com.varma.aiinterviewplatform.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
public class SubscriptionService {

    private static final int TRIAL_DURATION_DAYS = 7;

    private final UserRepository userRepository;

    public SubscriptionService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Start a seven-day Premium trial for an eligible account.
    @Transactional
    public User startFreeTrial(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User account not found."));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new IllegalArgumentException("This account is inactive.");
        }

        // Only verified accounts can start a trial.
        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new IllegalArgumentException(
                    "Please verify your email before starting a trial.");
        }

        // Prevent users from starting a second trial.
        if (Boolean.TRUE.equals(user.getTrialUsed())) {
            throw new IllegalArgumentException(
                    "Your free trial has already been used.");
        }

        LocalDateTime now = LocalDateTime.now();

        // Save the trial dates and mark the trial as used.
        user.setSubscriptionPlan("TRIAL");
        user.setTrialUsed(true);
        user.setTrialStartDate(now);
        user.setTrialEndDate(now.plusDays(TRIAL_DURATION_DAYS));

        return userRepository.save(user);
    }

    // Check trial expiry and return the user's current subscription.
    @Transactional
    public User getSubscriptionStatus(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User account not found."));

        // Expired trials automatically return to the Free plan.
        if ("TRIAL".equals(user.getSubscriptionPlan())
                && user.getTrialEndDate() != null
                && !LocalDateTime.now().isBefore(user.getTrialEndDate())) {

            user.setSubscriptionPlan("FREE");
            userRepository.save(user);
        }

        // Expired paid subscriptions also return to the Free plan.
        if ("PREMIUM".equals(user.getSubscriptionPlan())
                && user.getSubscriptionEndDate() != null
                && !LocalDateTime.now().isBefore(
                user.getSubscriptionEndDate())) {

            user.setSubscriptionPlan("FREE");
            userRepository.save(user);
        }

        return user;
    }
}
