
package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.dto.InterviewRequest;
import com.varma.aiinterviewplatform.dto.InterviewQuestionResponse;
import com.varma.aiinterviewplatform.dto.InterviewResultResponse;
import com.varma.aiinterviewplatform.dto.InterviewHistoryResponse;

import com.varma.aiinterviewplatform.entity.Answer;
import com.varma.aiinterviewplatform.entity.Interview;
import com.varma.aiinterviewplatform.entity.Question;
import com.varma.aiinterviewplatform.entity.User;

import com.varma.aiinterviewplatform.repository.InterviewRepository;
import com.varma.aiinterviewplatform.repository.QuestionRepository;
import com.varma.aiinterviewplatform.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final AnswerService answerService;

    // Constructor injection for required repositories and services.
    public InterviewService(
            InterviewRepository interviewRepository,
            UserRepository userRepository,
            QuestionRepository questionRepository,
            AnswerService answerService) {

        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
        this.questionRepository = questionRepository;
        this.answerService = answerService;
    }

    // Retrieve all questions assigned to an interview.
    public List<Question> getInterviewQuestions(Long interviewId) {

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() ->
                        new RuntimeException("Interview not found"));

        return interview.getQuestions();
    }

    // Retrieve one question by its position in the interview.
    public InterviewQuestionResponse getQuestion(
            Long interviewId,
            int questionNumber) {

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() ->
                        new RuntimeException("Interview not found"));

        List<Question> questions = interview.getQuestions();

        if (questions == null || questions.isEmpty()) {
            throw new RuntimeException(
                    "No questions assigned to this interview");
        }

        if (questionNumber < 1 || questionNumber > questions.size()) {
            throw new RuntimeException("Invalid question number");
        }

        Question question = questions.get(questionNumber - 1);

        return new InterviewQuestionResponse(
                question.getId(),
                question.getQuestionText(),
                question.getTechnology(),
                question.getDifficulty(),
                question.getCategory(),
                questionNumber,
                questions.size()
        );
    }

    // Start a regular interview for the requested technology and difficulty.
    public Interview startInterview(
            InterviewRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Validate the request and retrieve matching questions.
        if (request.getTechnology() == null
                || request.getTechnology().isBlank()
                || request.getDifficulty() == null
                || request.getDifficulty().isBlank()) {
            throw new IllegalArgumentException(
                    "Technology and difficulty are required");
        }

        List<Question> questions =
                questionRepository.findMatchingQuestions(
                        request.getTechnology().trim(),
                        request.getDifficulty().trim()
                                .toUpperCase(Locale.ROOT));

        if (questions == null || questions.isEmpty()) {
            throw new RuntimeException(
                    "No questions available for technology: "
                            + request.getTechnology()
                            + " and difficulty: "
                            + request.getDifficulty());
        }

        // Limit a regular interview to five questions.
        int questionCount = Math.min(questions.size(), 5);

        List<Question> selectedQuestions =
                questions.subList(0, questionCount);

        Interview interview = new Interview();

        interview.setTechnology(request.getTechnology().trim());
        interview.setDifficulty(
                request.getDifficulty().trim().toUpperCase(Locale.ROOT));
        interview.setStatus("STARTED");
        interview.setScore(0.0);
        interview.setUser(user);
        interview.setQuestions(selectedQuestions);

        return interviewRepository.save(interview);
    }

    // Start an MCQ assessment with a requested number of questions.
    public Interview startMcqInterview(
            InterviewRequest request,
            String email,
            int amount) {

        if (amount < 1 || amount > 20) {
            throw new IllegalArgumentException(
                    "Number of questions must be between 1 and 20");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Validate the technology and difficulty before querying.
        if (request.getTechnology() == null
                || request.getTechnology().isBlank()
                || request.getDifficulty() == null
                || request.getDifficulty().isBlank()) {
            throw new IllegalArgumentException(
                    "Technology and difficulty are required");
        }

        String technology = request.getTechnology().trim();
        String difficulty = request.getDifficulty().trim()
                .toUpperCase(Locale.ROOT);

        // Use the repository's matching method to avoid case mismatches.
        List<Question> allQuestions =
                questionRepository.findMatchingQuestions(
                        technology,
                        difficulty);

        // Only select questions that contain all MCQ options and an answer.
        List<Question> mcqQuestions = allQuestions.stream()
                .filter(question ->
                        question.getOptionA() != null
                                && question.getOptionB() != null
                                && question.getOptionC() != null
                                && question.getOptionD() != null
                                && question.getCorrectOption() != null)
                .toList();

        if (mcqQuestions.isEmpty()) {
            throw new RuntimeException(
                    "No MCQ questions available for technology: "
                            + technology
                            + " and difficulty: "
                            + difficulty);
        }

        // Use only the number of questions actually available.
        int questionCount = Math.min(mcqQuestions.size(), amount);

        List<Question> selectedQuestions =
                mcqQuestions.subList(0, questionCount);

        Interview interview = new Interview();

        interview.setTechnology(technology);
        interview.setDifficulty(difficulty);
        interview.setStatus("STARTED");
        interview.setScore(0.0);
        interview.setUser(user);
        interview.setQuestions(selectedQuestions);

        return interviewRepository.save(interview);
    }

    // Retrieve the logged-in user's interviews.
    public List<Interview> getMyInterviews(String email) {

        return interviewRepository
                .findByUser_EmailOrderByIdDesc(email);
    }

    // Complete an interview after all questions have been answered.
    public Interview completeInterview(Long interviewId) {

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() ->
                        new RuntimeException("Interview not found"));

        List<Question> questions = interview.getQuestions();

        int totalQuestions =
                questions == null ? 0 : questions.size();

        List<Answer> answers =
                answerService.getInterviewAnswers(interviewId);

        int answeredQuestions = answers.size();

        if (answeredQuestions < totalQuestions) {
            throw new RuntimeException(
                    "Interview cannot be completed. "
                            + "Please answer all questions first. "
                            + "Answered: "
                            + answeredQuestions
                            + "/"
                            + totalQuestions);
        }

        Double finalScore =
                answerService.calculateInterviewScore(interviewId);

        interview.setScore(finalScore);
        interview.setStatus("COMPLETED");
        interview.setCompletedAt(
                java.time.LocalDateTime.now());

        return interviewRepository.save(interview);
    }

    // Retrieve the result of an interview.
    public InterviewResultResponse getInterviewResult(
            Long interviewId) {

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() ->
                        new RuntimeException("Interview not found"));

        List<Answer> answers =
                answerService.getInterviewAnswers(interviewId);

        List<Question> questions = interview.getQuestions();

        int totalQuestions =
                questions == null ? 0 : questions.size();

        int answeredQuestions = answers.size();

        Double finalScore =
                answerService.calculateInterviewScore(interviewId);

        return new InterviewResultResponse(
                interview.getId(),
                interview.getTechnology(),
                interview.getDifficulty(),
                interview.getStatus(),
                finalScore,
                totalQuestions,
                answeredQuestions
        );
    }

    // Retrieve the logged-in user's interview history.
    public List<InterviewHistoryResponse> getMyInterviewHistory(
            String email) {

        List<Interview> interviews =
                interviewRepository
                        .findByUser_EmailOrderByIdDesc(email);

        return interviews.stream()
                .map(interview -> new InterviewHistoryResponse(
                        interview.getId(),
                        interview.getTechnology(),
                        interview.getDifficulty(),
                        interview.getStatus(),
                        interview.getScore(),
                        interview.getCreatedAt(),
                        interview.getCompletedAt()
                ))
                .toList();
    }
}
