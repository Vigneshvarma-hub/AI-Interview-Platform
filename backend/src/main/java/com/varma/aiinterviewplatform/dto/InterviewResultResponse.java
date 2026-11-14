package com.varma.aiinterviewplatform.dto;

public class InterviewResultResponse {

    private Long interviewId;
    private String technology;
    private String difficulty;
    private String status;
    private Double finalScore;
    private int totalQuestions;
    private int answeredQuestions;

    public InterviewResultResponse(
            Long interviewId,
            String technology,
            String difficulty,
            String status,
            Double finalScore,
            int totalQuestions,
            int answeredQuestions) {

        this.interviewId = interviewId;
        this.technology = technology;
        this.difficulty = difficulty;
        this.status = status;
        this.finalScore = finalScore;
        this.totalQuestions = totalQuestions;
        this.answeredQuestions = answeredQuestions;
    }

    public Long getInterviewId() {
        return interviewId;
    }

    public String getTechnology() {
        return technology;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public String getStatus() {
        return status;
    }

    public Double getFinalScore() {
        return finalScore;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public int getAnsweredQuestions() {
        return answeredQuestions;
    }
}