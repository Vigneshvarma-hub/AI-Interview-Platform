package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.dto.admin.AdminAssessmentResponse;
import com.varma.aiinterviewplatform.dto.admin.AdminDashboardResponse;
import com.varma.aiinterviewplatform.dto.admin.AdminUserResponse;
import com.varma.aiinterviewplatform.entity.Interview;
import com.varma.aiinterviewplatform.entity.User;
import com.varma.aiinterviewplatform.repository.AnswerRepository;
import com.varma.aiinterviewplatform.repository.InterviewRepository;
import com.varma.aiinterviewplatform.repository.UserRepository;
import com.varma.aiinterviewplatform.dto.admin.AdminUserDetailResponse;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final InterviewRepository interviewRepository;
    private final AnswerRepository answerRepository;

    public AdminDashboardService(
            UserRepository userRepository,
            InterviewRepository interviewRepository,
            AnswerRepository answerRepository) {

        this.userRepository = userRepository;
        this.interviewRepository = interviewRepository;
        this.answerRepository = answerRepository;
    }

    // ==========================================
    // 1. ADMIN DASHBOARD STATISTICS
    // ==========================================

    public AdminDashboardResponse getDashboardStatistics() {

        // Total registered users
        long totalUsers = userRepository.count();

        // Retrieve all assessments
        List<Interview> interviews = interviewRepository.findAll();

        // Total assessments
        long totalAssessments = interviews.size();

        // Count completed assessments
        long completedAssessments = interviews.stream()
                .filter(interview ->
                        interview.getStatus() != null &&
                                interview.getStatus()
                                        .equalsIgnoreCase("COMPLETED"))
                .count();

        // Count pending assessments
        long pendingAssessments =
                totalAssessments - completedAssessments;

        // Total submitted answers
        long totalAnswers = answerRepository.count();

        // Calculate average score from completed assessments
        double averageScore = interviews.stream()
                .filter(interview ->
                        interview.getStatus() != null &&
                                interview.getStatus()
                                        .equalsIgnoreCase("COMPLETED"))
                .map(Interview::getScore)
                .filter(score -> score != null)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

        return new AdminDashboardResponse(
                totalUsers,
                totalAssessments,
                completedAssessments,
                pendingAssessments,
                totalAnswers,
                averageScore
        );
    }

    // ==========================================
    // 2. ADMIN USER MANAGEMENT
    // ==========================================


    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> new AdminUserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole(),
                        user.getActive()
                ))
                .collect(Collectors.toList());
    }

    // ==========================================
    // 3. ADMIN ASSESSMENT MONITORING
    // ==========================================

    public List<AdminAssessmentResponse> getAllAssessments() {

        // Retrieve every assessment from the database
        List<Interview> interviews = interviewRepository.findAll();

        // Convert Interview entities into safe response DTOs
        return interviews.stream()
                .map(interview -> new AdminAssessmentResponse(

                        interview.getId(),

                        interview.getUser() != null
                                ? interview.getUser().getName()
                                : "Unknown User",

                        interview.getUser() != null
                                ? interview.getUser().getEmail()
                                : "N/A",

                        interview.getTechnology(),

                        interview.getDifficulty(),

                        interview.getStatus(),

                        interview.getScore(),

                        interview.getCreatedAt(),

                        interview.getCompletedAt()
                ))
                .collect(Collectors.toList());
    }

    // Activate or deactivate a user account.
    public AdminUserResponse updateUserStatus(Long userId, Boolean active) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found with ID: " + userId)
                );

        // Prevent changing the status of an administrator.
        if ("ADMIN".equalsIgnoreCase(user.getRole()) ||
                "ROLE_ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException(
                    "Administrator account status cannot be changed."
            );
        }

        user.setActive(active);

        User updatedUser = userRepository.save(user);

        return new AdminUserResponse(
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getEmail(),
                updatedUser.getRole(),
                updatedUser.getActive()
        );
    }

    // Fetch complete details and assessment summary for a specific user.
    public AdminUserDetailResponse getUserDetails(Long userId) {

        // Find the user by ID.
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with ID: " + userId
                        )
                );

        // Fetch all assessments belonging to this user.
        List<Interview> interviews =
                interviewRepository.findByUser_EmailOrderByIdDesc(
                        user.getEmail()
                );

        // Count total assessments.
        long totalAssessments =
                interviewRepository.countByUser_Id(userId);

        // Count completed assessments.
        long completedAssessments =
                interviewRepository.countByUser_IdAndStatusIgnoreCase(
                        userId,
                        "COMPLETED"
                );

        // Calculate average score.
        Double averageScore =
                interviewRepository.findAverageScoreByUserId(userId);

        // Convert interview entities into response DTOs.
        List<AdminAssessmentResponse> assessmentResponses =
                interviews.stream()
                        .map(interview -> new AdminAssessmentResponse(
                                interview.getId(),
                                interview.getUser() != null
                                        ? interview.getUser().getName()
                                        : "Unknown User",
                                interview.getUser() != null
                                        ? interview.getUser().getEmail()
                                        : "N/A",
                                interview.getTechnology(),
                                interview.getDifficulty(),
                                interview.getStatus(),
                                interview.getScore(),
                                interview.getCreatedAt(),
                                interview.getCompletedAt()
                        ))
                        .collect(Collectors.toList());

        // Return complete user details and assessment summary.
        return new AdminUserDetailResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getActive(),
                totalAssessments,
                completedAssessments,
                averageScore != null ? averageScore : 0.0,
                assessmentResponses
        );
    }
}