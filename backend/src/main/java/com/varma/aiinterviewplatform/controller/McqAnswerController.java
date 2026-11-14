package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.McqAnswerRequest;
import com.varma.aiinterviewplatform.dto.McqEvaluationResponse;
import com.varma.aiinterviewplatform.dto.McqResultResponse;
import com.varma.aiinterviewplatform.service.AnswerService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mcq")
public class McqAnswerController {

    private final AnswerService answerService;

    public McqAnswerController(AnswerService answerService) {
        this.answerService = answerService;
    }

    // Submit MCQ answer
    @PostMapping("/submit")
    public McqEvaluationResponse submitMcqAnswer(
            @RequestBody McqAnswerRequest request) {

        return answerService.submitMcqAnswer(request);
    }

    // Get MCQ assessment result
    @GetMapping("/result/{interviewId}")
    public McqResultResponse getMcqResult(
            @PathVariable Long interviewId) {

        return answerService.calculateMcqResult(interviewId);
    }
}