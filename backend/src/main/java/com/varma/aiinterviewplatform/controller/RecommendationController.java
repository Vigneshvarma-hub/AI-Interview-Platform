package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.RecommendationResponse;
import com.varma.aiinterviewplatform.service.RecommendationService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    // Constructor injection for RecommendationService.
    public RecommendationController(
            RecommendationService recommendationService) {

        this.recommendationService = recommendationService;
    }

    // Returns personalized learning recommendations
    // for the currently logged-in user.
    @GetMapping("/my")
    public RecommendationResponse getMyRecommendations(
            Authentication authentication) {

        // JWT authentication contains the logged-in user's email.
        String email = authentication.getName();

        // Generate recommendations using the user's
        // completed interview performance.
        return recommendationService.getMyRecommendations(
                email
        );
    }
}