package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.SkillExtractionResponse;
import com.varma.aiinterviewplatform.service.SkillExtractionService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// This controller provides the API for extracting skills from a resume.
@RestController
@RequestMapping("/api/skill-extraction")
public class SkillExtractionController {

    private final SkillExtractionService skillExtractionService;

    // Constructor injection for SkillExtractionService.
    public SkillExtractionController(
            SkillExtractionService skillExtractionService) {

        this.skillExtractionService = skillExtractionService;
    }

    // Extract skills from the logged-in user's resume.
    @GetMapping("/my")
    public SkillExtractionResponse extractMySkills(
            Authentication authentication) {

        // Get the logged-in user's email from the JWT authentication.
        String email = authentication.getName();

        // Extract and return the skills from the user's resume.
        return skillExtractionService.extractSkills(email);
    }
}