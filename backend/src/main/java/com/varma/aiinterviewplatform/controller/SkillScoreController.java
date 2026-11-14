package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.SkillScoreResponse;
import com.varma.aiinterviewplatform.service.SkillScoreService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/skill-scores")
public class SkillScoreController {

    private final SkillScoreService skillScoreService;

    // Constructor injection for SkillScoreService.
    public SkillScoreController(
            SkillScoreService skillScoreService) {

        this.skillScoreService = skillScoreService;
    }

    // Returns skill-wise scores for the logged-in user.
    @GetMapping("/my")
    public List<SkillScoreResponse> getMySkillScores(
            Authentication authentication) {

        // JWT authentication contains the user's email.
        String email = authentication.getName();

        // Calculate and return skill-wise scores.
        return skillScoreService.getMySkillScores(email);
    }
}