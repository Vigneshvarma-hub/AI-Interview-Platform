
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.ResumeResponse;
import com.varma.aiinterviewplatform.dto.ResumeAnalysisResponse;

import com.varma.aiinterviewplatform.entity.Resume;

import com.varma.aiinterviewplatform.service.ResumeService;
import com.varma.aiinterviewplatform.service.ResumeAnalysisService;

import org.apache.tika.exception.TikaException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;
    private final ResumeAnalysisService resumeAnalysisService;

    // Constructor injection for both services.
    public ResumeController(
            ResumeService resumeService,
            ResumeAnalysisService resumeAnalysisService) {

        this.resumeService = resumeService;
        this.resumeAnalysisService = resumeAnalysisService;
    }

    // Upload a PDF or DOCX resume for the authenticated user.
    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        try {
            String email = authentication.getName();

            Resume resume = resumeService.uploadResume(file, email);

            // Return only safe resume information.
            ResumeResponse response =
                    ResumeResponse.fromEntity(resume);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );

        } catch (IOException | TikaException exception) {

            // Do not expose internal server or file-system details.
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Unable to process the resume. Please try again."
                    ));
        }
    }

    // Retrieve the authenticated user's resume details.
    @GetMapping("/my")
    public ResponseEntity<?> getMyResume(
            Authentication authentication) {

        try {
            String email = authentication.getName();

            Resume resume = resumeService.getMyResume(email);

            ResumeResponse response =
                    ResumeResponse.fromEntity(resume);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", exception.getMessage()));
        }
    }

    // Analyze the authenticated user's uploaded resume using Gemini.
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeMyResume(
            Authentication authentication) {

        try {
            String email = authentication.getName();

            ResumeAnalysisResponse response =
                    resumeAnalysisService.analyzeResume(email);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );

        } catch (IllegalStateException exception) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Unable to analyze your resume. Please try again."
                    ));
        }
    }
}
