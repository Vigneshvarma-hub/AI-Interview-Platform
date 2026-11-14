
package com.varma.aiinterviewplatform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

import com.varma.aiinterviewplatform.dto.AiInterviewAnswerRequest;
import com.varma.aiinterviewplatform.dto.AiInterviewAnswerResponse;
import com.varma.aiinterviewplatform.dto.AiInterviewEvaluationResponse;
import com.varma.aiinterviewplatform.dto.AiInterviewRequest;
import com.varma.aiinterviewplatform.dto.AiInterviewResponse;
import com.varma.aiinterviewplatform.dto.AnswerRequest;

import com.varma.aiinterviewplatform.entity.Answer;
import com.varma.aiinterviewplatform.entity.Interview;
import com.varma.aiinterviewplatform.entity.Question;
import com.varma.aiinterviewplatform.entity.User;

import com.varma.aiinterviewplatform.repository.AnswerRepository;
import com.varma.aiinterviewplatform.repository.InterviewRepository;
import com.varma.aiinterviewplatform.repository.QuestionRepository;
import com.varma.aiinterviewplatform.repository.UserRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class AiInterviewService {

    private static final int FREE_ANSWER_LIMIT = 3;
    private static final int TRIAL_QUESTION_LIMIT = 5;

    private final InterviewRepository interviewRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final AnswerRepository answerRepository;
    private final AnswerService answerService;
    private final Client geminiClient;
    private final ObjectMapper objectMapper;

    public AiInterviewService(
            InterviewRepository interviewRepository,
            QuestionRepository questionRepository,
            UserRepository userRepository,
            AnswerRepository answerRepository,
            AnswerService answerService,
            Client geminiClient) {

        this.interviewRepository = interviewRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.answerRepository = answerRepository;
        this.answerService = answerService;
        this.geminiClient = geminiClient;
        this.objectMapper = new ObjectMapper();
    }

    // Find the authenticated user and check email verification.
    private User requireVerifiedUser(String email) {

        if (email == null || email.isBlank()) {
            throw new AccessDeniedException("Please log in to continue.");
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new AccessDeniedException("User account not found."));

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new AccessDeniedException(
                    "Please verify your email before using AI interviews.");
        }

        return user;
    }

    // Refresh expired subscription plans without blocking access to
    // previously saved interview results.
    private User refreshExpiredPlan(User user) {

        LocalDateTime now = LocalDateTime.now();
        String plan = user.getSubscriptionPlan();

        if ("TRIAL".equalsIgnoreCase(plan)) {
            if (user.getTrialEndDate() == null
                    || !now.isBefore(user.getTrialEndDate())) {

                user.setSubscriptionPlan("FREE");
                return userRepository.save(user);
            }
        }

        if ("PREMIUM".equalsIgnoreCase(plan)) {
            if (user.getSubscriptionEndDate() == null
                    || !now.isBefore(user.getSubscriptionEndDate())) {

                user.setSubscriptionPlan("FREE");
                return userRepository.save(user);
            }
        }

        return user;
    }

    // Count only answers submitted in AI mock interviews.
    private long getAiAnswerCount(User user) {
        return answerRepository
                .countByInterview_User_IdAndInterview_InterviewTypeIgnoreCase(
                        user.getId(), "AI");
    }

    // Check whether the user can start a new AI mock interview.
    private User requireStartAccess(String email) {

        User user = refreshExpiredPlan(requireVerifiedUser(email));
        String plan = user.getSubscriptionPlan();

        if ("PREMIUM".equalsIgnoreCase(plan)) {
            return user;
        }

        if ("TRIAL".equalsIgnoreCase(plan)) {

            if (Boolean.TRUE.equals(user.getTrialUsed())) {
                throw new AccessDeniedException(
                        "Your one-time AI interview trial has already been used. "
                                + "Please upgrade to Premium.");
            }

            return user;
        }

        if ("FREE".equalsIgnoreCase(plan)
                || plan == null
                || plan.isBlank()) {

            long usedAnswers = getAiAnswerCount(user);

            if (usedAnswers >= FREE_ANSWER_LIMIT) {
                throw new AccessDeniedException(
                        "You have used all 3 free AI interview answers. "
                                + "Please visit Subscription & Plans to continue.");
            }

            return user;
        }

        throw new AccessDeniedException(
                "Your subscription plan is not valid. Please check Subscription & Plans.");
    }

    // Check access to an existing interview without applying the start limit.
    // This lets users review their saved results after using the free quota.
    private Interview requireOwnedInterview(
            Long interviewId,
            String email) {

        User user = refreshExpiredPlan(requireVerifiedUser(email));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Interview not found."));

        if (interview.getUser() == null
                || !interview.getUser().getId().equals(user.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to access this interview.");
        }

        if (!"AI".equalsIgnoreCase(interview.getInterviewType())) {
            throw new IllegalArgumentException(
                    "This is not an AI mock interview.");
        }

        return interview;
    }

    // Generate five fresh technical questions using the existing Gemini model.
    private List<Question> generateQuestions(
            String technology,
            String difficulty) {

        String prompt = """
                You are an experienced technical interviewer.

                Generate exactly 5 distinct, technically accurate,
                descriptive interview questions.

                Technology: %s
                Difficulty: %s

                Requirements:
                - Questions must match the selected technology and difficulty.
                - Cover different relevant concepts.
                - Do not generate multiple-choice questions.
                - Do not include answers in the question text.
                - Each question must be clear and suitable for an interview.
                - Return ONLY a valid JSON array, without Markdown fences.

                Required JSON format:
                [
                  {
                    "questionText": "Question text",
                    "category": "Relevant topic"
                  }
                ]
                """.formatted(technology, difficulty);

        try {
            // Keep the existing model unchanged.
            GenerateContentResponse response =
                    geminiClient.models.generateContent(
                            "gemini-2.5-flash",
                            prompt,
                            null);

            String responseText = response.text();

            if (responseText == null || responseText.isBlank()) {
                throw new IllegalStateException(
                        "Gemini returned an empty question response.");
            }

            String json = responseText.trim();

            // Remove Markdown fences if the API includes them.
            if (json.startsWith("```")) {
                json = json
                        .replaceFirst("^```(?:json)?\\s*", "")
                        .replaceFirst("\\s*```$", "")
                        .trim();
            }

            JsonNode root = objectMapper.readTree(json);

            if (!root.isArray()) {
                throw new IllegalStateException(
                        "Gemini did not return a JSON array.");
            }

            List<Question> generatedQuestions = new ArrayList<>();

            for (JsonNode item : root) {
                String questionText =
                        readText(item, "questionText", "");
                String category =
                        readText(item, "category", "Technical");

                if (questionText.isBlank()) {
                    continue;
                }

                Question question = new Question(
                        questionText,
                        technology,
                        difficulty,
                        category);

                generatedQuestions.add(question);

                if (generatedQuestions.size() == TRIAL_QUESTION_LIMIT) {
                    break;
                }
            }

            if (generatedQuestions.size() != TRIAL_QUESTION_LIMIT) {
                throw new IllegalStateException(
                        "Gemini did not generate five valid questions. "
                                + "Please try again.");
            }

            return questionRepository.saveAll(generatedQuestions);

        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Unable to generate questions using Gemini. "
                            + "Check the configured API key, model, network, "
                            + "and API quota.",
                    exception);
        }
    }

    // Safely read a string from a JSON object.
    private String readText(
            JsonNode node,
            String field,
            String defaultValue) {

        JsonNode value = node.get(field);

        if (value == null || value.isNull() || value.asText().isBlank()) {
            return defaultValue;
        }

        return value.asText().trim();
    }

    // Start an AI mock interview according to the user's subscription plan.
    @Transactional
    public AiInterviewResponse startAiInterview(
            AiInterviewRequest request,
            String email) {

        User user = requireStartAccess(email);

        if (request == null
                || request.getTechnology() == null
                || request.getTechnology().isBlank()
                || request.getDifficulty() == null
                || request.getDifficulty().isBlank()) {

            throw new IllegalArgumentException(
                    "Technology and difficulty are required.");
        }

        String technology = request.getTechnology().trim();
        String difficulty = request.getDifficulty().trim()
                .toUpperCase(Locale.ROOT);

        if (!List.of("EASY", "MEDIUM", "HARD").contains(difficulty)) {
            throw new IllegalArgumentException(
                    "Difficulty must be Easy, Medium, or Hard.");
        }

        String plan = user.getSubscriptionPlan();
        int questionLimit = TRIAL_QUESTION_LIMIT;

        // FREE users receive only the questions remaining in their quota.
        if ("FREE".equalsIgnoreCase(plan)
                || plan == null
                || plan.isBlank()) {

            long usedAnswers = getAiAnswerCount(user);
            long remaining = FREE_ANSWER_LIMIT - usedAnswers;

            if (remaining <= 0) {
                throw new AccessDeniedException(
                        "Your 3 free AI interview answers are used. "
                                + "Please upgrade to Premium.");
            }

            questionLimit = (int) Math.min(
                    TRIAL_QUESTION_LIMIT, remaining);
        }

        // Trial users get one five-question AI mock interview.
        if ("TRIAL".equalsIgnoreCase(plan)
                && Boolean.TRUE.equals(user.getTrialUsed())) {

            throw new AccessDeniedException(
                    "Your free trial interview has already been used. "
                            + "Please upgrade to Premium.");
        }

        List<Question> generatedQuestions =
                generateQuestions(technology, difficulty);

        // Assign only the allowed number of questions to this interview.
        List<Question> assignedQuestions = new ArrayList<>(
                generatedQuestions.subList(
                        0, Math.min(questionLimit, generatedQuestions.size())));

        Interview interview = new Interview();
        interview.setTechnology(technology);
        interview.setDifficulty(difficulty);
        interview.setStatus("STARTED");
        interview.setScore(0.0);
        interview.setUser(user);
        interview.setQuestions(assignedQuestions);

        // Used to distinguish AI mock interview answers from regular interviews.
        interview.setInterviewType("AI");

        Interview savedInterview = interviewRepository.save(interview);

        // Mark the trial as used only after interview creation succeeds.
        if ("TRIAL".equalsIgnoreCase(plan)) {
            user.setTrialUsed(true);
            userRepository.save(user);
        }

        Question firstQuestion = assignedQuestions.get(0);

        return new AiInterviewResponse(
                savedInterview.getId(),
                savedInterview.getTechnology(),
                savedInterview.getDifficulty(),
                firstQuestion.getQuestionText(),
                1,
                assignedQuestions.size());
    }

    // Retrieve a question from the saved interview.
    @Transactional(readOnly = true)
    public AiInterviewResponse getAiInterviewQuestion(
            Long interviewId,
            int questionNumber,
            String email) {

        Interview interview = requireOwnedInterview(interviewId, email);

        if ("COMPLETED".equalsIgnoreCase(interview.getStatus())) {
            throw new IllegalArgumentException(
                    "This interview has already been completed.");
        }

        List<Question> questions = interview.getQuestions();

        if (questions == null || questions.isEmpty()) {
            throw new IllegalArgumentException(
                    "No questions are assigned to this interview.");
        }

        if (questionNumber < 1 || questionNumber > questions.size()) {
            throw new IllegalArgumentException("Invalid question number.");
        }

        Question question = questions.get(questionNumber - 1);

        return new AiInterviewResponse(
                interview.getId(),
                interview.getTechnology(),
                interview.getDifficulty(),
                question.getQuestionText(),
                questionNumber,
                questions.size());
    }

    // Evaluate and save one answer, enforcing the FREE account quota.
    @Transactional
    public AiInterviewAnswerResponse submitAiInterviewAnswer(
            Long interviewId,
            AiInterviewAnswerRequest request,
            String email) {

        Interview interview = requireOwnedInterview(interviewId, email);
        User user = refreshExpiredPlan(requireVerifiedUser(email));

        if ("COMPLETED".equalsIgnoreCase(interview.getStatus())) {
            throw new IllegalArgumentException(
                    "Cannot submit an answer to a completed interview.");
        }

        if (request == null || request.getQuestionId() == null) {
            throw new IllegalArgumentException("Question ID is required.");
        }

        if (request.getAnswerText() == null
                || request.getAnswerText().isBlank()) {
            throw new IllegalArgumentException("Answer cannot be empty.");
        }

        Question question = questionRepository.findById(
                        request.getQuestionId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Question not found."));

        boolean belongsToInterview = interview.getQuestions() != null
                && interview.getQuestions().stream()
                .anyMatch(q -> q.getId().equals(question.getId()));

        if (!belongsToInterview) {
            throw new IllegalArgumentException(
                    "Question does not belong to this interview.");
        }

        List<Answer> existingAnswers =
                answerRepository.findByInterviewId(interviewId);

        // Do not allow the same question to consume the quota repeatedly.
        boolean alreadyAnswered = existingAnswers.stream()
                .anyMatch(answer ->
                        answer.getQuestion() != null
                                && answer.getQuestion().getId()
                                .equals(question.getId()));

        if (alreadyAnswered) {
            throw new IllegalArgumentException(
                    "You have already submitted an answer for this question.");
        }

        // Enforce the free limit immediately before saving another answer.
        if ("FREE".equalsIgnoreCase(user.getSubscriptionPlan())
                || user.getSubscriptionPlan() == null
                || user.getSubscriptionPlan().isBlank()) {

            if (getAiAnswerCount(user) >= FREE_ANSWER_LIMIT) {
                throw new AccessDeniedException(
                        "You have used all 3 free AI interview answers. "
                                + "Please visit Subscription & Plans to continue.");
            }
        }

        AnswerRequest answerRequest = new AnswerRequest();
        answerRequest.setInterviewId(interviewId);
        answerRequest.setQuestionId(question.getId());
        answerRequest.setAnswerText(request.getAnswerText().trim());

        // Reuse the existing answer evaluation service.
        Answer savedAnswer = answerService.submitAnswer(answerRequest);

        int questionNumber =
                interview.getQuestions().indexOf(question) + 1;
        int totalQuestions = interview.getQuestions().size();

        Set<Long> answeredQuestionIds = new HashSet<>();

        for (Answer answer : answerRepository.findByInterviewId(interviewId)) {
            if (answer.getQuestion() != null) {
                answeredQuestionIds.add(answer.getQuestion().getId());
            }
        }

        boolean hasNextQuestion = interview.getQuestions().stream()
                .anyMatch(q -> !answeredQuestionIds.contains(q.getId()));

        return new AiInterviewAnswerResponse(
                savedAnswer.getId(),
                question.getId(),
                savedAnswer.getAnswerText(),
                savedAnswer.getScore(),
                savedAnswer.getFeedback(),
                questionNumber,
                totalQuestions,
                hasNextQuestion);
    }

    // Complete the interview only after every assigned question is answered.
    @Transactional
    public Map<String, Object> completeAiInterview(
            Long interviewId,
            String email) {

        Interview interview = requireOwnedInterview(interviewId, email);
        List<Question> questions = interview.getQuestions();

        if (questions == null || questions.isEmpty()) {
            throw new IllegalArgumentException(
                    "No questions are assigned to this interview.");
        }

        if ("COMPLETED".equalsIgnoreCase(interview.getStatus())) {
            throw new IllegalArgumentException(
                    "Interview is already completed.");
        }

        List<Answer> answers =
                answerRepository.findByInterviewId(interviewId);

        Map<Long, Answer> answerByQuestionId = new HashMap<>();

        for (Answer answer : answers) {
            if (answer.getQuestion() != null) {
                answerByQuestionId.putIfAbsent(
                        answer.getQuestion().getId(), answer);
            }
        }

        double totalScore = 0.0;

        for (Question question : questions) {
            Answer answer = answerByQuestionId.get(question.getId());

            if (answer == null) {
                throw new IllegalArgumentException(
                        "Please answer all interview questions before completion.");
            }

            if (answer.getScore() != null) {
                totalScore += answer.getScore();
            }
        }

        double finalScore =
                Math.round((totalScore / questions.size()) * 100.0) / 100.0;

        interview.setScore(finalScore);
        interview.setStatus("COMPLETED");
        interview.setCompletedAt(LocalDateTime.now());

        Interview completedInterview = interviewRepository.save(interview);

        Map<String, Object> result = new HashMap<>();
        result.put("interviewId", completedInterview.getId());
        result.put("technology", completedInterview.getTechnology());
        result.put("difficulty", completedInterview.getDifficulty());
        result.put("status", completedInterview.getStatus());
        result.put("score", completedInterview.getScore());
        result.put("totalQuestions", questions.size());
        result.put("answeredQuestions", questions.size());
        result.put("completedAt", completedInterview.getCompletedAt());

        return result;
    }

    // Return the saved question-wise evaluation in interview order.
    @Transactional(readOnly = true)
    public List<AiInterviewEvaluationResponse> getAiInterviewEvaluation(
            Long interviewId,
            String email) {

        Interview interview = requireOwnedInterview(interviewId, email);

        List<Answer> answers =
                answerRepository.findByInterviewId(interviewId);

        List<AiInterviewEvaluationResponse> evaluations =
                new ArrayList<>();

        for (Question question : interview.getQuestions()) {
            for (Answer answer : answers) {
                if (answer.getQuestion() != null
                        && answer.getQuestion().getId()
                        .equals(question.getId())) {

                    evaluations.add(new AiInterviewEvaluationResponse(
                            question.getId(),
                            question.getQuestionText(),
                            answer.getAnswerText(),
                            answer.getScore(),
                            answer.getFeedback()));
                    break;
                }
            }
        }

        return evaluations;
    }
}
