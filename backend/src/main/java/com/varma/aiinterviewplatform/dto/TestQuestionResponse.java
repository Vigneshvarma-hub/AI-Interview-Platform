
package com.varma.aiinterviewplatform.dto;

/**
 * Safe question response for the Test Center.
 *
 * IMPORTANT:
 * This DTO intentionally excludes correct answers and explanations.
 * Those details must only be returned after the test is submitted.
 */
public class TestQuestionResponse {

    private Long questionId;
    private String questionText;
    private String technology;
    private String difficulty;
    private String category;
    private String questionType;

    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    private int questionNumber;
    private int totalQuestions;

    public TestQuestionResponse() {
    }

    public TestQuestionResponse(
            Long questionId,
            String questionText,
            String technology,
            String difficulty,
            String category,
            String questionType,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            int questionNumber,
            int totalQuestions) {

        this.questionId = questionId;
        this.questionText = questionText;
        this.technology = technology;
        this.difficulty = difficulty;
        this.category = category;
        this.questionType = questionType;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.questionNumber = questionNumber;
        this.totalQuestions = totalQuestions;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public String getQuestionText() {
        return questionText;
    }

    public String getTechnology() {
        return technology;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public String getCategory() {
        return category;
    }

    public String getQuestionType() {
        return questionType;
    }

    public String getOptionA() {
        return optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public int getQuestionNumber() {
        return questionNumber;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }
}
