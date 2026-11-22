
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

    private Interview requireOwnedInterview(Long interviewId, String email) {
        if (interviewId == null || email == null || email.isBlank()) {
            throw new IllegalArgumentException("Invalid interview request.");
        }

        return interviewRepository.findByIdAndUser_Email(interviewId, email)
                .orElseThrow(() ->
                        new IllegalArgumentException("Interview not found."));
    }

    @Transactional
    public Answer submitAnswer(AnswerRequest request) {
        return submitAnswerInternal(request, null, null);
    }

    @Transactional
    public Answer submitAnswer(AnswerRequest request, String resumeText) {
        if (resumeText == null || resumeText.isBlank()) {
            throw new IllegalArgumentException(
                    "Resume context is required for AI interview evaluation.");
        }

        return submitAnswerInternal(request, resumeText, null);
    }

    @Transactional
    public Answer submitAnswerForUser(AnswerRequest request, String email) {
        return submitAnswerInternal(request, null, email);
    }

    private Answer submitAnswerInternal(
            AnswerRequest request,
            String resumeText,
            String ownerEmail) {

        if (request == null
                || request.getInterviewId() == null
                || request.getQuestionId() == null) {
            throw new IllegalArgumentException(
                    "Interview ID and Question ID are required.");
        }

        if (request.getAnswerText() == null
                || request.getAnswerText().isBlank()) {
            throw new IllegalArgumentException("Answer text cannot be empty.");
        }

        Interview interview = ownerEmail == null
                ? interviewRepository.findById(request.getInterviewId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Interview not found."))
                : requireOwnedInterview(request.getInterviewId(), ownerEmail);

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Question not found."));

        if (interview.getQuestions() == null
                || interview.getQuestions().stream()
                .noneMatch(q -> q.getId().equals(question.getId()))) {
            throw new IllegalArgumentException(
                    "This question is not assigned to the interview.");
        }

        if (answerRepository.findByInterview_IdAndQuestion_Id(
                request.getInterviewId(), request.getQuestionId()).isPresent()) {
            throw new IllegalArgumentException(
                    "Answer already submitted for this question.");
        }

        String answerText = request.getAnswerText().trim();

        String evaluation;
        if (resumeText == null || resumeText.isBlank()) {
            evaluation = aiEvaluationService.evaluateAnswer(
                    question.getQuestionText(), answerText);
        } else {
            evaluation = aiEvaluationService.evaluateAnswer(
                    question.getQuestionText(), answerText, resumeText);
        }

        Answer answer = new Answer();
        answer.setAnswerText(answerText);
        answer.setScore(extractScore(evaluation));
        answer.setFeedback(evaluation);
        answer.setInterview(interview);
        answer.setQuestion(question);

        return answerRepository.save(answer);
    }

    @Transactional
    public McqEvaluationResponse submitMcqAnswer(McqAnswerRequest request) {
        return submitMcqAnswerInternal(request, null);
    }

    @Transactional
    public McqEvaluationResponse submitMcqAnswer(
            McqAnswerRequest request, String email) {
        return submitMcqAnswerInternal(request, email);
    }

    private McqEvaluationResponse submitMcqAnswerInternal(
            McqAnswerRequest request, String ownerEmail) {

        if (request == null
                || request.getInterviewId() == null
                || request.getQuestionId() == null) {
            throw new IllegalArgumentException(
                    "Interview ID and Question ID are required.");
        }

        if (request.getSelectedOption() == null
                || request.getSelectedOption().isBlank()) {
            throw new IllegalArgumentException("Please select an option.");
        }

        String selectedOption = request.getSelectedOption()
                .trim().toUpperCase(Locale.ROOT);

        if (!selectedOption.matches("[ABCD]")) {
            throw new IllegalArgumentException(
                    "Invalid option. Select A, B, C or D.");
        }

        Interview interview = ownerEmail == null
                ? interviewRepository.findById(request.getInterviewId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Interview not found."))
                : requireOwnedInterview(request.getInterviewId(), ownerEmail);

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Question not found."));

        if (question.getOptionA() == null
                || question.getOptionB() == null
                || question.getOptionC() == null
                || question.getOptionD() == null
                || question.getCorrectOption() == null) {
            throw new IllegalArgumentException("This question is not a valid MCQ.");
        }

        if (interview.getQuestions() == null
                || interview.getQuestions().stream()
                .noneMatch(q -> q.getId().equals(question.getId()))) {
            throw new IllegalArgumentException(
                    "This question is not assigned to the interview.");
        }

        if (answerRepository.findByInterview_IdAndQuestion_Id(
                request.getInterviewId(), request.getQuestionId()).isPresent()) {
            throw new IllegalArgumentException(
                    "Answer already submitted for this question.");
        }

        String correctOption = question.getCorrectOption()
                .trim().toUpperCase(Locale.ROOT);

        boolean isCorrect = selectedOption.equals(correctOption);
        double score = isCorrect ? 1.0 : 0.0;

        String feedback = isCorrect
                ? "Correct answer!"
                : "Incorrect answer. Correct option: " + correctOption;

        Answer answer = new Answer();
        answer.setAnswerText(selectedOption);
        answer.setScore(score);
        answer.setFeedback(feedback);
        answer.setInterview(interview);
        answer.setQuestion(question);

        answerRepository.save(answer);

        return new McqEvaluationResponse(
                question.getId(),
                selectedOption,
                correctOption,
                isCorrect,
                score,
                feedback);
    }

    @Transactional(readOnly = true)
    public Double calculateInterviewScore(Long interviewId) {
        return calculateDescriptiveScore(
                answerRepository.findByInterviewId(interviewId));
    }

    @Transactional(readOnly = true)
    public Double calculateInterviewScore(Long interviewId, String email) {
        requireOwnedInterview(interviewId, email);
        return calculateDescriptiveScore(
                answerRepository.findByInterviewId(interviewId));
    }

    private Double calculateDescriptiveScore(List<Answer> answers) {
        if (answers.isEmpty()) {
            return 0.0;
        }

        double totalScore = 0.0;
        int evaluatedAnswers = 0;

        for (Answer answer : answers) {
            Question question = answer.getQuestion();

            boolean isMcq = question != null
                    && question.getOptionA() != null
                    && question.getOptionB() != null
                    && question.getOptionC() != null
                    && question.getOptionD() != null
                    && question.getCorrectOption() != null;

            if (isMcq) {
                continue;
            }

            if (answer.getScore() != null
                    && answer.getFeedback() != null
                    && !answer.getFeedback().equals("Not evaluated yet")) {
                totalScore += answer.getScore();
                evaluatedAnswers++;
            }
        }

        return evaluatedAnswers == 0 ? 0.0 : totalScore / evaluatedAnswers;
    }

    @Transactional(readOnly = true)
    public List<Answer> getInterviewAnswers(Long interviewId) {
        return answerRepository.findByInterviewId(interviewId);
    }

    @Transactional(readOnly = true)
    public List<Answer> getInterviewAnswers(Long interviewId, String email) {
        requireOwnedInterview(interviewId, email);
        return answerRepository.findByInterviewId(interviewId);
    }

    @Transactional(readOnly = true)
    public McqResultResponse calculateMcqResult(Long interviewId) {
        return calculateMcqResultInternal(interviewId);
    }

    @Transactional(readOnly = true)
    public McqResultResponse calculateMcqResult(Long interviewId, String email) {
        requireOwnedInterview(interviewId, email);
        return calculateMcqResultInternal(interviewId);
    }

    private McqResultResponse calculateMcqResultInternal(Long interviewId) {
        List<Answer> answers = answerRepository.findByInterviewId(interviewId);

        int totalQuestions = 0;
        int correctAnswers = 0;
        int incorrectAnswers = 0;
        double totalScore = 0.0;

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

        double percentage = totalQuestions > 0
                ? (totalScore / totalQuestions) * 100.0
                : 0.0;

        return new McqResultResponse(
                totalQuestions,
                correctAnswers,
                incorrectAnswers,
                totalScore,
                percentage);
    }

    private Double extractScore(String evaluation) {
        if (evaluation == null || evaluation.isBlank()) {
            return 0.0;
        }

        Pattern pattern = Pattern.compile(
                "score\\s*:\\s*(\\d+(?:\\.\\d+)?)\\s*/\\s*10",
                Pattern.CASE_INSENSITIVE);

        Matcher matcher = pattern.matcher(evaluation);

        if (matcher.find()) {
            try {
                double score = Double.parseDouble(matcher.group(1));
                if (score >= 0.0 && score <= 10.0) {
                    return score;
                }
            } catch (NumberFormatException ignored) {
                // Keep the default score.
            }
        }

        return 0.0;
    }
}
