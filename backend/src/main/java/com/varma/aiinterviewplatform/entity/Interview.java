package com.varma.aiinterviewplatform.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interviews")
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String technology;
    private String difficulty;
    private String status;
    private Double score;
    private String interviewType;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private Integer durationMinutes;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private String conversationStage;

    @Column(columnDefinition = "TEXT")
    private String conversationHistory;

    @Column(columnDefinition = "TEXT")
    private String resumeAnalysis;

    @Column(columnDefinition = "TEXT")
    private String candidateFeedback;

    private Integer feedbackRating;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "interview_questions",
            joinColumns = @JoinColumn(name = "interview_id"),
            inverseJoinColumns = @JoinColumn(name = "question_id")
    )
    private List<Question> questions = new ArrayList<>();

    public Interview() {
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTechnology() { return technology; }
    public void setTechnology(String technology) { this.technology = technology; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getConversationStage() { return conversationStage; }
    public void setConversationStage(String conversationStage) { this.conversationStage = conversationStage; }

    @JsonIgnore
    public String getConversationHistory() { return conversationHistory; }
    public void setConversationHistory(String conversationHistory) { this.conversationHistory = conversationHistory; }

    @JsonIgnore
    public String getResumeAnalysis() { return resumeAnalysis; }
    public void setResumeAnalysis(String resumeAnalysis) { this.resumeAnalysis = resumeAnalysis; }

    @JsonIgnore
    public String getCandidateFeedback() { return candidateFeedback; }
    public void setCandidateFeedback(String candidateFeedback) { this.candidateFeedback = candidateFeedback; }

    public Integer getFeedbackRating() { return feedbackRating; }
    public void setFeedbackRating(Integer feedbackRating) { this.feedbackRating = feedbackRating; }

    @JsonIgnore
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) {
        this.questions = questions == null ? new ArrayList<>() : questions;
    }
}
