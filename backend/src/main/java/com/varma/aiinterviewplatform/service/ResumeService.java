package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.entity.Resume;
import com.varma.aiinterviewplatform.entity.User;
import com.varma.aiinterviewplatform.repository.ResumeRepository;
import com.varma.aiinterviewplatform.repository.UserRepository;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

// This service handles resume upload and text extraction.
@Service
public class ResumeService {

    // Repository used to save and retrieve resume records.
    private final ResumeRepository resumeRepository;

    // Repository used to find the logged-in user.
    private final UserRepository userRepository;

    // Apache Tika is used to extract text from PDF/DOCX files.
    private final Tika tika;

    // Folder where uploaded resumes will be stored.
    private static final String UPLOAD_DIR =
            "uploads/resumes";

    // Constructor injection for required dependencies.
    public ResumeService(
            ResumeRepository resumeRepository,
            UserRepository userRepository) {

        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;

        // Create Apache Tika parser.
        this.tika = new Tika();
    }


    // Uploads a resume for the logged-in user.
    // TikaException is declared because Apache Tika
    // can throw this exception while extracting text.
    public Resume uploadResume(
            MultipartFile file,
            String email)
            throws IOException, TikaException {

        // Validate that a file was actually selected.
        if (file == null || file.isEmpty()) {
            throw new RuntimeException(
                    "Please select a resume file."
            );
        }


        // Get the original file name.
        String originalFileName =
                file.getOriginalFilename();


        // Validate file name.
        if (originalFileName == null
                || originalFileName.isBlank()) {

            throw new RuntimeException(
                    "Invalid resume file name."
            );
        }


        // Convert file name to lowercase
        // for extension checking.
        String lowerCaseFileName =
                originalFileName.toLowerCase();


        // Only PDF and DOCX files are allowed.
        if (!lowerCaseFileName.endsWith(".pdf")
                && !lowerCaseFileName.endsWith(".docx")) {

            throw new RuntimeException(
                    "Only PDF and DOCX resume files are allowed."
            );
        }


        // Find the logged-in user using JWT email.
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );


        // Create upload directory if it does not exist.
        Path uploadPath =
                Paths.get(UPLOAD_DIR);

        Files.createDirectories(
                uploadPath
        );


        // Create a unique file name.
        // This avoids conflicts when multiple users
        // upload files with the same name.
        String storedFileName =
                System.currentTimeMillis()
                        + "_"
                        + originalFileName;


        // Create the complete file path.
        Path filePath =
                uploadPath.resolve(
                        storedFileName
                );


        // Save the uploaded file to disk.
        Files.copy(
                file.getInputStream(),
                filePath
        );


        // Use Apache Tika to extract text
        // from the uploaded PDF/DOCX file.
        String extractedText =
                tika.parseToString(
                        filePath.toFile()
                );


        // Check whether this user already has a resume.
        Resume resume =
                resumeRepository
                        .findByUser_Email(email)
                        .orElse(null);


        // If an old resume exists,
        // update it instead of creating duplicates.
        if (resume != null) {

            // Delete the previous physical file
            // if it exists.
            if (resume.getFilePath() != null) {

                try {

                    Files.deleteIfExists(
                            Paths.get(
                                    resume.getFilePath()
                            )
                    );

                } catch (Exception ignored) {
                    // Ignore deletion failure.
                }
            }

        } else {

            // Create a new Resume entity.
            resume = new Resume();
        }


        // Store original file name.
        resume.setFileName(
                originalFileName
        );


        // Store uploaded file type.
        resume.setFileType(
                file.getContentType()
        );


        // Store physical file location.
        resume.setFilePath(
                filePath.toString()
        );


        // Store extracted resume text.
        resume.setExtractedText(
                extractedText
        );


        // Connect resume with the logged-in user.
        resume.setUser(user);


        // Save resume information in PostgreSQL.
        return resumeRepository.save(
                resume
        );
    }


    // Returns the logged-in user's resume.
    public Resume getMyResume(
            String email) {

        return resumeRepository
                .findByUser_Email(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Resume not found"
                        )
                );
    }
}