package com.varma.aiinterviewplatform.dto;

public class AiInterviewConversationRequest {
    private String candidateResponse;

    public AiInterviewConversationRequest() {}

    public AiInterviewConversationRequest(String candidateResponse) {
        this.candidateResponse = candidateResponse;
    }

    public String getCandidateResponse() { return candidateResponse; }
    public void setCandidateResponse(String candidateResponse) { this.candidateResponse = candidateResponse; }
}
