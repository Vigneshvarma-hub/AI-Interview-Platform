package com.varma.aiinterviewplatform.dto;

public class InterviewQuestionResponse {

    private Long questionId;

    private String questionText;

    private String technology;

    private String difficulty;

    private String category;

    private int questionNumber;

    private int totalQuestions;

    public InterviewQuestionResponse() {
    }

    public InterviewQuestionResponse(
            Long questionId,
            String questionText,
            String technology,
            String difficulty,
            String category,
            int questionNumber,
            int totalQuestions) {

        this.questionId = questionId;
        this.questionText = questionText;
        this.technology = technology;
        this.difficulty = difficulty;
        this.category = category;
        this.questionNumber = questionNumber;
        this.totalQuestions = totalQuestions;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public String getQuestionText() {
        return questionText;
    }

    public String getTechnology() {
        return technology;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public String getCategory() {
        return category;
    }

    public int getQuestionNumber() {
        return questionNumber;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }
}