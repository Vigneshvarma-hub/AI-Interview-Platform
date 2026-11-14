
package com.varma.aiinterviewplatform.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "questions")
public class Question {

    // Primary key.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Main question text.
    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;

    // Subject or technology: Java, DBMS, OS, DSA, etc.
    @Column(nullable = false)
    private String technology;

    // EASY, MEDIUM, HARD.
    @Column(nullable = false)
    private String difficulty;

    // Topic within the subject, such as OOP or Collections.
    private String category;

    // MCQ or MSQ. Existing questions default to MCQ only
    // when they already have valid options; descriptive
    // interview questions can leave this field null.
    @Column(name = "question_type", length = 10)
    private String questionType;

    // Four options used by the current assessment system.
    @Column(columnDefinition = "TEXT")
    private String optionA;

    @Column(columnDefinition = "TEXT")
    private String optionB;

    @Column(columnDefinition = "TEXT")
    private String optionC;

    @Column(columnDefinition = "TEXT")
    private String optionD;

    // Existing single-correct-option field.
    // Preserve it for compatibility with current MCQ code.
    private String correctOption;

    // MSQ answers stored as comma-separated option letters.
    // Example: A,C,D
    // The backend must never expose this field during an exam.
    @Column(name = "correct_options", length = 20)
    private String correctOptions;

    // Explanation shown in the Analyze tab after submission.
    @Column(columnDefinition = "TEXT")
    private String explanation;

    public Question() {
    }

    // Existing constructor for descriptive interview questions.
    public Question(
            String questionText,
            String technology,
            String difficulty,
            String category) {

        this.questionText = questionText;
        this.technology = technology;
        this.difficulty = difficulty;
        this.category = category;
    }

    // Existing constructor for single-answer MCQs.
    public Question(
            String questionText,
            String technology,
            String difficulty,
            String category,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            String correctOption) {

        this.questionText = questionText;
        this.technology = technology;
        this.difficulty = difficulty;
        this.category = category;
        this.questionType = "MCQ";
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.correctOption = correctOption;
    }

    public Long getId() {
        return id;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        if (questionType != null
                && !questionType.equalsIgnoreCase("MCQ")
                && !questionType.equalsIgnoreCase("MSQ")) {
            throw new IllegalArgumentException(
                    "Question type must be MCQ or MSQ");
        }

        this.questionType = questionType == null
                ? null
                : questionType.trim().toUpperCase();
    }

    public String getOptionA() {
        return optionA;
    }

    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }

    public String getCorrectOption() {
        return correctOption;
    }

    public void setCorrectOption(String correctOption) {
        this.correctOption = correctOption;
    }

    public String getCorrectOptions() {
        return correctOptions;
    }

    public void setCorrectOptions(String correctOptions) {
        this.correctOptions = correctOptions;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
