package com.varma.aiinterviewplatform.dto;

import java.util.List;

public class RecommendationResponse {

    // List of personalized recommendations.
    private List<RecommendationItemResponse> recommendations;

    // Empty constructor required by Jackson.
    public RecommendationResponse() {
    }

    // Constructor used by the service.
    public RecommendationResponse(
            List<RecommendationItemResponse> recommendations) {

        this.recommendations = recommendations;
    }

    // Getter for recommendations.
    public List<RecommendationItemResponse> getRecommendations() {
        return recommendations;
    }

    // Setter for recommendations.
    public void setRecommendations(
            List<RecommendationItemResponse> recommendations) {

        this.recommendations = recommendations;
    }
}