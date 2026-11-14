
package com.varma.aiinterviewplatform.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "answers",
        uniqueConstraints = {
                // Prevent duplicate answers for the same question in one attempt.
                @UniqueConstraint(
                        name = "uk_answer_interview_question",
                        columnNames = {"interview_id", "question_id"}
                )
        }
)
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // For MCQ: A
    // For MSQ: A,C,D
    // For descriptive interviews: the user's written answer.
    @Column(columnDefinition = "TEXT")
    private String answerText;

    // Existing evaluation score.
    private Double score;

    // Existing feedback, or post-test explanation feedback.
    @Column(columnDefinition = "TEXT")
    private String feedback;

    // Test Center review status.
    // Existing answers default to false.
    @Column(name = "marked_for_review", nullable = false)
    private boolean markedForReview = false;

    @ManyToOne
    @JoinColumn(name = "interview_id")
    private Interview interview;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;

    public Answer() {
    }

    // Preserve the existing constructor used by current interview features.
    public Answer(
            String answerText,
            Double score,
            String feedback,
            Interview interview,
            Question question) {

        this.answerText = answerText;
        this.score = score;
        this.feedback = feedback;
        this.interview = interview;
        this.question = question;
        this.markedForReview = false;
    }

    public Long getId() {
        return id;
    }

    public String getAnswerText() {
        return answerText;
    }

    public void setAnswerText(String answerText) {
        this.answerText = answerText;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public boolean isMarkedForReview() {
        return markedForReview;
    }

    public void setMarkedForReview(boolean markedForReview) {
        this.markedForReview = markedForReview;
    }

    public Interview getInterview() {
        return interview;
    }

    public void setInterview(Interview interview) {
        this.interview = interview;
    }

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }
}
