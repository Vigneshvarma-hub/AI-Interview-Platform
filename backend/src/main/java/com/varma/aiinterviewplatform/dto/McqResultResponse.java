package com.varma.aiinterviewplatform.dto;

public class McqResultResponse {

    private int totalQuestions;
    private int correctAnswers;
    private int incorrectAnswers;
    private double score;
    private double percentage;

    public McqResultResponse() {
    }

    public McqResultResponse(
            int totalQuestions,
            int correctAnswers,
            int incorrectAnswers,
            double score,
            double percentage) {

        this.totalQuestions = totalQuestions;
        this.correctAnswers = correctAnswers;
        this.incorrectAnswers = incorrectAnswers;
        this.score = score;
        this.percentage = percentage;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public int getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(int correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public int getIncorrectAnswers() {
        return incorrectAnswers;
    }

    public void setIncorrectAnswers(int incorrectAnswers) {
        this.incorrectAnswers = incorrectAnswers;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}