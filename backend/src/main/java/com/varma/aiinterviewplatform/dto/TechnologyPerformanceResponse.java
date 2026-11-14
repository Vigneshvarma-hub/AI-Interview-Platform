package com.varma.aiinterviewplatform.dto;

public class TechnologyPerformanceResponse {

    // Name of the technology, for example Java or Python.
    private String technology;

    // Number of completed interviews for this technology.
    private int interviewCount;

    // Average score obtained in this technology.
    private double averageScore;

    // Empty constructor required by Spring/Jackson.
    public TechnologyPerformanceResponse() {
    }

    // Constructor used by the service to create the response.
    public TechnologyPerformanceResponse(
            String technology,
            int interviewCount,
            double averageScore) {

        this.technology = technology;
        this.interviewCount = interviewCount;
        this.averageScore = averageScore;
    }

    // Getter for technology.
    public String getTechnology() {
        return technology;
    }

    // Setter for technology.
    public void setTechnology(String technology) {
        this.technology = technology;
    }

    // Getter for interview count.
    public int getInterviewCount() {
        return interviewCount;
    }

    // Setter for interview count.
    public void setInterviewCount(int interviewCount) {
        this.interviewCount = interviewCount;
    }

    // Getter for average score.
    public double getAverageScore() {
        return averageScore;
    }

    // Setter for average score.
    public void setAverageScore(double averageScore) {
        this.averageScore = averageScore;
    }
}