package com.varma.aiinterviewplatform.dto;

public class RecommendationItemResponse {

    // Skill that needs improvement.
    private String skill;

    // Current score of the skill.
    private double score;

    // Priority based on the score.
    // HIGH, MEDIUM or LOW.
    private String priority;

    // Personalized learning recommendation.
    private String recommendation;

    // Empty constructor required by Jackson.
    public RecommendationItemResponse() {
    }

    // Constructor used by the service.
    public RecommendationItemResponse(
            String skill,
            double score,
            String priority,
            String recommendation) {

        this.skill = skill;
        this.score = score;
        this.priority = priority;
        this.recommendation = recommendation;
    }

    // Getter for skill.
    public String getSkill() {
        return skill;
    }

    // Setter for skill.
    public void setSkill(String skill) {
        this.skill = skill;
    }

    // Getter for score.
    public double getScore() {
        return score;
    }

    // Setter for score.
    public void setScore(double score) {
        this.score = score;
    }

    // Getter for priority.
    public String getPriority() {
        return priority;
    }

    // Setter for priority.
    public void setPriority(String priority) {
        this.priority = priority;
    }

    // Getter for recommendation.
    public String getRecommendation() {
        return recommendation;
    }

    // Setter for recommendation.
    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
}