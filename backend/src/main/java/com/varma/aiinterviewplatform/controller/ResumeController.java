package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.entity.Resume;
import com.varma.aiinterviewplatform.service.ResumeService;

import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

// This controller handles resume upload and retrieval APIs.
@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    // Service used for resume processing.
    private final ResumeService resumeService;

    // Constructor injection for ResumeService.
    public ResumeController(
            ResumeService resumeService) {

        this.resumeService = resumeService;
    }


    // Uploads a PDF or DOCX resume for the logged-in user.
    //
    // Example:
    // POST /api/resumes/upload
    //
    // Request type:
    // multipart/form-data
    //
    // File field name:
    // file
    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Resume uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication)
            throws Exception {

        // Get the email of the logged-in user from JWT.
        String email =
                authentication.getName();

        // Send the file and user email to the service.
        return resumeService.uploadResume(
                file,
                email
        );
    }


    // Returns the logged-in user's stored resume.
    //
    // Example:
    // GET /api/resumes/my
    @GetMapping("/my")
    public Resume getMyResume(
            Authentication authentication) {

        // Get the email from the JWT authentication.
        String email =
                authentication.getName();

        // Fetch and return the user's resume.
        return resumeService.getMyResume(
                email
        );
    }
}