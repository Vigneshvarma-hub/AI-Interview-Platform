package com.varma.aiinterviewplatform.dto;

public class AiInterviewResponse {

    // Unique ID of the AI interview.
    private Long interviewId;

    // Technology selected for the interview.
    private String technology;

    // Difficulty level of the interview.
    private String difficulty;

    // Current interview question.
    private String question;

    // Question number currently being displayed.
    private int questionNumber;

    // Total number of questions in the AI interview.
    private int totalQuestions;


    // Default constructor required by Spring.
    public AiInterviewResponse() {
    }


    // Constructor used to create the response.
    public AiInterviewResponse(
            Long interviewId,
            String technology,
            String difficulty,
            String question,
            int questionNumber,
            int totalQuestions) {

        this.interviewId = interviewId;
        this.technology = technology;
        this.difficulty = difficulty;
        this.question = question;
        this.questionNumber = questionNumber;
        this.totalQuestions = totalQuestions;
    }


    // Getter for interview ID.
    public Long getInterviewId() {
        return interviewId;
    }


    // Setter for interview ID.
    public void setInterviewId(Long interviewId) {
        this.interviewId = interviewId;
    }


    // Getter for technology.
    public String getTechnology() {
        return technology;
    }


    // Setter for technology.
    public void setTechnology(String technology) {
        this.technology = technology;
    }


    // Getter for difficulty.
    public String getDifficulty() {
        return difficulty;
    }


    // Setter for difficulty.
    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }


    // Getter for question.
    public String getQuestion() {
        return question;
    }


    // Setter for question.
    public void setQuestion(String question) {
        this.question = question;
    }


    // Getter for current question number.
    public int getQuestionNumber() {
        return questionNumber;
    }


    // Setter for current question number.
    public void setQuestionNumber(int questionNumber) {
        this.questionNumber = questionNumber;
    }


    // Getter for total questions.
    public int getTotalQuestions() {
        return totalQuestions;
    }


    // Setter for total questions.
    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }
}