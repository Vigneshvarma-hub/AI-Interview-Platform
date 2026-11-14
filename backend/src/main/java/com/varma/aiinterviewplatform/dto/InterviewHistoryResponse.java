
package com.varma.aiinterviewplatform.dto;

import java.time.LocalDateTime;

public class InterviewHistoryResponse {

    private Long interviewId;

    private String technology;

    private String difficulty;

    private String status;

    private Double score;

    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    public InterviewHistoryResponse() {
    }

    public InterviewHistoryResponse(
            Long interviewId,
            String technology,
            String difficulty,
            String status,
            Double score,
            LocalDateTime createdAt,
            LocalDateTime completedAt
    ) {
        this.interviewId = interviewId;
        this.technology = technology;
        this.difficulty = difficulty;
        this.status = status;
        this.score = score;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
    }

    public Long getInterviewId() {
        return interviewId;
    }

    public void setInterviewId(Long interviewId) {
        this.interviewId = interviewId;
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