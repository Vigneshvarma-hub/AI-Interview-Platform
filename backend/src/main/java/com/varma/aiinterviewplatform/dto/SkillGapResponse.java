package com.varma.aiinterviewplatform.dto;

import java.util.List;
import java.util.Map;

// This DTO sends skill-gap analysis details to the frontend or Postman.
public class SkillGapResponse {

    // Stores the interview ID.
    private Long interviewId;

    // Stores the overall interview score.
    private Double overallScore;

    // Stores category-wise scores.
    // Example: OOP = 8.5, Collections = 6.0
    private Map<String, Double> categoryScores;

    // Stores the skills or categories where the candidate is weak.
    private List<String> weakSkills;

    // Default constructor required for object creation.
    public SkillGapResponse() {
    }

    // Constructor used to create the complete response object.
    public SkillGapResponse(
            Long interviewId,
            Double overallScore,
            Map<String, Double> categoryScores,
            List<String> weakSkills) {

        this.interviewId = interviewId;
        this.overallScore = overallScore;
        this.categoryScores = categoryScores;
        this.weakSkills = weakSkills;
    }

    // Returns the interview ID.
    public Long getInterviewId() {
        return interviewId;
    }

    // Sets the interview ID.
    public void setInterviewId(Long interviewId) {
        this.interviewId = interviewId;
    }

    // Returns the overall score.
    public Double getOverallScore() {
        return overallScore;
    }

    // Sets the overall score.
    public void setOverallScore(Double overallScore) {
        this.overallScore = overallScore;
    }

    // Returns category-wise scores.
    public Map<String, Double> getCategoryScores() {
        return categoryScores;
    }

    // Sets category-wise scores.
    public void setCategoryScores(Map<String, Double> categoryScores) {
        this.categoryScores = categoryScores;
    }

    // Returns the weak skills list.
    public List<String> getWeakSkills() {
        return weakSkills;
    }

    // Sets the weak skills list.
    public void setWeakSkills(List<String> weakSkills) {
        this.weakSkills = weakSkills;
    }
}