package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.entity.Question;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionPreparationWorker {

    private final GeminiQuestionGeneratorService generator;
    private final QuestionPreparationCache cache;

    public QuestionPreparationWorker(
            GeminiQuestionGeneratorService generator,
            QuestionPreparationCache cache) {
        this.generator = generator;
        this.cache = cache;
    }

    @Async("testCenterQuestionExecutor")
    public void generate(
            String key,
            String technology,
            String difficulty,
            int questionCount) {

        QuestionPreparationCache.PreparationEntry entry = cache.get(key);

        if (entry == null) {
            return;
        }

        try {
            List<Question> questions = generator.generateQuestions(
                    technology, difficulty, questionCount);

            if (questions == null || questions.size() != questionCount) {
                throw new IllegalStateException(
                        "Gemini did not generate the requested number of questions.");
            }

            entry.markReady(questions);

        } catch (Exception exception) {
            entry.markFailed(
                    "Question generation failed. Please try again. "
                            + exception.getMessage());
        }
    }
}
