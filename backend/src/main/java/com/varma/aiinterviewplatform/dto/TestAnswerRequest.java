
package com.varma.aiinterviewplatform.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * Request used to save or submit an answer in the Test Center.
 * MCQ: selectedOptions contains one option, such as ["A"].
 * MSQ: selectedOptions may contain multiple options, such as ["A", "C"].
 */
public class TestAnswerRequest {

    private Long questionId;

    private List<String> selectedOptions = new ArrayList<>();

    // Indicates whether the user marked this question for review.
    private boolean markedForReview;

    public TestAnswerRequest() {
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
