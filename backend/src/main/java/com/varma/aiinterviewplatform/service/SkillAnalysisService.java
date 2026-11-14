package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.dto.SkillAnalysisResponse;
import com.varma.aiinterviewplatform.dto.TechnologyPerformanceResponse;
import com.varma.aiinterviewplatform.entity.Interview;
import com.varma.aiinterviewplatform.repository.InterviewRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SkillAnalysisService {

    private final InterviewRepository interviewRepository;

    // Constructor injection for InterviewRepository.
    public SkillAnalysisService(
            InterviewRepository interviewRepository) {

        this.interviewRepository = interviewRepository;
    }

    // Returns the skill analysis of the logged-in user.
    public SkillAnalysisResponse getMySkillAnalysis(String email) {

        // Fetch only completed interviews belonging to this user.
        List<Interview> completedInterviews =
                interviewRepository
                        .findByUser_EmailAndStatusOrderByIdDesc(
                                email,
                                "COMPLETED"
                        );

        // If the user has no completed interviews,
        // return an empty analysis instead of throwing an error.
        if (completedInterviews == null ||
                completedInterviews.isEmpty()) {

            return new SkillAnalysisResponse(
                    0,
                    0.0,
                    new ArrayList<>()
            );
        }

        // Total number of completed interviews.
        int totalInterviews = completedInterviews.size();

        // Calculate total score of all completed interviews.
        double totalScore = 0.0;

        for (Interview interview : completedInterviews) {

            // Interview score can theoretically be null.
            // We ignore null scores during calculation.
            if (interview.getScore() != null) {
                totalScore += interview.getScore();
            }
        }

        // Calculate overall average score.
        double overallAverageScore =
                totalScore / totalInterviews;

        // Maps technology name to list of interview scores.
        //
        // Example:
        // Java -> [8.0, 7.0, 9.0]
        // Python -> [6.0, 7.0]
        Map<String, List<Double>> technologyScores =
                new LinkedHashMap<>();

        // Group interview scores according to technology.
        for (Interview interview : completedInterviews) {

            String technology = interview.getTechnology();

            // Ignore interviews where technology is missing.
            if (technology == null || technology.isBlank()) {
                continue;
            }

            // Create an empty list for a new technology.
            technologyScores.putIfAbsent(
                    technology,
                    new ArrayList<>()
            );

            // Add the score to that technology.
            if (interview.getScore() != null) {
                technologyScores
                        .get(technology)
                        .add(interview.getScore());
            }
        }

        // Final technology-wise performance list.
        List<TechnologyPerformanceResponse>
                technologyPerformance = new ArrayList<>();

        // Calculate average score for every technology.
        for (Map.Entry<String, List<Double>> entry :
                technologyScores.entrySet()) {

            String technology = entry.getKey();
            List<Double> scores = entry.getValue();

            // Skip technology if there are no valid scores.
            if (scores.isEmpty()) {
                continue;
            }

            double technologyTotal = 0.0;

            for (Double score : scores) {
                technologyTotal += score;
            }

            double averageScore =
                    technologyTotal / scores.size();

            // Round the score to two decimal places.
            averageScore =
                    Math.round(averageScore * 100.0) / 100.0;

            // Create technology performance response.
            TechnologyPerformanceResponse performance =
                    new TechnologyPerformanceResponse(
                            technology,
                            scores.size(),
                            averageScore
                    );

            technologyPerformance.add(performance);
        }

        // Round overall average score to two decimal places.
        overallAverageScore =
                Math.round(overallAverageScore * 100.0) / 100.0;

        // Return the complete skill analysis response.
        return new SkillAnalysisResponse(
                totalInterviews,
                overallAverageScore,
                technologyPerformance
        );
    }
}