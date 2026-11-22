
package com.varma.aiinterviewplatform.service;

import java.util.Map;

public final class SubscriptionPlanCatalog {

    private SubscriptionPlanCatalog() {
    }

    public static final String FREE = "FREE";
    public static final String TRIAL = "TRIAL";
    public static final String WEEKLY = "WEEKLY";
    public static final String MONTHLY = "MONTHLY";
    public static final String YEARLY = "YEARLY";

    public static final String AI_INTERVIEW = "AI_INTERVIEW";
    public static final String RESUME_ANALYSIS = "RESUME_ANALYSIS";
    public static final String MCQ = "MCQ";
    public static final String TEST_CENTER = "TEST_CENTER";
    public static final String CODING = "CODING";

    public static final String RESERVED = "RESERVED";
    public static final String CONSUMED = "CONSUMED";
    public static final String RELEASED = "RELEASED";

    public record Plan(
            String code,
            String name,
            long priceInPaise,
            String billingCycle,
            Map<String, Integer> limits
    ) {
        public int getLimit(String feature) {
            return limits.getOrDefault(feature, 0);
        }
    }

    private static Map<String, Integer> limits(
            int aiInterview,
            int resume,
            int mcq,
            int testCenter,
            int coding
    ) {
        return Map.of(
                AI_INTERVIEW, aiInterview,
                RESUME_ANALYSIS, resume,
                MCQ, mcq,
                TEST_CENTER, testCenter,
                CODING, coding
        );
    }

    private static final Map<String, Plan> PLANS = Map.of(
            FREE,
            new Plan(
                    FREE,
                    "Free",
                    0,
                    "LIFETIME",
                    limits(3, 1, 3, 2, 2)
            ),

            TRIAL,
            new Plan(
                    TRIAL,
                    "7-Day Trial",
                    0,
                    "TRIAL",
                    limits(10, 10, 10, 5, 5)
            ),

            WEEKLY,
            new Plan(
                    WEEKLY,
                    "Weekly",
                    9900,
                    "WEEKLY",
                    limits(5, 10, 10, 5, 5)
            ),

            MONTHLY,
            new Plan(
                    MONTHLY,
                    "Monthly",
                    29900,
                    "MONTHLY",
                    limits(30, 50, 50, 30, 30)
            ),

            YEARLY,
            new Plan(
                    YEARLY,
                    "Yearly",
                    199900,
                    "YEARLY",
                    limits(100, 150, 150, 100, 100)
            )
    );

    public static Plan getPlan(String planCode) {

        if (planCode == null || planCode.isBlank()) {
            return PLANS.get(FREE);
        }

        String normalized = planCode.trim().toUpperCase();

        // Backward compatibility with the old User entity value.
        if ("PREMIUM".equals(normalized)) {
            normalized = MONTHLY;
        }

        Plan plan = PLANS.get(normalized);

        if (plan == null) {
            throw new IllegalArgumentException(
                    "Unknown subscription plan: " + planCode
            );
        }

        return plan;
    }

    public static Map<String, Plan> getAllPlans() {
        return PLANS;
    }

    public static boolean isValidFeature(String featureCode) {
        return limits(0, 0, 0, 0, 0)
                .containsKey(featureCode);
    }
}
