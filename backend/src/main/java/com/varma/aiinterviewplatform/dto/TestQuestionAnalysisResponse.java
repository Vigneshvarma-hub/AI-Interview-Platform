
package com.varma.aiinterviewplatform.dto;

/**
 * Question-wise analysis returned only after test submission.
 */
public class TestQuestionAnalysisResponse {

    private Long questionId;
    private String questionText;
    private String category;
    private String questionType;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String userAnswer;
    private String correctAnswer;
    private String explanation;
    private boolean correct;
    private boolean answered;
    private boolean markedForReview;
    private double score;

    public TestQuestionAnalysisResponse() {
    }

    public TestQuestionAnalysisResponse(
            Long questionId,
            String questionText,
            String category,
            String questionType,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            String userAnswer,
            String correctAnswer,
            String explanation,
            boolean correct,
            boolean answered,
            boolean markedForReview,
            double score) {
        this.questionId = questionId;
        this.questionText = questionText;
        this.category = category;
        this.questionType = questionType;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.userAnswer = userAnswer;
        this.correctAnswer = correctAnswer;
        this.explanation = explanation;
        this.correct = correct;
        this.answered = answered;
        this.markedForReview = markedForReview;
        this.score = score;
    }

    public Long getQuestionId() { return questionId; }
    public String getQuestionText() { return questionText; }
    public String getCategory() { return category; }
    public String getQuestionType() { return questionType; }
    public String getOptionA() { return optionA; }
    public String getOptionB() { return optionB; }
    public String getOptionC() { return optionC; }
    public String getOptionD() { return optionD; }
    public String getUserAnswer() { return userAnswer; }
    public String getCorrectAnswer() { return correctAnswer; }
    public String getExplanation() { return explanation; }
    public boolean isCorrect() { return correct; }
    public boolean isAnswered() { return answered; }
    public boolean isMarkedForReview() { return markedForReview; }
    public double getScore() { return score; }
}
