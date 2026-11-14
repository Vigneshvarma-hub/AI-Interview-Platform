package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.dto.DashboardResponse;
import com.varma.aiinterviewplatform.entity.Answer;
import com.varma.aiinterviewplatform.entity.Interview;
import com.varma.aiinterviewplatform.repository.AnswerRepository;
import com.varma.aiinterviewplatform.repository.InterviewRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final InterviewRepository interviewRepository;
    private final AnswerRepository answerRepository;

    public DashboardService(
            InterviewRepository interviewRepository,
            AnswerRepository answerRepository) {

        this.interviewRepository = interviewRepository;
        this.answerRepository = answerRepository;
    }

    public DashboardResponse getDashboard(Long userId) {

        List<Interview> allInterviews =
                interviewRepository.findAll();

        List<Interview> userInterviews = new ArrayList<>();

        for (Interview interview : allInterviews) {

            if (interview.getUser() != null &&
                    interview.getUser().getId().equals(userId)) {

                userInterviews.add(interview);
            }
        }

        long totalInterviews = userInterviews.size();

        long completedInterviews = 0;
        double totalScore = 0.0;
        double latestScore = 0.0;

        Interview latestInterview = null;

        for (Interview interview : userInterviews) {

            if ("COMPLETED".equalsIgnoreCase(
                    interview.getStatus())) {

                completedInterviews++;
                totalScore += interview.getScore();
            }

            if (latestInterview == null ||
                    interview.getId() > latestInterview.getId()) {

                latestInterview = interview;
            }
        }

        if (latestInterview != null &&
                latestInterview.getScore() != null) {

            latestScore = latestInterview.getScore();
        }

        double averageScore = 0.0;

        if (completedInterviews > 0) {
            averageScore = totalScore / completedInterviews;
        }

        Map<String, Double> categoryScores =
                new HashMap<>();

        List<String> weakSkills = new ArrayList<>();

        List<Answer> allAnswers =
                answerRepository.findAll();

        Map<String, List<Double>> categoryValues =
                new HashMap<>();

        for (Answer answer : allAnswers) {

            if (answer.getInterview() == null ||
                    answer.getInterview().getUser() == null ||
                    !answer.getInterview().getUser()
                            .getId().equals(userId)) {

                continue;
            }

            if (answer.getQuestion() == null ||
                    answer.getQuestion().getCategory() == null ||
                    answer.getScore() == null) {

                continue;
            }

            String category =
                    answer.getQuestion().getCategory();

            categoryValues
                    .computeIfAbsent(
                            category,
                            key -> new ArrayList<>()
                    )
                    .add(answer.getScore());
        }

        for (Map.Entry<String, List<Double>> entry :
                categoryValues.entrySet()) {

            String category = entry.getKey();
            List<Double> scores = entry.getValue();

            double sum = 0.0;

            for (Double score : scores) {
                sum += score;
            }

            double categoryAverage =
                    sum / scores.size();

            categoryScores.put(
                    category,
                    categoryAverage
            );

            if (categoryAverage < 5.0) {
                weakSkills.add(category);
            }
        }

        return new DashboardResponse(
                totalInterviews,
                completedInterviews,
                averageScore,
                latestScore,
                categoryScores,
                weakSkills
        );
    }
}