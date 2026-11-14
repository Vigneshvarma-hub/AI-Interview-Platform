package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.McqQuestionResponse;
import com.varma.aiinterviewplatform.service.McqService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mcq")
public class McqController {

    private final McqService mcqService;

    // Constructor injection for McqService.
    public McqController(McqService mcqService) {
        this.mcqService = mcqService;
    }

    // Get MCQ questions based on technology, difficulty,
    // and requested question amount.
    @GetMapping("/questions")
    public List<McqQuestionResponse> getMcqQuestions(
            @RequestParam String technology,
            @RequestParam String difficulty,
            @RequestParam(defaultValue = "5") int amount,
            Authentication authentication) {

        // Make sure the request belongs to an authenticated user.
        // The actual user email is available through JWT authentication.
        String email = authentication.getName();

        // The email is currently used to verify authentication.
        // Target-role based personalization will be connected later.
        return mcqService.getMcqQuestions(
                technology,
                difficulty,
                amount
        );
    }
}