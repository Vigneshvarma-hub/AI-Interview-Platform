
package com.varma.aiinterviewplatform.dto.admin;

import java.util.List;

public class AdminUserDetailResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private Boolean active;

    private long totalAssessments;
    private long completedAssessments;
    private double averageScore;

    private List<AdminAssessmentResponse> assessments;

    public AdminUserDetailResponse() {
    }

    public AdminUserDetailResponse(
            Long id,
            String name,
            String email,
            String role,
            Boolean active,
            long totalAssessments,
            long completedAssessments,
            double averageScore,
            List<AdminAssessmentResponse> assessments) {

        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.active = active;
        this.totalAssessments = totalAssessments;
        this.completedAssessments = completedAssessments;
        this.averageScore = averageScore;
        this.assessments = assessments;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
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

    public double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(double averageScore) {
        this.averageScore = averageScore;
    }

    public List<AdminAssessmentResponse> getAssessments() {
        return assessments;
    }

    public void setAssessments(
            List<AdminAssessmentResponse> assessments) {
        this.assessments = assessments;
    }
}