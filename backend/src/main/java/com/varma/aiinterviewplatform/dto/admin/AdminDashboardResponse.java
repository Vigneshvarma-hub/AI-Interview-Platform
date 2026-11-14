package com.varma.aiinterviewplatform.dto.admin;

public class AdminDashboardResponse {

    private long totalUsers;
    private long totalAssessments;
    private long completedAssessments;
    private long pendingAssessments;
    private long totalAnswers;
    private double averageScore;

    public AdminDashboardResponse() {
    }

    public AdminDashboardResponse(
            long totalUsers,
            long totalAssessments,
            long completedAssessments,
            long pendingAssessments,
            long totalAnswers,
            double averageScore) {

        this.totalUsers = totalUsers;
        this.totalAssessments = totalAssessments;
        this.completedAssessments = completedAssessments;
        this.pendingAssessments = pendingAssessments;
        this.totalAnswers = totalAnswers;
        this.averageScore = averageScore;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalAssessments() {
        return totalAssessments;
    }

    public void setTotalAssessments(long totalAssessments) {
        this.totalAssessments = totalAssessments;
    }

    public long getCompletedAssessments() {
        return completedAssessments;
    }

    public void setCompletedAssessments(long completedAssessments) {
        this.completedAssessments = completedAssessments;
    }

    public long getPendingAssessments() {
        return pendingAssessments;
    }

    public void setPendingAssessments(long pendingAssessments) {
        this.pendingAssessments = pendingAssessments;
    }

    public long getTotalAnswers() {
        return totalAnswers;
    }

    public void setTotalAnswers(long totalAnswers) {
        this.totalAnswers = totalAnswers;
    }

    public double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(double averageScore) {
        this.averageScore = averageScore;
    }
}