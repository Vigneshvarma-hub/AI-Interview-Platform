
package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.dto.AnswerRequest;
import com.varma.aiinterviewplatform.dto.McqAnswerRequest;
import com.varma.aiinterviewplatform.dto.McqEvaluationResponse;
import com.varma.aiinterviewplatform.dto.McqResultResponse;

import com.varma.aiinterviewplatform.entity.Answer;
import com.varma.aiinterviewplatform.entity.Interview;
import com.varma.aiinterviewplatform.entity.Question;

import com.varma.aiinterviewplatform.repository.AnswerRepository;
import com.varma.aiinterviewplatform.repository.InterviewRepository;
import com.varma.aiinterviewplatform.repository.QuestionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AnswerService {

    private final AnswerRepository answerRepository;
    private final InterviewRepository interviewRepository;
    private final QuestionRepository questionRepository;
    private final AiEvaluationService aiEvaluationService;

    // Constructor injection for required services and repositories.
    public AnswerService(
            AnswerRepository answerRepository,
            InterviewRepository interviewRepository,
            QuestionRepository questionRepository,
            AiEvaluationService aiEvaluationService) {

        this.answerRepository = answerRepository;
        this.interviewRepository = interviewRepository;
        this.questionRepository = questionRepository;
        this.aiEvaluationService = aiEvaluationService;
    }

    // ----------------------------------------------------
    // 1. Submit and evaluate a descriptive answer.
    // ----------------------------------------------------
    @Transactional
    public Answer submitAnswer(AnswerRequest request) {

        // Validate the request and required IDs.
        if (request == null
                || request.getInterviewId() == null
                || request.getQuestionId() == null) {
            throw new IllegalArgumentException(
                    "Interview ID and Question ID are required."
            );
        }

        // Validate the answer text.
        if (request.getAnswerText() == null
                || request.getAnswerText().isBlank()) {
            throw new IllegalArgumentException(
                    "Answer text cannot be empty."
            );
        }

        // Find the interview.
        Interview interview = interviewRepository
                .findById(request.getInterviewId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Interview not found.")
                );

        // Find the question.
        Question question = questionRepository
                .findById(request.getQuestionId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Question not found.")
                );

        // Verify that this question belongs to the interview.
        if (interview.getQuestions() == null
                || interview.getQuestions().stream()
                .noneMatch(q -> q.getId().equals(question.getId()))) {
            throw new IllegalArgumentException(
                    "This question is not assigned to the interview."
            );
        }

        // Stop duplicate submissions for this interview/question pair.
        boolean alreadySubmitted = answerRepository
                .findByInterview_IdAndQuestion_Id(
                        request.getInterviewId(),
                        request.getQuestionId()
                )
                .isPresent();

        if (alreadySubmitted) {
            throw new IllegalArgumentException(
                    "Answer already submitted for this question."
            );
        }

        // Evaluate the answer using the existing AI evaluation service.
        String answerText = request.getAnswerText().trim();

        String evaluation = aiEvaluationService.evaluateAnswer(
                question.getQuestionText(),
                answerText
        );

        // Store the answer and its evaluation.
        Answer answer = new Answer();
        answer.setAnswerText(answerText);
        answer.setScore(extractScore(evaluation));
        answer.setFeedback(evaluation);
        answer.setInterview(interview);
        answer.setQuestion(question);

        return answerRepository.save(answer);
    }

    // ----------------------------------------------------
    // 2. Submit and evaluate an MCQ answer.
    // ----------------------------------------------------
    @Transactional
    public McqEvaluationResponse submitMcqAnswer(
            McqAnswerRequest request) {

        // Validate the request.
        if (request == null
                || request.getInterviewId() == null
                || request.getQuestionId() == null) {
            throw new IllegalArgumentException(
                    "Interview ID and Question ID are required."
            );
        }

        // Validate the selected option.
        if (request.getSelectedOption() == null
                || request.getSelectedOption().isBlank()) {
            throw new IllegalArgumentException(
                    "Please select an option."
            );
        }

        String selectedOption = request.getSelectedOption()
                .trim()
                .toUpperCase(Locale.ROOT);

        // Only A, B, C and D are valid selections.
        if (!selectedOption.matches("[ABCD]")) {
            throw new IllegalArgumentException(
                    "Invalid option. Select A, B, C or D."
            );
        }

        // Find the interview.
        Interview interview = interviewRepository
                .findById(request.getInterviewId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Interview not found.")
                );

        // Find the question.
        Question question = questionRepository
                .findById(request.getQuestionId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Question not found.")
                );

        // Ensure that the question is a valid MCQ.
        if (question.getOptionA() == null
                || question.getOptionB() == null
                || question.getOptionC() == null
                || question.getOptionD() == null
                || question.getCorrectOption() == null) {
            throw new IllegalArgumentException(
                    "This question is not a valid MCQ."
            );
        }

        // Verify that the question belongs to the interview.
        if (interview.getQuestions() == null
                || interview.getQuestions().stream()
                .noneMatch(q -> q.getId().equals(question.getId()))) {
            throw new IllegalArgumentException(
                    "This question is not assigned to the interview."
            );
        }

        // Prevent a second MCQ answer for the same question.
        boolean alreadySubmitted = answerRepository
                .findByInterview_IdAndQuestion_Id(
                        request.getInterviewId(),
                        request.getQuestionId()
                )
                .isPresent();

        if (alreadySubmitted) {
            throw new IllegalArgumentException(
                    "Answer already submitted for this question."
            );
        }

        // Compare the selected option with the correct option.
        String correctOption = question.getCorrectOption()
                .trim()
                .toUpperCase(Locale.ROOT);

        boolean isCorrect = selectedOption.equals(correctOption);

        // MCQ scoring: one mark for a correct answer, otherwise zero.
        double score = isCorrect ? 1.0 : 0.0;

        // Prepare feedback.
        String feedback = isCorrect
                ? "Correct answer!"
                : "Incorrect answer. Correct option: " + correctOption;

        // Save the MCQ answer.
        Answer answer = new Answer();
        answer.setAnswerText(selectedOption);
        answer.setScore(score);
        answer.setFeedback(feedback);
        answer.setInterview(interview);
        answer.setQuestion(question);

        answerRepository.save(answer);

        // Return the result to the caller.
        return new McqEvaluationResponse(
                question.getId(),
                selectedOption,
                correctOption,
                isCorrect,
                score,
                feedback
        );
    }

    // ----------------------------------------------------
    // 3. Calculate the descriptive interview score.
    // ----------------------------------------------------
    @Transactional(readOnly = true)
    public Double calculateInterviewScore(Long interviewId) {

        List<Answer> answers =
                answerRepository.findByInterviewId(interviewId);

        if (answers.isEmpty()) {
            return 0.0;
        }

        double totalScore = 0.0;
        int evaluatedAnswers = 0;

        for (Answer answer : answers) {

            Question question = answer.getQuestion();

            // Exclude MCQ answers from the descriptive score.
            boolean isMcq = question != null
                    && question.getOptionA() != null
                    && question.getOptionB() != null
                    && question.getOptionC() != null
                    && question.getOptionD() != null
                    && question.getCorrectOption() != null;

            if (isMcq) {
                continue;
            }

            // Include only answers with completed evaluation feedback.
            if (answer.getScore() != null
                    && answer.getFeedback() != null
                    && !answer.getFeedback().equals("Not evaluated yet")) {

                totalScore += answer.getScore();
                evaluatedAnswers++;
            }
        }

        if (evaluatedAnswers == 0) {
            return 0.0;
        }

        return totalScore / evaluatedAnswers;
    }

    // ----------------------------------------------------
    // 4. Retrieve answers for an interview.
    // ----------------------------------------------------
    @Transactional(readOnly = true)
    public List<Answer> getInterviewAnswers(Long interviewId) {

        return answerRepository.findByInterviewId(interviewId);
    }

    // ----------------------------------------------------
    // 5. Calculate the MCQ result.
    // ----------------------------------------------------
    @Transactional(readOnly = true)
    public McqResultResponse calculateMcqResult(Long interviewId) {

        List<Answer> answers =
                answerRepository.findByInterviewId(interviewId);

        int totalQuestions = 0;
        int correctAnswers = 0;
        int incorrectAnswers = 0;
        double totalScore = 0.0;

        // Process MCQ answers only.
        for (Answer answer : answers) {

            Question question = answer.getQuestion();

            boolean isMcq = question != null
                    && question.getOptionA() != null
                    && question.getOptionB() != null
                    && question.getOptionC() != null
                    && question.getOptionD() != null
                    && question.getCorrectOption() != null;

            if (!isMcq) {
                continue;
            }

            totalQuestions++;

            if (answer.getScore() != null
                    && Double.compare(answer.getScore(), 1.0) == 0) {
                correctAnswers++;
                totalScore += 1.0;
            } else {
                incorrectAnswers++;
            }
        }

        // Calculate the percentage score.
        double percentage = 0.0;

        if (totalQuestions > 0) {
            percentage = (totalScore / totalQuestions) * 100.0;
        }

        return new McqResultResponse(
                totalQuestions,
                correctAnswers,
                incorrectAnswers,
                totalScore,
                percentage
        );
    }

    // ----------------------------------------------------
    // 6. Extract the score from AI evaluation text.
    // Example: "Score: 8/10"
    // ----------------------------------------------------
    private Double extractScore(String evaluation) {

        if (evaluation == null || evaluation.isBlank()) {
            return 0.0;
        }

        // Accept decimal or integer scores out of 10.
        Pattern pattern = Pattern.compile(
                "score\\s*:\\s*(\\d+(?:\\.\\d+)?)\\s*/\\s*10",
                Pattern.CASE_INSENSITIVE
        );

        Matcher matcher = pattern.matcher(evaluation);

        if (matcher.find()) {
            try {
                double score = Double.parseDouble(matcher.group(1));

                // Avoid storing an invalid score outside the 0-10 range.
                if (score >= 0.0 && score <= 10.0) {
                    return score;
                }
            } catch (NumberFormatException ignored) {
                // Fall through to the default score.
            }
        }

        return 0.0;
    }
}
