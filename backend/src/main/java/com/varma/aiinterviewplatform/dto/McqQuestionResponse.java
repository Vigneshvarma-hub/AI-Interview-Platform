package com.varma.aiinterviewplatform.dto;

// This DTO sends an MCQ question to the client
// without exposing the correct answer.
public class McqQuestionResponse {

    // Unique ID of the question.
    private Long questionId;

    // Question text.
    private String questionText;

    // Technology of the question.
    private String technology;

    // Difficulty level.
    private String difficulty;

    // Skill/category of the question.
    private String category;

    // Multiple-choice option A.
    private String optionA;

    // Multiple-choice option B.
    private String optionB;

    // Multiple-choice option C.
    private String optionC;

    // Multiple-choice option D.
    private String optionD;

    // Default constructor required for JSON conversion.
    public McqQuestionResponse() {
    }

    // Constructor used when converting a Question entity
    // into a response object.
    public McqQuestionResponse(
            Long questionId,
            String questionText,
            String technology,
            String difficulty,
            String category,
            String optionA,
            String optionB,
            String optionC,
            String optionD) {

        this.questionId = questionId;
        this.questionText = questionText;
        this.technology = technology;
        this.difficulty = difficulty;
        this.category = category;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
    }

    // Returns question ID.
    public Long getQuestionId() {
        return questionId;
    }

    // Sets question ID.
    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    // Returns question text.
    public String getQuestionText() {
        return questionText;
    }

    // Sets question text.
    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    // Returns technology.
    public String getTechnology() {
        return technology;
    }

    // Sets technology.
    public void setTechnology(String technology) {
        this.technology = technology;
    }

    // Returns difficulty.
    public String getDifficulty() {
        return difficulty;
    }

    // Sets difficulty.
    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    // Returns category.
    public String getCategory() {
        return category;
    }

    // Sets category.
    public void setCategory(String category) {
        this.category = category;
    }

    // Returns option A.
    public String getOptionA() {
        return optionA;
    }

    // Sets option A.
    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }

    // Returns option B.
    public String getOptionB() {
        return optionB;
    }

    // Sets option B.
    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }

    // Returns option C.
    public String getOptionC() {
        return optionC;
    }

    // Sets option C.
    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }

    // Returns option D.
    public String getOptionD() {
        return optionD;
    }

    // Sets option D.
    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }
}