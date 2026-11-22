
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.McqAnswerRequest;
import com.varma.aiinterviewplatform.dto.McqEvaluationResponse;
import com.varma.aiinterviewplatform.dto.McqResultResponse;
import com.varma.aiinterviewplatform.service.AnswerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mcq")
public class McqAnswerController {

    private final AnswerService answerService;

    public McqAnswerController(AnswerService answerService) {
        this.answerService = answerService;
    }

    // Submit an MCQ answer for the authenticated user's interview.
    @PostMapping("/submit")
    public ResponseEntity<McqEvaluationResponse> submitMcqAnswer(
            @RequestBody McqAnswerRequest request,
            Authentication authentication) {

        McqEvaluationResponse response =
                answerService.submitMcqAnswer(
                        request,
                        authentication.getName());

        return ResponseEntity.ok(response);
    }

    // Retrieve MCQ result only for the authenticated interview owner.
    @GetMapping("/result/{interviewId}")
    public ResponseEntity<McqResultResponse> getMcqResult(
            @PathVariable Long interviewId,
            Authentication authentication) {

        McqResultResponse result =
                answerService.calculateMcqResult(
                        interviewId,
                        authentication.getName());

        return ResponseEntity.ok(result);
    }
}
