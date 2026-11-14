package com.varma.aiinterviewplatform.dto;

import java.util.List;

// This DTO sends the skills extracted from the user's resume.
public class SkillExtractionResponse {

    // Resume ID from which the skills were extracted.
    private Long resumeId;

    // List of skills found in the resume.
    private List<String> skills;

    // Default constructor required for JSON conversion.
    public SkillExtractionResponse() {
    }

    // Constructor used to create the response easily.
    public SkillExtractionResponse(Long resumeId, List<String> skills) {
        this.resumeId = resumeId;
        this.skills = skills;
    }

    // Returns the resume ID.
    public Long getResumeId() {
        return resumeId;
    }

    // Sets the resume ID.
    public void setResumeId(Long resumeId) {
        this.resumeId = resumeId;
    }

    // Returns the extracted skills.
    public List<String> getSkills() {
        return skills;
    }

    // Sets the extracted skills.
    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
}