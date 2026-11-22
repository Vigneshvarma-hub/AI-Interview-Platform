package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.AiInterviewAnswerRequest;
import com.varma.aiinterviewplatform.dto.AiInterviewConversationRequest;
import com.varma.aiinterviewplatform.dto.AiInterviewConversationResponse;
import com.varma.aiinterviewplatform.dto.AiInterviewRequest;
import com.varma.aiinterviewplatform.dto.AiInterviewResponse;
import com.varma.aiinterviewplatform.dto.AiInterviewStartResponse;
import com.varma.aiinterviewplatform.service.AiInterviewService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai-interviews")
public class AiInterviewController {

    private final AiInterviewService aiInterviewService;

    public AiInterviewController(AiInterviewService aiInterviewService) {
        this.aiInterviewService = aiInterviewService;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startAiInterview(
            @RequestBody(required = false) AiInterviewRequest request,
            Authentication authentication) {
        try {
            AiInterviewStartResponse response = aiInterviewService.startAiInterview(
                    request == null ? new AiInterviewRequest() : request,
                    authentication.getName());
            return ResponseEntity.ok(response);
        } catch (AccessDeniedException exception) {
            return errorResponse(HttpStatus.FORBIDDEN, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            return errorResponse(HttpStatus.BAD_REQUEST, exception.getMessage());
        } catch (IllegalStateException exception) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, exception.getMessage());
        }
    }

    @PostMapping("/{interviewId}/conversation")
    public ResponseEntity<?> continueConversation(
            @PathVariable Long interviewId,
            @RequestBody AiInterviewConversationRequest request,
            Authentication authentication) {
        try {
            AiInterviewConversationResponse response =
                    aiInterviewService.continueAiInterviewConversation(
                            interviewId, request, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (AccessDeniedException exception) {
            return errorResponse(HttpStatus.FORBIDDEN, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            return errorResponse(HttpStatus.BAD_REQUEST, exception.getMessage());
        } catch (IllegalStateException exception) {
            return errorResponse(HttpStatus.CONFLICT, exception.getMessage());
        }
    }

    @GetMapping("/{interviewId}/question")
    public ResponseEntity<?> getQuestion(
            @PathVariable Long interviewId,
            @RequestParam int questionNumber,
            Authentication authentication) {
        try {
            AiInterviewResponse response = aiInterviewService.getAiInterviewQuestion(
                    interviewId, questionNumber, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (AccessDeniedException exception) {
            return errorResponse(HttpStatus.FORBIDDEN, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            return errorResponse(HttpStatus.BAD_REQUEST, exception.getMessage());
        } catch (IllegalStateException exception) {
            return errorResponse(HttpStatus.CONFLICT, exception.getMessage());
        }
    }

    @PostMapping("/{interviewId}/answer")
    public ResponseEntity<?> submitAnswer(
            @PathVariable Long interviewId,
            @RequestBody AiInterviewAnswerRequest request,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(aiInterviewService.submitAiInterviewAnswer(
                    interviewId, request, authentication.getName()));
        } catch (AccessDeniedException exception) {
            return errorResponse(HttpStatus.FORBIDDEN, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            return errorResponse(HttpStatus.BAD_REQUEST, exception.getMessage());
        } catch (IllegalStateException exception) {
            return errorResponse(HttpStatus.CONFLICT, exception.getMessage());
        }
    }

    @PostMapping("/{interviewId}/complete")
    public ResponseEntity<?> completeInterview(
            @PathVariable Long interviewId,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(aiInterviewService.completeAiInterview(
                    interviewId, authentication.getName()));
        } catch (AccessDeniedException exception) {
            return errorResponse(HttpStatus.FORBIDDEN, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            return errorResponse(HttpStatus.BAD_REQUEST, exception.getMessage());
        } catch (IllegalStateException exception) {
            return errorResponse(HttpStatus.CONFLICT, exception.getMessage());
        }
    }

    @GetMapping("/{interviewId}/evaluation")
    public ResponseEntity<?> getEvaluation(
            @PathVariable Long interviewId,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(aiInterviewService.getAiInterviewEvaluation(
                    interviewId, authentication.getName()));
        } catch (AccessDeniedException exception) {
            return errorResponse(HttpStatus.FORBIDDEN, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            return errorResponse(HttpStatus.BAD_REQUEST, exception.getMessage());
        } catch (IllegalStateException exception) {
            return errorResponse(HttpStatus.CONFLICT, exception.getMessage());
        }
    }

    @PostMapping("/{interviewId}/feedback")
    public ResponseEntity<?> submitFeedback(
            @PathVariable Long interviewId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            String feedback = request.get("feedback") == null
                    ? null : request.get("feedback").toString();
            Integer rating = request.get("rating") == null
                    ? null : Integer.valueOf(request.get("rating").toString());
            return ResponseEntity.ok(aiInterviewService.saveCandidateFeedback(
                    interviewId, authentication.getName(), feedback, rating));
        } catch (AccessDeniedException exception) {
            return errorResponse(HttpStatus.FORBIDDEN, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            return errorResponse(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }

    private ResponseEntity<Map<String, String>> errorResponse(
            HttpStatus status,
            String message) {
        String safeMessage = message == null || message.isBlank()
                ? "An unexpected error occurred."
                : message;
        return ResponseEntity.status(status).body(Map.of("message", safeMessage));
    }
}
