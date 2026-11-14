package com.varma.aiinterviewplatform.dto;

import java.util.List;

public class SkillAnalysisResponse {

    // Total number of completed interviews.
    private int totalInterviews;

    // Average score across all completed interviews.
    private double overallAverageScore;

    // Technology-wise performance details.
    private List<TechnologyPerformanceResponse> technologyPerformance;

    // Empty constructor required by Spring/Jackson.
    public SkillAnalysisResponse() {
    }

    // Constructor used by the service to create the final response.
    public SkillAnalysisResponse(
            int totalInterviews,
            double overallAverageScore,
            List<TechnologyPerformanceResponse> technologyPerformance) {

        this.totalInterviews = totalInterviews;
        this.overallAverageScore = overallAverageScore;
        this.technologyPerformance = technologyPerformance;
    }

    // Getter for total interviews.
    public int getTotalInterviews() {
        return totalInterviews;
    }

    // Setter for total interviews.
    public void setTotalInterviews(int totalInterviews) {
        this.totalInterviews = totalInterviews;
    }

    // Getter for overall average score.
    public double getOverallAverageScore() {
        return overallAverageScore;
    }

    // Setter for overall average score.
    public void setOverallAverageScore(double overallAverageScore) {
        this.overallAverageScore = overallAverageScore;
    }

    // Getter for technology performance.
    public List<TechnologyPerformanceResponse> getTechnologyPerformance() {
        return technologyPerformance;
    }

    // Setter for technology performance.
    public void setTechnologyPerformance(
            List<TechnologyPerformanceResponse> technologyPerformance) {

        this.technologyPerformance = technologyPerformance;
    }
}