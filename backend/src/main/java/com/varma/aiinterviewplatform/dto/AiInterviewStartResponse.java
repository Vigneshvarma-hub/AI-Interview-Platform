package com.varma.aiinterviewplatform.dto;

public class AiInterviewStartResponse {
    private Long interviewId;
    private String interviewerMessage;
    private String stage;
    private int totalQuestions;

    public AiInterviewStartResponse() {}

    public AiInterviewStartResponse(Long interviewId, String interviewerMessage,
                                    String stage, int totalQuestions) {
        this.interviewId = interviewId;
        this.interviewerMessage = interviewerMessage;
        this.stage = stage;
        this.totalQuestions = totalQuestions;
    }

    public Long getInterviewId() { return interviewId; }
    public void setInterviewId(Long interviewId) { this.interviewId = interviewId; }
    public String getInterviewerMessage() { return interviewerMessage; }
    public void setInterviewerMessage(String interviewerMessage) { this.interviewerMessage = interviewerMessage; }
    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }
    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }
}
