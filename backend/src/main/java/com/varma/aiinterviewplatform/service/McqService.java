package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.dto.McqQuestionResponse;
import com.varma.aiinterviewplatform.entity.Question;
import com.varma.aiinterviewplatform.repository.QuestionRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class McqService {

    private final QuestionRepository questionRepository;

    // Constructor injection for QuestionRepository.
    public McqService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    // Get MCQ questions based on technology and difficulty.
    public List<McqQuestionResponse> getMcqQuestions(
            String technology,
            String difficulty,
            int amount) {

        // Validate technology.
        if (technology == null || technology.isBlank()) {
            throw new RuntimeException("Technology is required.");
        }

        // Validate difficulty.
        if (difficulty == null || difficulty.isBlank()) {
            throw new RuntimeException("Difficulty is required.");
        }

        // Prevent invalid or unnecessarily large question requests.
        if (amount <= 0) {
            throw new RuntimeException("Question amount must be greater than zero.");
        }

        // Limit the maximum number of questions in one assessment.
        if (amount > 20) {
            amount = 20;
        }

        // Fetch only questions that contain MCQ options
        // and a correct answer.
        List<Question> questions =
                questionRepository
                        .findByTechnologyAndDifficultyAndOptionANotNullAndOptionBNotNullAndOptionCNotNullAndOptionDNotNullAndCorrectOptionNotNull(
                                technology,
                                difficulty
                        );

        // If no suitable questions are available, inform the client.
        if (questions.isEmpty()) {
            throw new RuntimeException(
                    "No MCQ questions available for "
                            + technology
                            + " with difficulty "
                            + difficulty
            );
        }

        // Make sure we do not request more questions
        // than are actually available.
        int questionCount = Math.min(amount, questions.size());

        List<McqQuestionResponse> response = new ArrayList<>();

        // Convert Question entities into safe response DTOs.
        for (int i = 0; i < questionCount; i++) {

            Question question = questions.get(i);

            response.add(
                    new McqQuestionResponse(
                            question.getId(),
                            question.getQuestionText(),
                            question.getTechnology(),
                            question.getDifficulty(),
                            question.getCategory(),
                            question.getOptionA(),
                            question.getOptionB(),
                            question.getOptionC(),
                            question.getOptionD()
                    )
            );
        }

        return response;
    }
}