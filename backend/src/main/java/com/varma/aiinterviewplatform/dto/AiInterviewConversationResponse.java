package com.varma.aiinterviewplatform.dto;

public class AiInterviewConversationResponse {
    private Long interviewId;
    private String interviewerMessage;
    private String stage;
    private boolean technicalInterviewStarted;
    private String technology;
    private String difficulty;
    private String question;
    private int questionNumber;
    private int totalQuestions;

    public AiInterviewConversationResponse() {}

    public AiInterviewConversationResponse(Long interviewId, String interviewerMessage,
                                           String stage, boolean technicalInterviewStarted, String technology,
                                           String difficulty, String question, int questionNumber, int totalQuestions) {
        this.interviewId = interviewId;
        this.interviewerMessage = interviewerMessage;
        this.stage = stage;
        this.technicalInterviewStarted = technicalInterviewStarted;
        this.technology = technology;
        this.difficulty = difficulty;
        this.question = question;
        this.questionNumber = questionNumber;
        this.totalQuestions = totalQuestions;
    }

    public Long getInterviewId() { return interviewId; }
    public void setInterviewId(Long interviewId) { this.interviewId = interviewId; }
    public String getInterviewerMessage() { return interviewerMessage; }
    public void setInterviewerMessage(String interviewerMessage) { this.interviewerMessage = interviewerMessage; }
    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }
    public boolean isTechnicalInterviewStarted() { return technicalInterviewStarted; }
    public void setTechnicalInterviewStarted(boolean technicalInterviewStarted) { this.technicalInterviewStarted = technicalInterviewStarted; }
    public String getTechnology() { return technology; }
    public void setTechnology(String technology) { this.technology = technology; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public int getQuestionNumber() { return questionNumber; }
    public void setQuestionNumber(int questionNumber) { this.questionNumber = questionNumber; }
    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }
}
