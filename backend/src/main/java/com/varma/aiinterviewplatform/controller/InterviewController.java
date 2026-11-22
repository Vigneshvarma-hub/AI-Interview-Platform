
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.InterviewHistoryResponse;
import com.varma.aiinterviewplatform.dto.InterviewQuestionResponse;
import com.varma.aiinterviewplatform.dto.InterviewRequest;
import com.varma.aiinterviewplatform.dto.InterviewResultResponse;
import com.varma.aiinterviewplatform.entity.Interview;
import com.varma.aiinterviewplatform.entity.Question;
import com.varma.aiinterviewplatform.service.InterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    // ----------------------------------------------------
    // GET LOGGED-IN USER'S INTERVIEWS
    // ----------------------------------------------------

    @GetMapping("/my")
    public ResponseEntity<List<Interview>> getMyInterviews(
            Authentication authentication) {

        return ResponseEntity.ok(
                interviewService.getMyInterviews(authentication.getName()));
    }

    // ----------------------------------------------------
    // GET QUESTIONS FOR AN OWNED INTERVIEW
    // ----------------------------------------------------

    @GetMapping("/{interviewId}/questions")
    public ResponseEntity<List<Question>> getInterviewQuestions(
            @PathVariable Long interviewId,
            Authentication authentication) {

        return ResponseEntity.ok(
                interviewService.getInterviewQuestions(
                        interviewId,
                        authentication.getName()));
    }

    // ----------------------------------------------------
    // GET ONE QUESTION FOR AN OWNED INTERVIEW
    // ----------------------------------------------------

    @GetMapping("/{interviewId}/questions/{questionNumber}")
    public ResponseEntity<InterviewQuestionResponse> getQuestion(
            @PathVariable Long interviewId,
            @PathVariable int questionNumber,
            Authentication authentication) {

        return ResponseEntity.ok(
                interviewService.getQuestion(
                        interviewId,
                        questionNumber,
                        authentication.getName()));
    }

    // ----------------------------------------------------
    // START REGULAR INTERVIEW
    // ----------------------------------------------------

    @PostMapping("/start")
    public ResponseEntity<Interview> startInterview(
            @RequestBody InterviewRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                interviewService.startInterview(
                        request,
                        authentication.getName()));
    }

    // ----------------------------------------------------
    // START MCQ INTERVIEW
    // ----------------------------------------------------

    @PostMapping("/start-mcq")
    public ResponseEntity<Interview> startMcqInterview(
            @RequestBody InterviewRequest request,
            @RequestParam(defaultValue = "10") int amount,
            Authentication authentication) {

        return ResponseEntity.ok(
                interviewService.startMcqInterview(
                        request,
                        authentication.getName(),
                        amount));
    }

    // ----------------------------------------------------
    // COMPLETE OWNED INTERVIEW
    // ----------------------------------------------------

    @PostMapping("/{interviewId}/complete")
    public ResponseEntity<Interview> completeInterview(
            @PathVariable Long interviewId,
            Authentication authentication) {

        return ResponseEntity.ok(
                interviewService.completeInterview(
                        interviewId,
                        authentication.getName()));
    }

    // ----------------------------------------------------
    // GET OWNED INTERVIEW RESULT
    // ----------------------------------------------------

    @GetMapping("/{interviewId}/result")
    public ResponseEntity<InterviewResultResponse> getInterviewResult(
            @PathVariable Long interviewId,
            Authentication authentication) {

        return ResponseEntity.ok(
                interviewService.getInterviewResult(
                        interviewId,
                        authentication.getName()));
    }

    // ----------------------------------------------------
    // GET LOGGED-IN USER'S INTERVIEW HISTORY
    // ----------------------------------------------------

    @GetMapping("/history")
    public ResponseEntity<List<InterviewHistoryResponse>> getMyInterviewHistory(
            Authentication authentication) {

        return ResponseEntity.ok(
                interviewService.getMyInterviewHistory(
                        authentication.getName()));
    }
}
