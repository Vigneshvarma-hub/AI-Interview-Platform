package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.dto.SkillGapResponse;
import com.varma.aiinterviewplatform.entity.Answer;
import com.varma.aiinterviewplatform.entity.Interview;
import com.varma.aiinterviewplatform.entity.Question;
import com.varma.aiinterviewplatform.repository.AnswerRepository;
import com.varma.aiinterviewplatform.repository.InterviewRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// This service calculates skill-gap analysis
// for the logged-in user's interview.
@Service
public class SkillGapService {

    // Repository used to fetch interview details.
    private final InterviewRepository interviewRepository;

    // Repository used to fetch submitted answers.
    private final AnswerRepository answerRepository;

    // Constructor injection for required repositories.
    public SkillGapService(
            InterviewRepository interviewRepository,
            AnswerRepository answerRepository) {

        this.interviewRepository = interviewRepository;
        this.answerRepository = answerRepository;
    }

    // This method calculates skill-gap details
    // only for the logged-in user's interview.
    public SkillGapResponse analyzeSkillGap(
            Long interviewId,
            String email) {

        // Find the interview using the given interview ID.
        Interview interview = interviewRepository
                .findById(interviewId)
                .orElseThrow(() ->
                        new RuntimeException("Interview not found")
                );

        // Security check:
        // Make sure the requested interview belongs
        // to the currently logged-in user.
        if (interview.getUser() == null
                || interview.getUser().getEmail() == null
                || !interview.getUser().getEmail().equals(email)) {

            throw new RuntimeException(
                    "You are not allowed to access this interview"
            );
        }

        // Fetch all answers submitted for this interview.
        List<Answer> answers =
                answerRepository.findByInterviewId(interviewId);

        // Store the total score for each category.
        // Example: OOP = 17.0, Collections = 12.0
        Map<String, Double> categoryTotalScores =
                new HashMap<>();

        // Store the number of answers in each category.
        Map<String, Integer> categoryAnswerCounts =
                new HashMap<>();

        // Process every submitted answer.
        for (Answer answer : answers) {

            // Get the question connected to this answer.
            Question question = answer.getQuestion();

            // Skip answers where the question is missing.
            if (question == null) {
                continue;
            }

            // Get the question category.
            String category = question.getCategory();

            // If the category is empty, use "General".
            if (category == null || category.isBlank()) {
                category = "General";
            }

            // Get the answer score.
            Double score = answer.getScore();

            // Ignore answers that do not have a score.
            if (score == null) {
                continue;
            }

            // Add the score to the category's total.
            categoryTotalScores.put(
                    category,
                    categoryTotalScores.getOrDefault(
                            category,
                            0.0
                    ) + score
            );

            // Increase the answer count for this category.
            categoryAnswerCounts.put(
                    category,
                    categoryAnswerCounts.getOrDefault(
                            category,
                            0
                    ) + 1
            );
        }

        // Store the final average score of each category.
        Map<String, Double> categoryAverageScores =
                new HashMap<>();

        // Store categories where the score is below 6.
        List<String> weakSkills =
                new ArrayList<>();

        // Calculate the average score for every category.
        for (String category :
                categoryTotalScores.keySet()) {

            // Get the total score of this category.
            Double totalScore =
                    categoryTotalScores.get(category);

            // Get the number of answers in this category.
            Integer answerCount =
                    categoryAnswerCounts.get(category);

            // Calculate the category average.
            Double averageScore =
                    totalScore / answerCount;

            // Round the score to two decimal places.
            averageScore =
                    Math.round(
                            averageScore * 100.0
                    ) / 100.0;

            // Save the category average score.
            categoryAverageScores.put(
                    category,
                    averageScore
            );

            // If the score is below 6,
            // mark it as a weak skill.
            if (averageScore < 6.0) {
                weakSkills.add(category);
            }
        }

        // Return all calculated skill-gap information.
        return new SkillGapResponse(
                interview.getId(),
                interview.getScore(),
                categoryAverageScores,
                weakSkills
        );
    }
}