
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.InterviewRequest;
import com.varma.aiinterviewplatform.dto.InterviewQuestionResponse;
import com.varma.aiinterviewplatform.dto.InterviewResultResponse;
import com.varma.aiinterviewplatform.dto.InterviewHistoryResponse;

import com.varma.aiinterviewplatform.entity.Interview;
import com.varma.aiinterviewplatform.entity.Question;

import com.varma.aiinterviewplatform.service.InterviewService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    // Constructor injection
    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    // ----------------------------------------------------
    // 1. Logged-in user's interviews
    // GET /api/interviews/my
    // ----------------------------------------------------
    @GetMapping("/my")
    public List<Interview> getMyInterviews(
            Authentication authentication) {

        String email = authentication.getName();

        return interviewService.getMyInterviews(email);
    }

    // ----------------------------------------------------
    // 2. Interview questions
    // GET /api/interviews/5/questions
    // ----------------------------------------------------
    @GetMapping("/{interviewId}/questions")
    public List<Question> getInterviewQuestions(
            @PathVariable Long interviewId) {

        return interviewService.getInterviewQuestions(interviewId);
    }

    // ----------------------------------------------------
    // 3. Particular interview question
    // GET /api/interviews/5/questions/1
    // ----------------------------------------------------
    @GetMapping("/{interviewId}/questions/{questionNumber}")
    public InterviewQuestionResponse getQuestion(
            @PathVariable Long interviewId,
            @PathVariable int questionNumber) {

        return interviewService.getQuestion(
                interviewId,
                questionNumber
        );
    }

    // ----------------------------------------------------
    // 4. Regular AI interview start
    // POST /api/interviews/start
    // ----------------------------------------------------
    @PostMapping("/start")
    public Interview startInterview(
            @RequestBody InterviewRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        return interviewService.startInterview(
                request,
                email
        );
    }

    // ----------------------------------------------------
    // 5. MCQ Assessment start
    // POST /api/interviews/start-mcq?amount=5
    // ----------------------------------------------------
    @PostMapping("/start-mcq")
    public Interview startMcqInterview(
            @RequestBody InterviewRequest request,
            @RequestParam(defaultValue = "5") int amount,
            Authentication authentication) {

        String email = authentication.getName();

        return interviewService.startMcqInterview(
                request,
                email,
                amount
        );
    }

    // ----------------------------------------------------
    // 6. Interview complete
    // POST /api/interviews/5/complete
    // ----------------------------------------------------
    @PostMapping("/{interviewId}/complete")
    public Interview completeInterview(
            @PathVariable Long interviewId) {

        return interviewService.completeInterview(
                interviewId
        );
    }

    // ----------------------------------------------------
    // 7. Interview result
    // GET /api/interviews/5/result
    // ----------------------------------------------------
    @GetMapping("/{interviewId}/result")
    public InterviewResultResponse getInterviewResult(
            @PathVariable Long interviewId) {

        return interviewService.getInterviewResult(
                interviewId
        );
    }

    // ----------------------------------------------------
    // 8. Assessment History
    // GET /api/interviews/history
    // ----------------------------------------------------
    @GetMapping("/history")
    public List<InterviewHistoryResponse> getMyInterviewHistory(
            Authentication authentication) {

        String email = authentication.getName();

        return interviewService.getMyInterviewHistory(email);
    }
}