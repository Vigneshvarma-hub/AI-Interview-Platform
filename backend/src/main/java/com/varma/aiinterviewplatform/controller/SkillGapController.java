package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.SkillGapResponse;
import com.varma.aiinterviewplatform.service.SkillGapService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// This controller exposes REST APIs for skill-gap analysis.
@RestController
@RequestMapping("/api/skill-gaps")
public class SkillGapController {

    // Service used to calculate skill scores and weak skills.
    private final SkillGapService skillGapService;

    // Constructor injection for SkillGapService.
    public SkillGapController(SkillGapService skillGapService) {
        this.skillGapService = skillGapService;
    }

    // This endpoint returns the skill-gap analysis of an interview.
    //
    // Example URL:
    // GET /api/skill-gaps/interview/18
    @GetMapping("/interview/{interviewId}")
    public SkillGapResponse getSkillGap(
            @PathVariable Long interviewId,
            Authentication authentication) {

        // Get the email of the currently logged-in user from JWT.
        String email = authentication.getName();

        // Call the service with interview ID and logged-in user's email.
        return skillGapService.analyzeSkillGap(
                interviewId,
                email
        );
    }
}