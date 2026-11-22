
package com.varma.aiinterviewplatform.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String questionText;

    private String technology;

    private String difficulty;

    private String category;

    private String questionType;

    private String optionA;

    private String optionB;

    private String optionC;

    private String optionD;

    private String correctOption;

    @Column(columnDefinition = "TEXT")
    private String correctOptions;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    public Question() {
    }

    // Constructor for descriptive / technical questions.
    public Question(
            String questionText,
            String technology,
            String difficulty,
            String category) {

        this.questionText = questionText;
        this.technology = technology;
        this.difficulty = difficulty;
        this.category = category;
        this.questionType = "DESCRIPTIVE";
    }

    // Constructor for MCQ questions.
    public Question(
            String questionText,
            String technology,
            String difficulty,
            String category,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            String correctOption,
            String explanation) {

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
        this.explanation = explanation;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
        this.questionType = questionType;
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

    @JsonIgnore
    public String getCorrectOption() {
        return correctOption;
    }

    public void setCorrectOption(String correctOption) {
        this.correctOption = correctOption;
    }

    @JsonIgnore
    public String getCorrectOptions() {
        return correctOptions;
    }

    public void setCorrectOptions(String correctOptions) {
        this.correctOptions = correctOptions;
    }

    @JsonIgnore
    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
