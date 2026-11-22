
package com.varma.aiinterviewplatform.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * Stores the AI-generated resume analysis.
 * This information will later be used to generate
 * personalized technical interview questions.
 */
public class ResumeAnalysisResponse {

    private String candidateSummary;
    private List<String> skills;
    private List<String> projects;
    private List<String> experience;
    private List<String> interviewTopics;

    // Default constructor required by Jackson.
    public ResumeAnalysisResponse() {
        this.skills = new ArrayList<>();
        this.projects = new ArrayList<>();
        this.experience = new ArrayList<>();
        this.interviewTopics = new ArrayList<>();
    }

    // Full constructor.
    public ResumeAnalysisResponse(
            String candidateSummary,
            List<String> skills,
            List<String> projects,
            List<String> experience,
            List<String> interviewTopics) {

        this.candidateSummary = candidateSummary;
        this.skills = skills;
        this.projects = projects;
        this.experience = experience;
        this.interviewTopics = interviewTopics;
    }

    public String getCandidateSummary() {
        return candidateSummary;
    }

    public void setCandidateSummary(String candidateSummary) {
        this.candidateSummary = candidateSummary;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public List<String> getProjects() {
        return projects;
    }

    public void setProjects(List<String> projects) {
        this.projects = projects;
    }

    public List<String> getExperience() {
        return experience;
    }

    public void setExperience(List<String> experience) {
        this.experience = experience;
    }

    public List<String> getInterviewTopics() {
        return interviewTopics;
    }

    public void setInterviewTopics(List<String> interviewTopics) {
        this.interviewTopics = interviewTopics;
    }
}
