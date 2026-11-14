
package com.varma.aiinterviewplatform.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response returned after a Test Center test starts successfully.
 * Questions contain options but never contain correct answers.
 */
public class TestStartResponse {

    private Long testId;
    private String technology;
    private String difficulty;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private int durationMinutes;
    private int totalQuestions;
    private List<TestQuestionResponse> questions;

    public TestStartResponse() {
    }

    public TestStartResponse(
            Long testId,
            String technology,
            String difficulty,
            String status,
            LocalDateTime startedAt,
            LocalDateTime expiresAt,
            int durationMinutes,
            int totalQuestions,
            List<TestQuestionResponse> questions) {

        this.testId = testId;
        this.technology = technology;
        this.difficulty = difficulty;
        this.status = status;
        this.startedAt = startedAt;
        this.expiresAt = expiresAt;
        this.durationMinutes = durationMinutes;
        this.totalQuestions = totalQuestions;
        this.questions = questions;
    }

    public Long getTestId() {
        return testId;
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

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public List<TestQuestionResponse> getQuestions() {
        return questions;
    }
}
