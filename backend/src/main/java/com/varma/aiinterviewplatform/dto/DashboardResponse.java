package com.varma.aiinterviewplatform.dto;

import java.util.List;
import java.util.Map;

public class DashboardResponse {

    private long totalInterviews;
    private long completedInterviews;
    private double averageScore;
    private double latestScore;
    private Map<String, Double> categoryScores;
    private List<String> weakSkills;

    public DashboardResponse() {
    }

    public DashboardResponse(
            long totalInterviews,
            long completedInterviews,
            double averageScore,
            double latestScore,
            Map<String, Double> categoryScores,
            List<String> weakSkills) {

        this.totalInterviews = totalInterviews;
        this.completedInterviews = completedInterviews;
        this.averageScore = averageScore;
        this.latestScore = latestScore;
        this.categoryScores = categoryScores;
        this.weakSkills = weakSkills;
    }

    public long getTotalInterviews() {
        return totalInterviews;
    }

    public long getCompletedInterviews() {
        return completedInterviews;
    }

    public double getAverageScore() {
        return averageScore;
    }

    public double getLatestScore() {
        return latestScore;
    }

    public Map<String, Double> getCategoryScores() {
        return categoryScores;
    }

    public List<String> getWeakSkills() {
        return weakSkills;
    }
}
