
package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.entity.Question;
import com.varma.aiinterviewplatform.repository.QuestionRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    // Constructor injection for the question repository.
    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    // Save a new question to the database.
    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }

    // Retrieve questions for a technology.
    public List<Question> getQuestionsByTechnology(
            String technology) {

        if (technology == null || technology.isBlank()) {
            throw new IllegalArgumentException(
                    "Technology is required");
        }

        return questionRepository.findByTechnologyIgnoreCase(
                technology.trim());
    }

    // Retrieve questions for a technology and difficulty.
    public List<Question> getQuestionsByTechnologyAndDifficulty(
            String technology,
            String difficulty) {

        if (technology == null || technology.isBlank()
                || difficulty == null || difficulty.isBlank()) {
            throw new IllegalArgumentException(
                    "Technology and difficulty are required");
        }

        return questionRepository.findMatchingQuestions(
                technology.trim(),
                difficulty.trim().toUpperCase(Locale.ROOT));
    }
}
