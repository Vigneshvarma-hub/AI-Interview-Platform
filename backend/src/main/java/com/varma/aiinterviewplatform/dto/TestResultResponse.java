
package com.varma.aiinterviewplatform.dto;

import java.util.List;
import java.util.Map;

/**
 * Final Test Center result and question-wise analysis.
 */
public class TestResultResponse {

    private Long testId;
    private String technology;
    private String difficulty;
    private String status;

    private int totalQuestions;
    private int answeredQuestions;
    private int unansweredQuestions;
    private int correctAnswers;
    private int incorrectAnswers;
    private int markedForReviewCount;

    private double totalScore;
    private double percentage;
    private double averageScore;
    private double highestScore;

    private Map<String, Double> topicScores;
    private List<TestQuestionAnalysisResponse> analysis;

    public TestResultResponse() {
    }

    public TestResultResponse(
            Long testId,
            String technology,
            String difficulty,
            String status,
            int totalQuestions,
            int answeredQuestions,
            int unansweredQuestions,
            int correctAnswers,
            int incorrectAnswers,
            int markedForReviewCount,
            double totalScore,
            double percentage,
            double averageScore,
            double highestScore,
            Map<String, Double> topicScores,
            List<TestQuestionAnalysisResponse> analysis) {
        this.testId = testId;
        this.technology = technology;
        this.difficulty = difficulty;
        this.status = status;
        this.totalQuestions = totalQuestions;
        this.answeredQuestions = answeredQuestions;
        this.unansweredQuestions = unansweredQuestions;
        this.correctAnswers = correctAnswers;
        this.incorrectAnswers = incorrectAnswers;
        this.markedForReviewCount = markedForReviewCount;
        this.totalScore = totalScore;
        this.percentage = percentage;
        this.averageScore = averageScore;
        this.highestScore = highestScore;
        this.topicScores = topicScores;
        this.analysis = analysis;
    }

    public Long getTestId() { return testId; }
    public String getTechnology() { return technology; }
    public String getDifficulty() { return difficulty; }
    public String getStatus() { return status; }
    public int getTotalQuestions() { return totalQuestions; }
    public int getAnsweredQuestions() { return answeredQuestions; }
    public int getUnansweredQuestions() { return unansweredQuestions; }
    public int getCorrectAnswers() { return correctAnswers; }
    public int getIncorrectAnswers() { return incorrectAnswers; }
    public int getMarkedForReviewCount() { return markedForReviewCount; }
    public double getTotalScore() { return totalScore; }
    public double getPercentage() { return percentage; }
    public double getAverageScore() { return averageScore; }
    public double getHighestScore() { return highestScore; }
    public Map<String, Double> getTopicScores() { return topicScores; }
    public List<TestQuestionAnalysisResponse> getAnalysis() { return analysis; }
}
