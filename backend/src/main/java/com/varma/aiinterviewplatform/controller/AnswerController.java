package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.AnswerRequest;
import com.varma.aiinterviewplatform.entity.Answer;
import com.varma.aiinterviewplatform.service.AnswerService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/answers")
public class AnswerController {

    private final AnswerService answerService;

    public AnswerController(AnswerService answerService) {
        this.answerService = answerService;
    }

    @PostMapping
    public Answer submitAnswer(
            @RequestBody AnswerRequest request) {

        return answerService.submitAnswer(request);
    }

    @GetMapping("/interview/{interviewId}/score")
    public Double getInterviewScore(
            @PathVariable Long interviewId) {

        return answerService.calculateInterviewScore(interviewId);
    }

    @GetMapping("/interview/{interviewId}")
    public java.util.List<Answer> getInterviewAnswers(
            @PathVariable Long interviewId) {

        return answerService.getInterviewAnswers(interviewId);
    }
}