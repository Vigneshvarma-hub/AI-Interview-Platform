package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.SkillAnalysisResponse;
import com.varma.aiinterviewplatform.service.SkillAnalysisService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/skill-analysis")
public class SkillAnalysisController {

    private final SkillAnalysisService skillAnalysisService;

    // Constructor injection for SkillAnalysisService.
    public SkillAnalysisController(
            SkillAnalysisService skillAnalysisService) {

        this.skillAnalysisService = skillAnalysisService;
    }

    // Returns skill analysis for the currently logged-in user.
    @GetMapping("/my")
    public SkillAnalysisResponse getMySkillAnalysis(
            Authentication authentication) {

        // JWT authentication contains the logged-in user's email.
        String email = authentication.getName();

        // Send the email to the service.
        return skillAnalysisService.getMySkillAnalysis(email);
    }
}