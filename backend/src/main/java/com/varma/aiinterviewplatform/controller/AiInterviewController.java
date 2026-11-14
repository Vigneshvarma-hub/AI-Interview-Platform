
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.AiInterviewAnswerRequest;
import com.varma.aiinterviewplatform.dto.AiInterviewAnswerResponse;
import com.varma.aiinterviewplatform.dto.AiInterviewEvaluationResponse;
import com.varma.aiinterviewplatform.dto.AiInterviewRequest;
import com.varma.aiinterviewplatform.dto.AiInterviewResponse;
import com.varma.aiinterviewplatform.service.AiInterviewService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai-interviews")
public class AiInterviewController {

    private final AiInterviewService aiInterviewService;

    public AiInterviewController(
            AiInterviewService aiInterviewService) {
        this.aiInterviewService = aiInterviewService;
    }

    // Start an AI interview for the authenticated user.
    @PostMapping("/start")
    public ResponseEntity<?> startAiInterview(
            @RequestBody AiInterviewRequest request,
            Authentication authentication) {

        try {
            AiInterviewResponse response =
                    aiInterviewService.startAiInterview(
                            request, authentication.getName());

            return ResponseEntity.ok(response);

        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", ex.getMessage()));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    // Get a specific question in the interview.
    @GetMapping("/{interviewId}/question")
    public ResponseEntity<?> getAiInterviewQuestion(
            @PathVariable Long interviewId,
            @RequestParam(defaultValue = "1") int questionNumber,
            Authentication authentication) {

        try {
            AiInterviewResponse response =
                    aiInterviewService.getAiInterviewQuestion(
                            interviewId,
                            questionNumber,
                            authentication.getName());

            return ResponseEntity.ok(response);

        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", ex.getMessage()));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    // Submit an answer and return its evaluation.
    @PostMapping("/{interviewId}/answer")
    public ResponseEntity<?> submitAiInterviewAnswer(
            @PathVariable Long interviewId,
            @RequestBody AiInterviewAnswerRequest request,
            Authentication authentication) {

        try {
            AiInterviewAnswerResponse response =
                    aiInterviewService.submitAiInterviewAnswer(
                            interviewId,
                            request,
                            authentication.getName());

            return ResponseEntity.ok(response);

        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", ex.getMessage()));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    // Complete an interview and save its final score.
    @PostMapping("/{interviewId}/complete")
    public ResponseEntity<?> completeAiInterview(
            @PathVariable Long interviewId,
            Authentication authentication) {

        try {
            Map<String, Object> result =
                    aiInterviewService.completeAiInterview(
                            interviewId,
                            authentication.getName());

            return ResponseEntity.ok(result);

        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", ex.getMessage()));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    // Get the question-wise evaluation for an interview.
    @GetMapping("/{interviewId}/evaluation")
    public ResponseEntity<?> getAiInterviewEvaluation(
            @PathVariable Long interviewId,
            Authentication authentication) {

        try {
            List<AiInterviewEvaluationResponse> evaluations =
                    aiInterviewService.getAiInterviewEvaluation(
                            interviewId,
                            authentication.getName());

            return ResponseEntity.ok(evaluations);

        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", ex.getMessage()));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }
}
