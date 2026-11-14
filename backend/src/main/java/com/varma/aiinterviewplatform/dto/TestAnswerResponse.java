
package com.varma.aiinterviewplatform.dto;

/**
 * Safe response returned after saving a Test Center answer.
 * Correct answers are intentionally excluded during the exam.
 */
public class TestAnswerResponse {

    private Long questionId;
    private boolean saved;
    private boolean answered;
    private boolean markedForReview;
    private String message;

    public TestAnswerResponse() {
    }

    public TestAnswerResponse(
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
