
package com.varma.aiinterviewplatform.dto;

public class McqEvaluationResponse {

    private Long questionId;

    private String selectedOption;

    private String correctOption;

    private boolean correct;

    private Double score;

    private String feedback;

    public McqEvaluationResponse() {
    }

    public McqEvaluationResponse(
            Long questionId,
            String selectedOption,
            String correctOption,
            boolean correct,
            Double score,
            String feedback) {

        this.questionId = questionId;
        this.selectedOption = selectedOption;
        this.correctOption = correctOption;
        this.correct = correct;
        this.score = score;
        this.feedback = feedback;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getSelectedOption() {
        return selectedOption;
    }

    public void setSelectedOption(String selectedOption) {
        this.selectedOption = selectedOption;
    }

    public String getCorrectOption() {
        return correctOption;
    }

    public void setCorrectOption(String correctOption) {
        this.correctOption = correctOption;
    }

    public boolean isCorrect() {
        return correct;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}