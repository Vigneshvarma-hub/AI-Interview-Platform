
package com.varma.aiinterviewplatform.dto;

/**
 * Request received when a user starts a Test Center exam.
 */
public class TestStartRequest {

    // Subject or technology, such as Java, DBMS, OS, or DSA.
    private String technology;

    // EASY, MEDIUM, or HARD.
    private String difficulty;

    // Requested number of questions.
    private Integer questionCount;

    // Requested duration in minutes.
    // The backend must validate and enforce the actual duration.
    private Integer durationMinutes;

    public TestStartRequest() {
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

    public Integer getQuestionCount() {
        return questionCount;
    }

    public void setQuestionCount(Integer questionCount) {
        this.questionCount = questionCount;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
}
