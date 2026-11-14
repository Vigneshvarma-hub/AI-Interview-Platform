package com.varma.aiinterviewplatform.dto;

public class AiInterviewAnswerResponse {

    // ID of the saved answer.
    private Long answerId;

    // ID of the question that was answered.
    private Long questionId;

    // Candidate's submitted answer.
    private String answerText;

    // Score given to the candidate.
    private Double score;

    // AI evaluation feedback.
    private String feedback;

    // Current question number.
    private int questionNumber;

    // Total number of questions.
    private int totalQuestions;

    // Indicates whether another question is available.
    private boolean hasNextQuestion;

    // Default constructor required by Spring.
    public AiInterviewAnswerResponse() {
    }

    // Constructor for creating the response.
    public AiInterviewAnswerResponse(
            Long answerId,
            Long questionId,
            String answerText,
            Double score,
            String feedback,
            int questionNumber,
            int totalQuestions,
            boolean hasNextQuestion) {

        this.answerId = answerId;
        this.questionId = questionId;
        this.answerText = answerText;
        this.score = score;
        this.feedback = feedback;
        this.questionNumber = questionNumber;
        this.totalQuestions = totalQuestions;
        this.hasNextQuestion = hasNextQuestion;
    }

    // Getter for answer ID.
    public Long getAnswerId() {
        return answerId;
    }

    // Setter for answer ID.
    public void setAnswerId(Long answerId) {
        this.answerId = answerId;
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

    // Getter for score.
    public Double getScore() {
        return score;
    }

    // Setter for score.
    public void setScore(Double score) {
        this.score = score;
    }

    // Getter for feedback.
    public String getFeedback() {
        return feedback;
    }

    // Setter for feedback.
    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    // Getter for question number.
    public int getQuestionNumber() {
        return questionNumber;
    }

    // Setter for question number.
    public void setQuestionNumber(int questionNumber) {
        this.questionNumber = questionNumber;
    }

    // Getter for total questions.
    public int getTotalQuestions() {
        return totalQuestions;
    }

    // Setter for total questions.
    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    // Getter for next-question availability.
    public boolean isHasNextQuestion() {
        return hasNextQuestion;
    }

    // Setter for next-question availability.
    public void setHasNextQuestion(boolean hasNextQuestion) {
        this.hasNextQuestion = hasNextQuestion;
    }
}