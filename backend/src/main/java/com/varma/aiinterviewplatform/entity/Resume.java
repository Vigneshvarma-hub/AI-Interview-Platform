package com.varma.aiinterviewplatform.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "resumes")
public class Resume {

    // Primary key of the resume.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Original name of the uploaded resume file.
    private String fileName;

    // File type of the uploaded resume.
    // Example: application/pdf
    private String fileType;

    // Location where the uploaded file is stored.
    private String filePath;

    // Text extracted from the uploaded resume.
    // This will be useful for skill extraction later.
    @Column(columnDefinition = "TEXT")
    private String extractedText;

    // Resume belongs to a particular user.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Default constructor required by JPA.
    public Resume() {
    }

    // Constructor for creating a resume object.
    public Resume(
            String fileName,
            String fileType,
            String filePath,
            String extractedText,
            User user) {

        this.fileName = fileName;
        this.fileType = fileType;
        this.filePath = filePath;
        this.extractedText = extractedText;
        this.user = user;
    }

    // Returns the resume ID.
    public Long getId() {
        return id;
    }

    // Sets the resume ID.
    public void setId(Long id) {
        this.id = id;
    }

    // Returns the original file name.
    public String getFileName() {
        return fileName;
    }

    // Sets the file name.
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    // Returns the uploaded file type.
    public String getFileType() {
        return fileType;
    }

    // Sets the uploaded file type.
    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    // Returns the stored file path.
    public String getFilePath() {
        return filePath;
    }

    // Sets the stored file path.
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    // Returns extracted resume text.
    public String getExtractedText() {
        return extractedText;
    }

    // Sets extracted resume text.
    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    // Returns the user who owns this resume.
    public User getUser() {
        return user;
    }

    // Sets the resume owner.
    public void setUser(User user) {
        this.user = user;
    }
}