package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.dto.RecommendationItemResponse;
import com.varma.aiinterviewplatform.dto.RecommendationResponse;
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
public class RecommendationService {

    private final InterviewRepository interviewRepository;
    private final AnswerRepository answerRepository;

    // Constructor injection for the required repositories.
    public RecommendationService(
            InterviewRepository interviewRepository,
            AnswerRepository answerRepository) {

        this.interviewRepository = interviewRepository;
        this.answerRepository = answerRepository;
    }

    // Returns personalized recommendations for the logged-in user.
    public RecommendationResponse getMyRecommendations(
            String email) {

        // Fetch only completed interviews belonging to this user.
        List<Interview> completedInterviews =
                interviewRepository
                        .findByUser_EmailAndStatusOrderByIdDesc(
                                email,
                                "COMPLETED"
                        );

        // If there are no completed interviews,
        // return an empty recommendation list.
        if (completedInterviews == null ||
                completedInterviews.isEmpty()) {

            return new RecommendationResponse(
                    new ArrayList<>()
            );
        }

        // Stores scores grouped by skill/category.
        //
        // Example:
        // Java -> [8.0, 6.0]
        // SQL  -> [4.0, 5.0]
        Map<String, List<Double>> skillScores =
                new LinkedHashMap<>();

        // Process every completed interview.
        for (Interview interview : completedInterviews) {

            // Get all answers belonging to this interview.
            List<Answer> answers =
                    answerRepository.findByInterviewId(
                            interview.getId()
                    );

            if (answers == null || answers.isEmpty()) {
                continue;
            }

            // Process every answer.
            for (Answer answer : answers) {

                Question question = answer.getQuestion();

                // Skip answers without a question.
                if (question == null) {
                    continue;
                }

                // Question category represents the skill.
                String skill = question.getCategory();

                // Skip missing skill/category.
                if (skill == null || skill.isBlank()) {
                    continue;
                }

                // Skip answers that don't have a score.
                if (answer.getScore() == null) {
                    continue;
                }

                // Create score list for a new skill.
                skillScores.putIfAbsent(
                        skill,
                        new ArrayList<>()
                );

                // Add the answer score to the skill.
                skillScores
                        .get(skill)
                        .add(answer.getScore());
            }
        }

        // Final list of personalized recommendations.
        List<RecommendationItemResponse>
                recommendations = new ArrayList<>();

        // Calculate average score for each skill.
        for (Map.Entry<String, List<Double>> entry :
                skillScores.entrySet()) {

            String skill = entry.getKey();
            List<Double> scores = entry.getValue();

            // Skip if there are no valid scores.
            if (scores.isEmpty()) {
                continue;
            }

            double totalScore = 0.0;

            // Add all scores for this skill.
            for (Double score : scores) {
                totalScore += score;
            }

            // Calculate average.
            double averageScore =
                    totalScore / scores.size();

            // Round to two decimal places.
            averageScore =
                    Math.round(averageScore * 100.0) / 100.0;

            // Only recommend skills below 7/10.
            if (averageScore < 7.0) {

                String priority;

                // Below 5 is considered high priority.
                if (averageScore < 5.0) {
                    priority = "HIGH";
                } else {
                    priority = "MEDIUM";
                }

                // Generate a recommendation based on the skill.
                String recommendation =
                        generateRecommendation(skill);

                // Create one recommendation item.
                RecommendationItemResponse item =
                        new RecommendationItemResponse(
                                skill,
                                averageScore,
                                priority,
                                recommendation
                        );

                // Add it to the final list.
                recommendations.add(item);
            }
        }

        // Return the complete response.
        return new RecommendationResponse(
                recommendations
        );
    }

    // Generates personalized learning advice
    // based on the weak skill.
    private String generateRecommendation(
            String skill) {

        String normalizedSkill =
                skill.trim().toLowerCase();

        switch (normalizedSkill) {

            case "java":
                return "Practice Java OOP, collections, exception handling, multithreading and problem solving.";

            case "spring":
            case "spring boot":
                return "Practice Spring Boot dependency injection, REST APIs, JPA, exception handling and Spring Security.";

            case "sql":
            case "database":
                return "Practice SQL joins, subqueries, aggregation, indexes and query optimization.";

            case "python":
                return "Practice Python data structures, functions, OOP, exception handling and problem solving.";

            case "javascript":
            case "js":
                return "Practice JavaScript functions, arrays, objects, ES6 features, asynchronous programming and DOM concepts.";

            case "react":
                return "Practice React components, props, state, hooks, event handling and API integration.";

            case "oops":
            case "object oriented programming":
                return "Practice encapsulation, inheritance, polymorphism, abstraction and common OOP design problems.";

            case "data structures":
            case "data structures and algorithms":
            case "dsa":
                return "Practice arrays, strings, linked lists, stacks, queues, trees, sorting and searching algorithms.";

            case "operating systems":
            case "os":
                return "Review processes, threads, scheduling, memory management, synchronization and deadlocks.";

            case "computer networks":
            case "networks":
                return "Review OSI and TCP/IP models, HTTP, DNS, TCP, UDP, routing and network security.";

            default:
                return "Practice more questions and review the core concepts of "
                        + skill
                        + " through hands-on exercises and interview problems.";
        }
    }
}