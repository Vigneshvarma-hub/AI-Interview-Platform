
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.AnswerRequest;
import com.varma.aiinterviewplatform.entity.Answer;
import com.varma.aiinterviewplatform.service.AnswerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/answers")
public class AnswerController {

    private final AnswerService answerService;

    public AnswerController(AnswerService answerService) {
        this.answerService = answerService;
    }

    // ----------------------------------------------------
    // SUBMIT ANSWER - AUTHENTICATED OWNER ONLY
    // ----------------------------------------------------

    @PostMapping
    public ResponseEntity<Answer> submitAnswer(
            @RequestBody AnswerRequest request,
            Authentication authentication) {

        Answer answer = answerService.submitAnswerForUser(
                request,
                authentication.getName());

        return ResponseEntity.ok(answer);
    }

    // ----------------------------------------------------
    // GET INTERVIEW SCORE - OWNER ONLY
    // ----------------------------------------------------

    @GetMapping("/interview/{interviewId}/score")
    public ResponseEntity<Double> getInterviewScore(
            @PathVariable Long interviewId,
            Authentication authentication) {

        Double score = answerService.calculateInterviewScore(
                interviewId,
                authentication.getName());

        return ResponseEntity.ok(score);
    }

    // ----------------------------------------------------
    // GET INTERVIEW ANSWERS - OWNER ONLY
    // ----------------------------------------------------

    @GetMapping("/interview/{interviewId}")
    public ResponseEntity<List<Answer>> getInterviewAnswers(
            @PathVariable Long interviewId,
            Authentication authentication) {

        List<Answer> answers = answerService.getInterviewAnswers(
                interviewId,
                authentication.getName());

        return ResponseEntity.ok(answers);
    }
}
