
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.TestCenterAnswerRequest;
import com.varma.aiinterviewplatform.dto.TestCenterAnswerResponse;
import com.varma.aiinterviewplatform.dto.TestResultResponse;
import com.varma.aiinterviewplatform.dto.TestStartRequest;
import com.varma.aiinterviewplatform.dto.TestStartResponse;
import com.varma.aiinterviewplatform.service.TestCenterService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/test-center")
public class TestCenterController {

    private final TestCenterService testCenterService;

    public TestCenterController(TestCenterService testCenterService) {
        this.testCenterService = testCenterService;
    }

    @PostMapping("/start")
    public TestStartResponse startTest(
            @RequestBody TestStartRequest request,
            Authentication authentication) {

        return testCenterService.startTest(
                request,
                getUserEmail(authentication)
        );
    }

    @PutMapping("/{testId}/answer")
    public TestCenterAnswerResponse saveAnswer(
            @PathVariable Long testId,
            @RequestBody TestCenterAnswerRequest request,
            Authentication authentication) {

        return testCenterService.saveAnswer(
                testId,
                request,
                getUserEmail(authentication)
        );
    }

    @PostMapping("/{testId}/submit")
    public TestResultResponse submitTest(
            @PathVariable Long testId,
            Authentication authentication) {

        return testCenterService.submitTest(
                testId,
                getUserEmail(authentication)
        );
    }

    @GetMapping("/{testId}/result")
    public TestResultResponse getResult(
            @PathVariable Long testId,
            Authentication authentication) {

        return testCenterService.getResult(
                testId,
                getUserEmail(authentication)
        );
    }

    @PostMapping("/prepare")
    public ResponseEntity<?> prepareQuestions(
            @RequestBody TestStartRequest request,
            Authentication authentication) {

        String email = getUserEmail(authentication);

        return ResponseEntity.ok(
                testCenterService.prepareQuestions(request, email)
        );
    }

    @PostMapping("/preparation-status")
    public ResponseEntity<?> preparationStatus(
            @RequestBody TestStartRequest request,
            Authentication authentication) {

        String email = getUserEmail(authentication);

        return ResponseEntity.ok(
                testCenterService.preparationStatus(request, email)
        );
    }

    private String getUserEmail(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in to access Test Center."
            );
        }

        return authentication.getName();
    }
}
