package com.varma.aiinterviewplatform.dto.admin;

import java.time.LocalDateTime;

public class AdminAssessmentResponse {

    private Long id;
    private String userName;
    private String userEmail;
    private String technology;
    private String difficulty;
    private String status;
    private Double score;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public AdminAssessmentResponse() {
    }

    public AdminAssessmentResponse(
            Long id,
            String userName,
            String userEmail,
            String technology,
            String difficulty,
            String status,
            Double score,
            LocalDateTime createdAt,
            LocalDateTime completedAt) {

        this.id = id;
        this.userName = userName;
        this.userEmail = userEmail;
        this.technology = technology;
        this.difficulty = difficulty;
        this.status = status;
        this.score = score;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getTechnology() {
        return technology;
    }

    public void setTechnology(String technology) {
        this.technology = technology;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}