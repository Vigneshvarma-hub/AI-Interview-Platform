
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.DashboardResponse;
import com.varma.aiinterviewplatform.entity.User;
import com.varma.aiinterviewplatform.repository.UserRepository;
import com.varma.aiinterviewplatform.service.DashboardService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    public DashboardController(
            DashboardService dashboardService,
            UserRepository userRepository) {

        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    // Fetch dashboard for the currently authenticated user.
    @GetMapping("/me")
    public DashboardResponse getMyDashboard() {

        // Get the authenticated user's email from JWT security context.
        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please login to view your dashboard."
            );
        }

        String email = authentication.getName();

        // Find the logged-in user in the database.
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User account not found."
                        )
                );

        // Fetch only this user's dashboard data.
        return dashboardService.getDashboard(user.getId());
    }
}