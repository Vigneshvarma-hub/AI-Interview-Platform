
package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.entity.Resume;
import com.varma.aiinterviewplatform.entity.User;
import com.varma.aiinterviewplatform.repository.ResumeRepository;
import com.varma.aiinterviewplatform.repository.UserRepository;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import org.xml.sax.SAXException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.UUID;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final Tika tika;

    // Resume storage directory.
    @Value("${app.resume.storage-dir:uploads/resumes}")
    private String uploadDir;

    // Maximum uploaded file size: 5 MB.
    private static final long MAX_FILE_SIZE =
            5L * 1024 * 1024;

    // Maximum extracted resume text: 200,000 characters.
    private static final int MAX_EXTRACTED_TEXT_CHARS =
            200_000;

    public ResumeService(
            ResumeRepository resumeRepository,
            UserRepository userRepository) {

        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.tika = new Tika();
    }

    // Upload and process a PDF or DOCX resume.
    @Transactional
    public Resume uploadResume(
            MultipartFile file,
            String email) throws IOException, TikaException {

        // 1. Validate selected file.
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select a resume file."
            );
        }

        // 2. Validate file size.
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Resume file must not exceed 5 MB."
            );
        }

        // 3. Validate original filename.
        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null || originalFileName.isBlank()) {
            throw new IllegalArgumentException(
                    "Invalid resume file name."
            );
        }

        String safeFileName = Paths.get(originalFileName)
                .getFileName()
                .toString();

        String lowerCaseFileName =
                safeFileName.toLowerCase(Locale.ROOT);

        boolean isPdf = lowerCaseFileName.endsWith(".pdf");
        boolean isDocx = lowerCaseFileName.endsWith(".docx");

        if (!isPdf && !isDocx) {
            throw new IllegalArgumentException(
                    "Only PDF and DOCX resume files are allowed."
            );
        }

        // 4. Read file bytes and detect actual content.
        byte[] fileBytes = file.getBytes();

        String detectedType = tika.detect(fileBytes);

        boolean validPdf =
                isPdf &&
                        "application/pdf".equalsIgnoreCase(detectedType);

        boolean validDocx =
                isDocx &&
                        (
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        .equalsIgnoreCase(detectedType)
                                        ||
                                        "application/x-tika-ooxml"
                                                .equalsIgnoreCase(detectedType)
                        );

        if (!validPdf && !validDocx) {
            throw new IllegalArgumentException(
                    "File content does not match a valid PDF or DOCX resume."
            );
        }

        // 5. Extract text with a character limit.
        String extractedText = extractResumeText(fileBytes);

        if (extractedText == null || extractedText.isBlank()) {
            throw new IllegalArgumentException(
                    "No readable text found in the resume. "
                            + "Please upload a text-based PDF or DOCX file."
            );
        }

        // 6. Find authenticated user.
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Please log in to upload your resume."
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found.")
                );

        // 7. Create storage directory.
        Path uploadPath = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(uploadPath);

        // 8. Generate unique filename.
        String extension = isPdf ? ".pdf" : ".docx";

        String storedFileName =
                UUID.randomUUID() + extension;

        Path filePath = uploadPath.resolve(storedFileName)
                .normalize();

        if (!filePath.startsWith(uploadPath)) {
            throw new IllegalArgumentException(
                    "Invalid resume storage path."
            );
        }

        // 9. Store uploaded file.
        Files.copy(
                new ByteArrayInputStream(fileBytes),
                filePath
        );

        try {

            // 10. Find existing resume for this user.
            Resume resume = resumeRepository
                    .findByUser_Email(normalizedEmail)
                    .orElse(null);

            String oldFilePath =
                    resume != null ? resume.getFilePath() : null;

            if (resume == null) {
                resume = new Resume();
            }

            // 11. Update resume details.
            resume.setFileName(safeFileName);

            resume.setFileType(
                    validPdf
                            ? "application/pdf"
                            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            );

            resume.setFilePath(filePath.toString());
            resume.setExtractedText(extractedText);
            resume.setUser(user);

            // 12. Save database record.
            Resume savedResume = resumeRepository.save(resume);

            // 13. Delete old file after new record is saved.
            if (oldFilePath != null
                    && !oldFilePath.isBlank()
                    && !oldFilePath.equals(filePath.toString())) {

                try {
                    Files.deleteIfExists(Paths.get(oldFilePath));
                } catch (IOException ignored) {
                    // Old-file cleanup can be handled separately.
                }
            }

            return savedResume;

        } catch (RuntimeException exception) {

            // Remove new file if database processing fails.
            try {
                Files.deleteIfExists(filePath);
            } catch (IOException ignored) {
                // Preserve original exception.
            }

            throw exception;
        }
    }

    // Extract resume text with Apache Tika and a write limit.
    private String extractResumeText(byte[] fileBytes)
            throws IOException, TikaException {

        BodyContentHandler handler =
                new BodyContentHandler(MAX_EXTRACTED_TEXT_CHARS);

        AutoDetectParser parser = new AutoDetectParser();

        try (ByteArrayInputStream input =
                     new ByteArrayInputStream(fileBytes)) {

            parser.parse(
                    input,
                    handler,
                    new Metadata(),
                    new ParseContext()
            );

        } catch (SAXException exception) {

            if (handler.toString().length()
                    >= MAX_EXTRACTED_TEXT_CHARS) {

                throw new IllegalArgumentException(
                        "Resume contains too much text. "
                                + "Please upload a shorter resume."
                );
            }

            throw new TikaException(
                    "Unable to extract resume text.",
                    exception
            );
        }

        return handler.toString();
    }

    // Retrieve authenticated user's resume.
    @Transactional(readOnly = true)
    public Resume getMyResume(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Please log in to access your resume."
            );
        }

        return resumeRepository
                .findByUser_Email(
                        email.trim().toLowerCase(Locale.ROOT)
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Resume not found. Please upload your resume."
                        )
                );
    }
}
