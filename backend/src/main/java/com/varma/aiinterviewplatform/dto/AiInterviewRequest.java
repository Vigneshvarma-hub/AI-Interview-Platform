package com.varma.aiinterviewplatform.dto;

public class AiInterviewRequest {

    // Technology selected by the candidate.
    private String technology;

    // Difficulty selected by the candidate.
    private String difficulty;

    // Default constructor required by Spring.
    public AiInterviewRequest() {
    }

    // Constructor for creating a request with both values.
    public AiInterviewRequest(String technology, String difficulty) {
        this.technology = technology;
        this.difficulty = difficulty;
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
}