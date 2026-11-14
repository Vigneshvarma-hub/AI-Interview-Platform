package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.dto.SkillScoreResponse;
import com.varma.aiinterviewplatform.entity.Answer;
import com.varma.aiinterviewplatform.entity.Interview;
import com.varma.aiinterviewplatform.entity.Question;
import com.varma.aiinterviewplatform.repository.AnswerRepository;
import com.varma.aiinterviewplatform.repository.InterviewRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SkillScoreService {

    private final InterviewRepository interviewRepository;
    private final AnswerRepository answerRepository;

    // Constructor injection for required repositories.
    public SkillScoreService(
            InterviewRepository interviewRepository,
            AnswerRepository answerRepository) {

        this.interviewRepository = interviewRepository;
        this.answerRepository = answerRepository;
    }

    // Calculates skill-wise scores for the logged-in user.
    public List<SkillScoreResponse> getMySkillScores(
            String email) {

        // Fetch completed interviews of the logged-in user.
        List<Interview> interviews =
                interviewRepository
                        .findByUser_EmailAndStatusOrderByIdDesc(
                                email,
                                "COMPLETED"
                        );

        // Store scores grouped by skill/category.
        Map<String, List<Double>> skillScores =
                new LinkedHashMap<>();

        // Process every completed interview.
        for (Interview interview : interviews) {

            // Get answers belonging to this interview.
            List<Answer> answers =
                    answerRepository.findByInterviewId(
                            interview.getId()
                    );

            if (answers == null || answers.isEmpty()) {
                continue;
            }

            // Process every answer.
            for (Answer answer : answers) {

                Question question =
                        answer.getQuestion();

                // Skip answers without a question.
                if (question == null) {
                    continue;
                }

                // Use question category as the skill.
                String skill =
                        question.getCategory();

                // Skip missing skills.
                if (skill == null ||
                        skill.isBlank()) {
                    continue;
                }

                // Skip answers without a score.
                if (answer.getScore() == null) {
                    continue;
                }

                // Create list for a new skill.
                skillScores.putIfAbsent(
                        skill,
                        new ArrayList<>()
                );

                // Add answer score to that skill.
                skillScores
                        .get(skill)
                        .add(answer.getScore());
            }
        }

        // Final response list.
        List<SkillScoreResponse> result =
                new ArrayList<>();

        // Calculate average score for every skill.
        for (Map.Entry<String, List<Double>> entry :
                skillScores.entrySet()) {

            String skill =
                    entry.getKey();

            List<Double> scores =
                    entry.getValue();

            if (scores.isEmpty()) {
                continue;
            }

            // Calculate total score.
            double total = 0.0;

            for (Double score : scores) {
                total += score;
            }

            // Calculate average score.
            double average =
                    total / scores.size();

            // Round score to two decimal places.
            average =
                    Math.round(
                            average * 100.0
                    ) / 100.0;

            // Create response object.
            SkillScoreResponse response =
                    new SkillScoreResponse(
                            skill,
                            average,
                            scores.size()
                    );

            result.add(response);
        }

        return result;
    }
}