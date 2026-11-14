package com.varma.aiinterviewplatform.dto;

public class SkillScoreResponse {

    // Name of the skill.
    private String skill;

    // Average score obtained for this skill.
    private Double score;

    // Number of answers/questions used to calculate the score.
    private int totalQuestions;

    // Default constructor required by Spring.
    public SkillScoreResponse() {
    }

    // Constructor for creating a skill score response.
    public SkillScoreResponse(
            String skill,
            Double score,
            int totalQuestions) {

        this.skill = skill;
        this.score = score;
        this.totalQuestions = totalQuestions;
    }

    // Getter for skill.
    public String getSkill() {
        return skill;
    }

    // Setter for skill.
    public void setSkill(String skill) {
        this.skill = skill;
    }

    // Getter for score.
    public Double getScore() {
        return score;
    }

    // Setter for score.
    public void setScore(Double score) {
        this.score = score;
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