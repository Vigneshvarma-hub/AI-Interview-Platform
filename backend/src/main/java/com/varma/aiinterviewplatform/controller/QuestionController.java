package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.entity.Question;
import com.varma.aiinterviewplatform.service.QuestionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping
    public Question createQuestion(
            @RequestBody Question question) {

        return questionService.createQuestion(question);
    }

    @GetMapping
    public List<Question> getQuestions(
            @RequestParam String technology,
            @RequestParam(required = false) String difficulty) {

        if (difficulty != null) {

            return questionService
                    .getQuestionsByTechnologyAndDifficulty(
                            technology,
                            difficulty
                    );
        }

        return questionService
                .getQuestionsByTechnology(technology);
    }
}
