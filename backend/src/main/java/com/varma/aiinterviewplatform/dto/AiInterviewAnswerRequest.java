package com.varma.aiinterviewplatform.dto;

public class AiInterviewAnswerRequest {

    // ID of the question being answered.
    private Long questionId;

    // Candidate's answer to the interview question.
    private String answerText;

    // Default constructor required by Spring.
    public AiInterviewAnswerRequest() {
    }

    // Constructor for creating an answer request.
    public AiInterviewAnswerRequest(
            Long questionId,
            String answerText) {

        this.questionId = questionId;
        this.answerText = answerText;
    }

    // Getter for question ID.
    public Long getQuestionId() {
        return questionId;
    }

    // Setter for question ID.
    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    // Getter for candidate answer.
    public String getAnswerText() {
        return answerText;
    }

    // Setter for candidate answer.
    public void setAnswerText(String answerText) {
        this.answerText = answerText;
    }
}