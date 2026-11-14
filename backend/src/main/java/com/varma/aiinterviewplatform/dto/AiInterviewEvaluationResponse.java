package com.varma.aiinterviewplatform.dto;

public class AiInterviewEvaluationResponse {

    // Question ID.
    private Long questionId;

    // Question text.
    private String questionText;

    // Candidate's submitted answer.
    private String answerText;

    // Score received for this question.
    private Double score;

    // AI/mock evaluation feedback.
    private String feedback;

    // Constructor.
    public AiInterviewEvaluationResponse(
            Long questionId,
            String questionText,
            String answerText,
            Double score,
            String feedback) {

        this.questionId = questionId;
        this.questionText = questionText;
        this.answerText = answerText;
        this.score = score;
        this.feedback = feedback;
    }

    // Getter for question ID.
    public Long getQuestionId() {
        return questionId;
    }

    // Getter for question text.
    public String getQuestionText() {
        return questionText;
    }

    // Getter for candidate answer.
    public String getAnswerText() {
        return answerText;
    }

    // Getter for score.
    public Double getScore() {
        return score;
    }

    // Getter for feedback.
    public String getFeedback() {
        return feedback;
    }
}