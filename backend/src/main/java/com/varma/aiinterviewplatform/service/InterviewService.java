
package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.dto.InterviewHistoryResponse;
import com.varma.aiinterviewplatform.dto.InterviewQuestionResponse;
import com.varma.aiinterviewplatform.dto.InterviewRequest;
import com.varma.aiinterviewplatform.dto.InterviewResultResponse;
import com.varma.aiinterviewplatform.entity.Answer;
import com.varma.aiinterviewplatform.entity.Interview;
import com.varma.aiinterviewplatform.entity.Question;
import com.varma.aiinterviewplatform.entity.User;
import com.varma.aiinterviewplatform.repository.InterviewRepository;
import com.varma.aiinterviewplatform.repository.QuestionRepository;
import com.varma.aiinterviewplatform.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final AnswerService answerService;

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

    // ----------------------------------------------------
    // OWNERSHIP VALIDATION
    // ----------------------------------------------------

    private Interview requireOwnedInterview(Long interviewId, String email) {

        if (interviewId == null || email == null || email.isBlank()) {
            throw new AccessDeniedException("Authentication is required.");
        }

        return interviewRepository
                .findByIdAndUser_Email(
                        interviewId,
                        email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "Interview not found or access denied."));
    }

    // ----------------------------------------------------
    // GET INTERVIEW QUESTIONS - OWNER ONLY
    // ----------------------------------------------------

    @Transactional(readOnly = true)
    public List<Question> getInterviewQuestions(
            Long interviewId,
            String email) {

        Interview interview =
                requireOwnedInterview(interviewId, email);

        return interview.getQuestions();
    }

    // ----------------------------------------------------
    // GET ONE QUESTION - OWNER ONLY
    // ----------------------------------------------------

    @Transactional(readOnly = true)
    public InterviewQuestionResponse getQuestion(
            Long interviewId,
            int questionNumber,
            String email) {

        Interview interview =
                requireOwnedInterview(interviewId, email);

        List<Question> questions = interview.getQuestions();

        if (questions == null || questions.isEmpty()) {
            throw new IllegalArgumentException(
                    "No questions assigned to this interview.");
        }

        if (questionNumber < 1 || questionNumber > questions.size()) {
            throw new IllegalArgumentException(
                    "Invalid question number.");
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

    // ----------------------------------------------------
    // START REGULAR INTERVIEW
    // ----------------------------------------------------

    @Transactional
    public Interview startInterview(
            InterviewRequest request,
            String email) {

        if (request == null
                || request.getTechnology() == null
                || request.getTechnology().isBlank()
                || request.getDifficulty() == null
                || request.getDifficulty().isBlank()) {

            throw new IllegalArgumentException(
                    "Technology and difficulty are required.");
        }

        User user = userRepository.findByEmail(
                        email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found."));

        List<Question> questions =
                questionRepository.findMatchingQuestions(
                        request.getTechnology().trim(),
                        request.getDifficulty().trim()
                                .toUpperCase(Locale.ROOT));

        if (questions == null || questions.isEmpty()) {
            throw new IllegalArgumentException(
                    "No questions available for the selected technology and difficulty.");
        }

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

    // ----------------------------------------------------
    // START MCQ INTERVIEW
    // ----------------------------------------------------

    @Transactional
    public Interview startMcqInterview(
            InterviewRequest request,
            String email,
            int amount) {

        if (amount < 1 || amount > 20) {
            throw new IllegalArgumentException(
                    "Number of questions must be between 1 and 20.");
        }

        if (request == null
                || request.getTechnology() == null
                || request.getTechnology().isBlank()
                || request.getDifficulty() == null
                || request.getDifficulty().isBlank()) {

            throw new IllegalArgumentException(
                    "Technology and difficulty are required.");
        }

        User user = userRepository.findByEmail(
                        email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found."));

        String technology = request.getTechnology().trim();
        String difficulty = request.getDifficulty().trim()
                .toUpperCase(Locale.ROOT);

        List<Question> allQuestions =
                questionRepository.findMatchingQuestions(
                        technology,
                        difficulty);

        List<Question> mcqQuestions = allQuestions.stream()
                .filter(question ->
                        question.getOptionA() != null
                                && question.getOptionB() != null
                                && question.getOptionC() != null
                                && question.getOptionD() != null
                                && question.getCorrectOption() != null)
                .toList();

        if (mcqQuestions.isEmpty()) {
            throw new IllegalArgumentException(
                    "No MCQ questions available for the selected technology and difficulty.");
        }

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

    // ----------------------------------------------------
    // GET MY INTERVIEWS
    // ----------------------------------------------------

    @Transactional(readOnly = true)
    public List<Interview> getMyInterviews(String email) {

        return interviewRepository
                .findByUser_EmailOrderByIdDesc(
                        email.trim().toLowerCase(Locale.ROOT));
    }

    // ----------------------------------------------------
    // COMPLETE INTERVIEW - OWNER ONLY
    // ----------------------------------------------------

    @Transactional
    public Interview completeInterview(
            Long interviewId,
            String email) {

        Interview interview =
                requireOwnedInterview(interviewId, email);

        if ("COMPLETED".equalsIgnoreCase(interview.getStatus())) {
            throw new IllegalArgumentException(
                    "This interview has already been completed.");
        }

        List<Question> questions = interview.getQuestions();

        int totalQuestions =
                questions == null ? 0 : questions.size();

        if (totalQuestions == 0) {
            throw new IllegalArgumentException(
                    "No questions are assigned to this interview.");
        }

        List<Answer> answers =
                answerService.getInterviewAnswers(interviewId, email);

        int answeredQuestions = answers.size();

        if (answeredQuestions < totalQuestions) {
            throw new IllegalArgumentException(
                    "Interview cannot be completed. Please answer all questions first. Answered: "
                            + answeredQuestions + "/" + totalQuestions);
        }

        Double finalScore =
                answerService.calculateInterviewScore(interviewId, email);

        interview.setScore(finalScore);
        interview.setStatus("COMPLETED");
        interview.setCompletedAt(LocalDateTime.now());

        return interviewRepository.save(interview);
    }

    // ----------------------------------------------------
    // GET INTERVIEW RESULT - OWNER ONLY
    // ----------------------------------------------------

    @Transactional(readOnly = true)
    public InterviewResultResponse getInterviewResult(
            Long interviewId,
            String email) {

        Interview interview =
                requireOwnedInterview(interviewId, email);

        List<Answer> answers =
                answerService.getInterviewAnswers(interviewId, email);

        List<Question> questions = interview.getQuestions();

        int totalQuestions =
                questions == null ? 0 : questions.size();

        int answeredQuestions = answers.size();

        Double finalScore =
                answerService.calculateInterviewScore(interviewId, email);

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

    // ----------------------------------------------------
    // GET MY INTERVIEW HISTORY
    // ----------------------------------------------------

    @Transactional(readOnly = true)
    public List<InterviewHistoryResponse> getMyInterviewHistory(
            String email) {

        List<Interview> interviews =
                interviewRepository
                        .findByUser_EmailOrderByIdDesc(
                                email.trim().toLowerCase(Locale.ROOT));

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
