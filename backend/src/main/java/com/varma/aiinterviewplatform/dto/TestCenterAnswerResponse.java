
package com.varma.aiinterviewplatform.dto;

/**
 * Safe response after saving an answer during a test.
 * Does not reveal the correct answer.
 */
public class TestCenterAnswerResponse {

    private Long questionId;
    private boolean saved;
    private boolean answered;
    private boolean markedForReview;
    private String message;

    public TestCenterAnswerResponse() {
    }

    public TestCenterAnswerResponse(
            Long questionId,
            boolean saved,
            boolean answered,
            boolean markedForReview,
            String message) {
        this.questionId = questionId;
        this.saved = saved;
        this.answered = answered;
        this.markedForReview = markedForReview;
        this.message = message;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public boolean isSaved() {
        return saved;
    }

    public boolean isAnswered() {
        return answered;
    }

    public boolean isMarkedForReview() {
        return markedForReview;
    }

    public String getMessage() {
        return message;
    }
}
