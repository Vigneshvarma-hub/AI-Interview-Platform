
package com.varma.aiinterviewplatform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.varma.aiinterviewplatform.entity.Question;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class GeminiQuestionGeneratorService {

    private static final Logger log =
            LoggerFactory.getLogger(GeminiQuestionGeneratorService.class);


    private final Client geminiClient;
    private final ObjectMapper objectMapper;
    private final String modelName;

    public GeminiQuestionGeneratorService(
            Client geminiClient,
            @Value("${gemini.test-center.model:gemini-3.8-flash}")
            String modelName) {

        this.geminiClient = geminiClient;
        this.objectMapper = new ObjectMapper();
        this.modelName = modelName;
    }

    /**
     * Generates the requested MCQ/MSQ questions
     * using one Gemini API request.
     */
    public List<Question> generateQuestions(
            String technology,
            String difficulty,
            int questionCount) {

        if (technology == null || technology.isBlank()) {
            throw new IllegalArgumentException("Technology is required.");
        }

        if (difficulty == null || difficulty.isBlank()) {
            throw new IllegalArgumentException("Difficulty is required.");
        }

        if (questionCount < 1 || questionCount > 50) {
            throw new IllegalArgumentException(
                    "Question count must be between 1 and 50.");
        }

        String subject = technology.trim();
        String level = difficulty.trim().toUpperCase(Locale.ROOT);

        String prompt = """
                Create exactly %d unique technical assessment questions.

                Subject: %s
                Difficulty: %s

                Return only a JSON array. Mix MCQ and MSQ.
                Cover different concepts.

                Every question must have:
                - Four meaningful options A, B, C and D.
                - One concise correct explanation.
                - A specific technical topic as category.

                Avoid duplicate questions, ambiguous questions,
                descriptive interview questions and answers in question text.

                MCQ:
                questionType = "MCQ"
                correctOption = one letter A, B, C or D
                correctOptions = empty string

                MSQ:
                questionType = "MSQ"
                correctOption = empty string
                correctOptions = at least two comma-separated letters

                Each object must contain exactly these fields:

                {
                  "questionText": "Question text",
                  "category": "Specific topic",
                  "questionType": "MCQ or MSQ",
                  "optionA": "Option A text",
                  "optionB": "Option B text",
                  "optionC": "Option C text",
                  "optionD": "Option D text",
                  "correctOption": "A or empty string",
                  "correctOptions": "A,C or empty string",
                  "explanation": "Brief explanation"
                }
                """.formatted(questionCount, subject, level);

        long totalStart = System.nanoTime();

        try {
            log.info(
                    "Starting Gemini question generation. Model: {}, Subject: {}, Difficulty: {}, Count: {}",
                    modelName, subject, level, questionCount);

            GenerateContentConfig config =
                    GenerateContentConfig.builder()
                            .responseMimeType("application/json")
                            .build();

            // Measure only the Gemini API response time.
            long apiStart = System.nanoTime();

            log.info("Sending request to Gemini API...");

            GenerateContentResponse response =
                    geminiClient.models.generateContent(
                            modelName,
                            prompt,
                            config
                    );

            long apiEnd = System.nanoTime();

            log.info(
                    "Gemini API response received in {} seconds.",
                    (apiEnd - apiStart) / 1_000_000_000.0
            );

            // Measure response parsing and validation separately.
            long processingStart = System.nanoTime();

            String responseText = response.text();

            if (responseText == null || responseText.isBlank()) {
                throw new IllegalStateException(
                        "Gemini returned an empty question response.");
            }

            JsonNode root = objectMapper.readTree(
                    removeMarkdownFences(responseText)
            );

            if (root == null || !root.isArray()) {
                throw new IllegalStateException(
                        "Gemini did not return a valid JSON array.");
            }

            List<Question> questions = new ArrayList<>();
            Set<String> uniqueQuestions = new LinkedHashSet<>();

            for (JsonNode item : root) {

                Question question =
                        convertToQuestion(item, subject, level);

                String normalizedText = question.getQuestionText()
                        .trim()
                        .replaceAll("\\s+", " ")
                        .toLowerCase(Locale.ROOT);

                if (uniqueQuestions.add(normalizedText)) {
                    questions.add(question);
                }
            }

            if (questions.size() != questionCount) {
                throw new IllegalStateException(
                        "Gemini generated " + questions.size()
                                + " valid unique questions, but "
                                + questionCount + " were requested. "
                                + "Please try again.");
            }

            long processingEnd = System.nanoTime();

            log.info(
                    "Question parsing and validation completed in {} seconds.",
                    (processingEnd - processingStart) / 1_000_000_000.0
            );

            log.info(
                    "Successfully generated and validated {} questions.",
                    questions.size()
            );

            log.info(
                    "Total question generation service time: {} seconds.",
                    (processingEnd - totalStart) / 1_000_000_000.0
            );

            return questions;

        } catch (Exception exception) {

            log.error(
                    "Test Center question generation failed. Model: {}, Subject: {}, Count: {}",
                    modelName, subject, questionCount, exception
            );

            throw new IllegalStateException(
                    "Test Center question generation failed. Check the Gemini "
                            + "API key, configured model, network connection "
                            + "and API quota. Details: "
                            + exception.getMessage(),
                    exception
            );
        }
    }

    private Question convertToQuestion(
            JsonNode item,
            String technology,
            String difficulty) {

        if (item == null || !item.isObject()) {
            throw new IllegalArgumentException(
                    "Gemini returned an invalid question object.");
        }

        String questionText = readText(item, "questionText");
        String category = readText(item, "category");

        String questionType = readText(item, "questionType")
                .toUpperCase(Locale.ROOT);

        String optionA = readText(item, "optionA");
        String optionB = readText(item, "optionB");
        String optionC = readText(item, "optionC");
        String optionD = readText(item, "optionD");

        String correctOption = readText(item, "correctOption")
                .toUpperCase(Locale.ROOT);

        String correctOptions = readText(item, "correctOptions")
                .toUpperCase(Locale.ROOT);

        String explanation = readText(item, "explanation");

        if (questionText.isBlank()
                || category.isBlank()
                || optionA.isBlank()
                || optionB.isBlank()
                || optionC.isBlank()
                || optionD.isBlank()
                || explanation.isBlank()) {

            throw new IllegalArgumentException(
                    "Gemini returned a question with missing fields.");
        }

        if (!questionType.equals("MCQ")
                && !questionType.equals("MSQ")) {

            throw new IllegalArgumentException(
                    "Question type must be MCQ or MSQ.");
        }

        Question question = new Question(
                questionText,
                technology,
                difficulty,
                category
        );

        question.setQuestionType(questionType);
        question.setOptionA(optionA);
        question.setOptionB(optionB);
        question.setOptionC(optionC);
        question.setOptionD(optionD);
        question.setExplanation(explanation);

        if ("MCQ".equals(questionType)) {

            if (!correctOption.matches("[ABCD]")
                    || !correctOptions.isBlank()) {

                throw new IllegalArgumentException(
                        "Invalid MCQ correct answer.");
            }

            question.setCorrectOption(correctOption);
            question.setCorrectOptions(null);

        } else {

            if (!correctOption.isBlank()) {
                throw new IllegalArgumentException(
                        "MSQ must not use the MCQ answer field.");
            }

            List<String> answers =
                    normalizeCorrectOptions(correctOptions);

            if (answers.size() < 2) {
                throw new IllegalArgumentException(
                        "MSQ must contain at least two correct options.");
            }

            question.setCorrectOption(null);
            question.setCorrectOptions(
                    String.join(",", answers)
            );
        }

        return question;
    }

    private List<String> normalizeCorrectOptions(String value) {

        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    "MSQ correct options are required.");
        }

        Set<String> options = new LinkedHashSet<>();

        String[] parts = value.split(",");

        for (String part : parts) {

            String option = part.trim().toUpperCase(Locale.ROOT);

            if (!option.matches("[ABCD]")) {
                throw new IllegalArgumentException(
                        "MSQ answers must contain only A, B, C or D.");
            }

            options.add(option);
        }

        if (options.size() != parts.length) {
            throw new IllegalArgumentException(
                    "Duplicate correct options were returned.");
        }

        return options.stream().sorted().toList();
    }

    private String readText(JsonNode node, String field) {

        JsonNode value = node.get(field);

        return value == null || value.isNull()
                ? ""
                : value.asText("").trim();
    }

    private String removeMarkdownFences(String response) {

        String json = response.trim();

        if (json.startsWith("```")) {

            json = json
                    .replaceFirst("^```(?:json)?\\s*", "")
                    .replaceFirst("\\s*```$", "")
                    .trim();
        }

        return json;
    }
}
