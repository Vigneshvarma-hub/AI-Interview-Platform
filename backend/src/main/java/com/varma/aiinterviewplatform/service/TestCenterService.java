package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.dto.TestCenterAnswerRequest;
import com.varma.aiinterviewplatform.dto.TestCenterAnswerResponse;
import com.varma.aiinterviewplatform.dto.TestQuestionAnalysisResponse;
import com.varma.aiinterviewplatform.dto.TestQuestionResponse;
import com.varma.aiinterviewplatform.dto.TestResultResponse;
import com.varma.aiinterviewplatform.dto.TestStartRequest;
import com.varma.aiinterviewplatform.dto.TestStartResponse;

import com.varma.aiinterviewplatform.entity.Answer;
import com.varma.aiinterviewplatform.entity.Interview;
import com.varma.aiinterviewplatform.entity.Question;
import com.varma.aiinterviewplatform.entity.User;

import com.varma.aiinterviewplatform.repository.AnswerRepository;
import com.varma.aiinterviewplatform.repository.InterviewRepository;
import com.varma.aiinterviewplatform.repository.QuestionRepository;
import com.varma.aiinterviewplatform.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Service
public class TestCenterService {

    private final InterviewRepository interviewRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final AnswerRepository answerRepository;
    private final QuestionPreparationCache preparationCache;
    private final QuestionPreparationWorker preparationWorker;

    public TestCenterService(
            InterviewRepository interviewRepository,
            QuestionRepository questionRepository,
            UserRepository userRepository,
            AnswerRepository answerRepository,
            QuestionPreparationCache preparationCache,
            QuestionPreparationWorker preparationWorker) {

        this.interviewRepository = interviewRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.answerRepository = answerRepository;
        this.preparationCache = preparationCache;
        this.preparationWorker = preparationWorker;
    }

    @Transactional
    public TestStartResponse startTest(
            TestStartRequest request,
            String email) {

        validatePreparationRequest(request);

        int questionCount = request.getQuestionCount() == null
                ? 10 : request.getQuestionCount();

        int duration = request.getDurationMinutes() == null
                ? 20 : request.getDurationMinutes();

        if (duration < 1 || duration > 120) {
            throw new IllegalArgumentException(
                    "Duration must be between 1 and 120 minutes.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found."));

        String technology = request.getTechnology().trim();
        String difficulty = request.getDifficulty()
                .trim().toUpperCase(Locale.ROOT);

        String key = createPreparationKey(
                email, technology, difficulty, questionCount);

        List<Question> generatedQuestions =
                preparationCache.getReadyQuestions(key);

        List<Question> selected =
                questionRepository.saveAll(generatedQuestions);

        LocalDateTime start = LocalDateTime.now();

        Interview test = new Interview();
        test.setTechnology(technology);
        test.setDifficulty(difficulty);
        test.setInterviewType("TEST_CENTER");
        test.setStatus("STARTED");
        test.setScore(0.0);
        test.setStartedAt(start);
        test.setExpiresAt(start.plusMinutes(duration));
        test.setDurationMinutes(duration);
        test.setUser(user);
        test.setQuestions(selected);

        Interview saved = interviewRepository.save(test);

        removePreparationCacheAfterCommit(key);

        List<TestQuestionResponse> questionResponses = new ArrayList<>();

        for (int i = 0; i < selected.size(); i++) {
            Question q = selected.get(i);

            questionResponses.add(new TestQuestionResponse(
                    q.getId(),
                    q.getQuestionText(),
                    q.getTechnology(),
                    q.getDifficulty(),
                    q.getCategory(),
                    resolveQuestionType(q),
                    q.getOptionA(),
                    q.getOptionB(),
                    q.getOptionC(),
                    q.getOptionD(),
                    i + 1,
                    selected.size()));
        }

        return new TestStartResponse(
                saved.getId(),
                saved.getTechnology(),
                saved.getDifficulty(),
                saved.getStatus(),
                saved.getStartedAt(),
                saved.getExpiresAt(),
                saved.getDurationMinutes(),
                selected.size(),
                questionResponses);
    }

    /**
     * Save or update a draft answer.
     * Correct answers are not returned during the test.
     */
    @Transactional
    public TestCenterAnswerResponse saveAnswer(
            Long testId,
            TestCenterAnswerRequest request,
            String email) {

        if (request == null || request.getQuestionId() == null) {
            throw new IllegalArgumentException(
                    "Question ID is required.");
        }

        Interview test = getOwnedTest(testId, email);
        validateTestCanBeEdited(test);

        Question question = test.getQuestions().stream()
                .filter(q -> q.getId().equals(request.getQuestionId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Question does not belong to this test."));

        List<String> selected = normalizeOptions(
                request.getSelectedOptions());

        validateSelectedOptions(question, selected);

        Answer answer = answerRepository
                .findByInterview_IdAndQuestion_Id(
                        testId, question.getId())
                .orElseGet(() -> {
                    Answer newAnswer = new Answer();
                    newAnswer.setInterview(test);
                    newAnswer.setQuestion(question);
                    return newAnswer;
                });

        answer.setAnswerText(String.join(",", selected));
        answer.setMarkedForReview(request.isMarkedForReview());

        // Correct answers are evaluated only during final submission.
        answer.setScore(null);
        answer.setFeedback("Not evaluated yet");

        answerRepository.save(answer);

        return new TestCenterAnswerResponse(
                question.getId(),
                true,
                !selected.isEmpty(),
                request.isMarkedForReview(),
                "Answer saved.");
    }

    /**
     * Submit a test, grade every question on the server, and close the attempt.
     */
    @Transactional
    public TestResultResponse submitTest(
            Long testId,
            String email) {

        Interview test = getOwnedTest(testId, email);

        if ("COMPLETED".equalsIgnoreCase(test.getStatus())) {
            return buildResult(test);
        }

        if (!"STARTED".equalsIgnoreCase(test.getStatus())) {
            throw new IllegalArgumentException(
                    "This test is not available for submission.");
        }

        test.setStatus("COMPLETED");

        List<Answer> answers = answerRepository.findByInterviewId(testId);

        Map<Long, Answer> answerByQuestion = answers.stream()
                .collect(Collectors.toMap(
                        a -> a.getQuestion().getId(),
                        a -> a,
                        (first, second) -> first));

        double totalScore = 0.0;
        int correctCount = 0;

        for (Question question : test.getQuestions()) {

            Answer answer = answerByQuestion.get(question.getId());

            if (answer == null) {
                answer = new Answer();
                answer.setInterview(test);
                answer.setQuestion(question);
                answer.setAnswerText("");
                answer.setMarkedForReview(false);
            }

            List<String> selected = normalizeOptionsFromStoredAnswer(
                    answer.getAnswerText());

            boolean correct = isCorrectAnswer(question, selected);
            double score = correct ? 1.0 : 0.0;

            answer.setScore(score);
            answer.setFeedback(correct
                    ? "Correct answer."
                    : "Incorrect answer.");

            totalScore += score;

            if (correct) {
                correctCount++;
            }

            answerRepository.save(answer);
        }

        int totalQuestions = test.getQuestions().size();

        double percentage = totalQuestions == 0
                ? 0.0
                : round2(totalScore * 100.0 / totalQuestions);

        test.setScore(percentage);
        test.setCompletedAt(LocalDateTime.now());
        test.setStatus("COMPLETED");

        interviewRepository.save(test);

        return buildResult(test);
    }

    /**
     * Get results only for the owning user and only after completion.
     */
    @Transactional(readOnly = true)
    public TestResultResponse getResult(
            Long testId,
            String email) {

        Interview test = getOwnedTest(testId, email);

        if (!"COMPLETED".equalsIgnoreCase(test.getStatus())) {
            throw new IllegalArgumentException(
                    "Submit the test before viewing the analysis.");
        }

        return buildResult(test);
    }

    /**
     * Build the complete test result.
     */
    private TestResultResponse buildResult(Interview test) {

        List<Question> questions = test.getQuestions();

        List<Answer> savedAnswers =
                answerRepository.findByInterviewId(test.getId());

        Map<Long, Answer> answerByQuestion = savedAnswers.stream()
                .collect(Collectors.toMap(
                        a -> a.getQuestion().getId(),
                        a -> a,
                        (first, second) -> first));

        int answered = 0;
        int correctCount = 0;
        int markedCount = 0;
        double totalScore = 0.0;

        Map<String, double[]> topicTotals = new LinkedHashMap<>();

        List<TestQuestionAnalysisResponse> analysis = new ArrayList<>();

        for (Question q : questions) {

            Answer a = answerByQuestion.get(q.getId());

            List<String> selected = a == null
                    ? List.of()
                    : normalizeOptionsFromStoredAnswer(a.getAnswerText());

            // Count only questions with a non-empty selected answer.
            boolean isAnswered = !selected.isEmpty();

            boolean isCorrect = isCorrectAnswer(q, selected);
            boolean marked = a != null && a.isMarkedForReview();

            double score = isCorrect ? 1.0 : 0.0;

            if (isAnswered) {
                answered++;
            }

            if (marked) {
                markedCount++;
            }

            if (isCorrect) {
                correctCount++;
            }

            totalScore += score;

            String topic = q.getCategory() == null
                    || q.getCategory().isBlank()
                    ? "General"
                    : q.getCategory();

            double[] topicStat = topicTotals.computeIfAbsent(
                    topic, ignored -> new double[2]);

            topicStat[0] += score;
            topicStat[1] += 1.0;

            String correctAnswer = "MSQ".equals(resolveQuestionType(q))
                    ? normalizeOptionsFromStoredAnswer(q.getCorrectOptions())
                    .stream()
                    .sorted()
                    .collect(Collectors.joining(","))
                    : safeOption(q.getCorrectOption());

            analysis.add(new TestQuestionAnalysisResponse(
                    q.getId(),
                    q.getQuestionText(),
                    q.getCategory(),
                    resolveQuestionType(q),
                    q.getOptionA(),
                    q.getOptionB(),
                    q.getOptionC(),
                    q.getOptionD(),
                    String.join(",", selected),
                    correctAnswer,
                    q.getExplanation(),
                    isCorrect,
                    isAnswered,
                    marked,
                    score));
        }

        Map<String, Double> topicScores = new LinkedHashMap<>();

        topicTotals.forEach((topic, stat) ->
                topicScores.put(
                        topic,
                        stat[1] == 0.0
                                ? 0.0
                                : round2(stat[0] * 100.0 / stat[1])));

        int total = questions.size();

        double percentage = total == 0
                ? 0.0
                : round2(totalScore * 100.0 / total);

        // Average score from completed Test Center assessments only.
        Double average =
                interviewRepository
                        .findAverageScoreByUserIdAndInterviewTypeIgnoreCaseAndStatusIgnoreCase(
                                test.getUser().getId(),
                                "TEST_CENTER",
                                "COMPLETED");

        // Highest score from completed Test Center assessments only.
        Double highest =
                interviewRepository
                        .findHighestScoreByUserIdAndInterviewTypeIgnoreCaseAndStatusIgnoreCase(
                                test.getUser().getId(),
                                "TEST_CENTER",
                                "COMPLETED");

        return new TestResultResponse(
                test.getId(),
                test.getTechnology(),
                test.getDifficulty(),
                test.getStatus(),
                total,
                answered,
                Math.max(0, total - answered),
                correctCount,
                Math.max(0, answered - correctCount),
                markedCount,
                totalScore,
                percentage,
                average == null ? 0.0 : round2(average),
                highest == null ? 0.0 : round2(highest),
                topicScores,
                analysis);
    }

    private Interview getOwnedTest(Long testId, String email) {

        Interview test = interviewRepository.findById(testId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Test not found."));

        if (test.getUser() == null
                || !test.getUser().getEmail().equalsIgnoreCase(email)
                || !"TEST_CENTER".equalsIgnoreCase(test.getInterviewType())) {

            throw new IllegalArgumentException(
                    "Test not found for this user.");
        }

        return test;
    }

    private void validateTestCanBeEdited(Interview test) {

        if (!"STARTED".equalsIgnoreCase(test.getStatus())) {
            throw new IllegalArgumentException(
                    "This test is no longer accepting answers.");
        }

        if (test.getExpiresAt() == null
                || LocalDateTime.now().isAfter(test.getExpiresAt())) {

            throw new IllegalArgumentException(
                    "Test time has expired. Please submit the test.");
        }
    }

    private boolean isValidObjectiveQuestion(Question q) {

        if (q.getOptionA() == null
                || q.getOptionB() == null
                || q.getOptionC() == null
                || q.getOptionD() == null) {
            return false;
        }

        if ("MSQ".equals(resolveQuestionType(q))) {
            return q.getCorrectOptions() != null
                    && !q.getCorrectOptions().isBlank();
        }

        return q.getCorrectOption() != null
                && !q.getCorrectOption().isBlank();
    }

    private String resolveQuestionType(Question q) {

        if (q.getQuestionType() != null
                && !q.getQuestionType().isBlank()) {

            return q.getQuestionType().trim().toUpperCase(Locale.ROOT);
        }

        if (q.getCorrectOptions() != null
                && !q.getCorrectOptions().isBlank()) {
            return "MSQ";
        }

        return "MCQ";
    }

    private List<String> normalizeOptions(List<String> options) {

        if (options == null) {
            return List.of();
        }

        Set<String> normalized = new LinkedHashSet<>();

        for (String option : options) {

            if (option == null || option.isBlank()) {
                continue;
            }

            String value = option.trim().toUpperCase(Locale.ROOT);

            if (!value.matches("[ABCD]")) {
                throw new IllegalArgumentException(
                        "Options must be A, B, C, or D.");
            }

            normalized.add(value);
        }

        return normalized.stream().sorted().toList();
    }

    private List<String> normalizeOptionsFromStoredAnswer(String answer) {

        if (answer == null || answer.isBlank()) {
            return List.of();
        }

        return normalizeOptions(List.of(answer.split(",")));
    }

    private void validateSelectedOptions(
            Question question,
            List<String> selected) {

        String type = resolveQuestionType(question);

        if ("MCQ".equals(type) && selected.size() > 1) {
            throw new IllegalArgumentException(
                    "MCQ accepts only one selected option.");
        }

        if ("MSQ".equals(type)
                && !selected.isEmpty()
                && question.getCorrectOptions() == null) {

            throw new IllegalArgumentException(
                    "MSQ correct options are not configured.");
        }
    }

    private boolean isCorrectAnswer(
            Question question,
            List<String> selected) {

        if (selected.isEmpty()) {
            return false;
        }

        List<String> expected;

        if ("MSQ".equals(resolveQuestionType(question))) {

            expected = normalizeOptionsFromStoredAnswer(
                    question.getCorrectOptions());

        } else {

            expected = normalizeOptions(
                    List.of(question.getCorrectOption()));
        }

        return selected.size() == expected.size()
                && selected.containsAll(expected)
                && expected.containsAll(selected);
    }

    private String safeOption(String option) {
        return option == null
                ? ""
                : option.trim().toUpperCase(Locale.ROOT);
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    /**
     * Begin background Gemini question preparation.
     */
    public Map<String, Object> prepareQuestions(
            TestStartRequest request,
            String email) {

        validatePreparationRequest(request);

        userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found."));

        String technology = request.getTechnology().trim();

        String difficulty = request.getDifficulty()
                .trim()
                .toUpperCase(Locale.ROOT);

        int count = request.getQuestionCount() == null
                ? 10
                : request.getQuestionCount();

        String key = createPreparationKey(
                email, technology, difficulty, count);

        QuestionPreparationCache.PreparationEntry existing =
                preparationCache.get(key);

        if (existing == null
                || existing.getStatus()
                == QuestionPreparationCache.Status.FAILED) {

            preparationCache.create(key);

            preparationWorker.generate(
                    key, technology, difficulty, count);
        }

        return preparationStatus(request, email);
    }

    /**
     * Return the current question-generation status.
     */
    public Map<String, Object> preparationStatus(
            TestStartRequest request,
            String email) {

        validatePreparationRequest(request);

        String technology = request.getTechnology().trim();

        String difficulty = request.getDifficulty()
                .trim()
                .toUpperCase(Locale.ROOT);

        int count = request.getQuestionCount() == null
                ? 10
                : request.getQuestionCount();

        String key = createPreparationKey(
                email, technology, difficulty, count);

        QuestionPreparationCache.PreparationEntry entry =
                preparationCache.get(key);

        Map<String, Object> response = new HashMap<>();

        response.put(
                "status",
                entry == null
                        ? "NOT_STARTED"
                        : entry.getStatus().name());

        response.put("technology", technology);
        response.put("difficulty", difficulty);
        response.put("questionCount", count);

        if (entry != null && entry.getErrorMessage() != null) {
            response.put("message", entry.getErrorMessage());
        }

        return response;
    }

    /**
     * Remove prepared questions only after the transaction commits.
     */
    private void removePreparationCacheAfterCommit(String key) {

        if (TransactionSynchronizationManager.isSynchronizationActive()) {

            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {

                        @Override
                        public void afterCommit() {
                            preparationCache.remove(key);
                        }
                    });

        } else {

            preparationCache.remove(key);
        }
    }

    private void validatePreparationRequest(TestStartRequest request) {

        if (request == null
                || request.getTechnology() == null
                || request.getTechnology().isBlank()
                || request.getDifficulty() == null
                || request.getDifficulty().isBlank()) {

            throw new IllegalArgumentException(
                    "Subject and difficulty are required.");
        }

        int count = request.getQuestionCount() == null
                ? 10
                : request.getQuestionCount();

        if (count < 1 || count > 50) {
            throw new IllegalArgumentException(
                    "Question count must be between 1 and 50.");
        }
    }

    private String createPreparationKey(
            String email,
            String technology,
            String difficulty,
            int count) {

        try {

            String raw = email.toLowerCase(Locale.ROOT)
                    + "|"
                    + technology.toLowerCase(Locale.ROOT)
                    + "|"
                    + difficulty
                    + "|"
                    + count;

            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(raw.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(digest);

        } catch (NoSuchAlgorithmException exception) {

            throw new IllegalStateException(
                    "Unable to create preparation key.",
                    exception);
        }
    }
}