
package com.varma.aiinterviewplatform.dto;

import java.time.LocalDateTime;

public record UserProfileResponse(

        Long id,
        String name,
        String email,
        String role,
        Boolean emailVerified,

        String subscriptionPlan,
        Boolean trialUsed,

        LocalDateTime trialStartDate,
        LocalDateTime trialEndDate,

        LocalDateTime subscriptionStartDate,
        LocalDateTime subscriptionEndDate

) {
}
