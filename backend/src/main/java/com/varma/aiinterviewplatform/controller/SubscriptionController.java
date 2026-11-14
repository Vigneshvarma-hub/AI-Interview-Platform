
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.entity.User;
import com.varma.aiinterviewplatform.service.SubscriptionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    // Get the subscription status of the currently authenticated user.
    @GetMapping("/status")
    public ResponseEntity<?> getSubscriptionStatus(
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please log in first."));
        }

        try {
            // Never accept an email from the request body for this operation.
            String email = authentication.getName();

            User user = subscriptionService.getSubscriptionStatus(email);

            return ResponseEntity.ok(buildSubscriptionResponse(user));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    // Start a free trial for the currently authenticated user.
    @PostMapping("/start-trial")
    public ResponseEntity<?> startFreeTrial(
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please log in first."));
        }

        try {
            // The user identity comes from Spring Security's authentication.
            String email = authentication.getName();

            User user = subscriptionService.startFreeTrial(email);

            return ResponseEntity.ok(buildSubscriptionResponse(user));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    // Return only subscription information, never password or other account data.
    private Map<String, Object> buildSubscriptionResponse(User user) {
        Map<String, Object> response = new LinkedHashMap<>();

        response.put("plan", user.getSubscriptionPlan());
        response.put("trialUsed", user.getTrialUsed());
        response.put("trialStartDate", user.getTrialStartDate());
        response.put("trialEndDate", user.getTrialEndDate());
        response.put("subscriptionStartDate", user.getSubscriptionStartDate());
        response.put("subscriptionEndDate", user.getSubscriptionEndDate());

        return response;
    }
}
