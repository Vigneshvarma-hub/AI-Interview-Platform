
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.admin.AdminAssessmentResponse;
import com.varma.aiinterviewplatform.dto.admin.AdminDashboardResponse;
import com.varma.aiinterviewplatform.dto.admin.AdminUserDetailResponse;
import com.varma.aiinterviewplatform.dto.admin.AdminUserResponse;
import com.varma.aiinterviewplatform.service.AdminDashboardService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(
            AdminDashboardService adminDashboardService) {

        this.adminDashboardService = adminDashboardService;
    }

    // Get overall admin dashboard statistics.
    @GetMapping("/dashboard")
    public AdminDashboardResponse getDashboardStatistics() {

        return adminDashboardService.getDashboardStatistics();
    }

    // Get all registered users.
    @GetMapping("/users")
    public List<AdminUserResponse> getAllUsers() {

        return adminDashboardService.getAllUsers();
    }

    // Get all assessments for admin monitoring.
    @GetMapping("/assessments")
    public List<AdminAssessmentResponse> getAllAssessments() {

        return adminDashboardService.getAllAssessments();
    }

    // Activate or deactivate a user account.
    @PutMapping("/users/{userId}/status")
    public AdminUserResponse updateUserStatus(
            @PathVariable Long userId,
            @RequestParam Boolean active) {

        return adminDashboardService.updateUserStatus(
                userId,
                active
        );
    }

    // Get complete details and assessment summary of a user.
    @GetMapping("/users/{userId}")
    public AdminUserDetailResponse getUserDetails(
            @PathVariable Long userId) {

        return adminDashboardService.getUserDetails(userId);
    }
}