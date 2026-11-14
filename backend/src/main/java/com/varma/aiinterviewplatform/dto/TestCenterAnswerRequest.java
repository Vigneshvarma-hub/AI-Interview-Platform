
package com.varma.aiinterviewplatform.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * Request for saving a Test Center answer.
 * MCQ example: ["B"]
 * MSQ example: ["A", "C"]
 *
 * An empty list means the user has not selected an answer.
 */
public class TestCenterAnswerRequest {

    private Long questionId;

    private List<String> selectedOptions = new ArrayList<>();

    private boolean markedForReview;

    public TestCenterAnswerRequest() {
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public List<String> getSelectedOptions() {
        return selectedOptions;
    }

    public void setSelectedOptions(List<String> selectedOptions) {
        this.selectedOptions = selectedOptions == null
                ? new ArrayList<>()
                : new ArrayList<>(selectedOptions);
    }

    public boolean isMarkedForReview() {
        return markedForReview;
    }

    public void setMarkedForReview(boolean markedForReview) {
        this.markedForReview = markedForReview;
    }
}
