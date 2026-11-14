package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.entity.TargetRole;
import com.varma.aiinterviewplatform.service.TargetRoleService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/target-role")
public class TargetRoleController {

    private final TargetRoleService targetRoleService;

    // Constructor injection for TargetRoleService.
    public TargetRoleController(TargetRoleService targetRoleService) {
        this.targetRoleService = targetRoleService;
    }

    // Save or update the target role of the logged-in user.
    @PostMapping
    public TargetRole saveTargetRole(
            @RequestParam String roleName,
            Authentication authentication) {

        // Get the logged-in user's email from the JWT.
        String email = authentication.getName();

        // Save or update the target role.
        return targetRoleService.saveTargetRole(roleName, email);
    }

    // Get the current target role of the logged-in user.
    @GetMapping("/my")
    public TargetRole getMyTargetRole(
            Authentication authentication) {

        // Get the logged-in user's email from the JWT.
        String email = authentication.getName();

        // Return the user's target role.
        return targetRoleService.getMyTargetRole(email);
    }
}