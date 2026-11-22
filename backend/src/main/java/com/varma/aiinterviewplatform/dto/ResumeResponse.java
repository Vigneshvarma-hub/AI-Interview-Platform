
package com.varma.aiinterviewplatform.dto;

import com.varma.aiinterviewplatform.entity.Resume;

/**
 * Safe response DTO for resume information.
 *
 * Internal file paths and extracted resume text
 * must never be exposed through this response.
 */
public class ResumeResponse {

    private Long id;
    private String fileName;
    private String fileType;

    public ResumeResponse() {
    }

    public ResumeResponse(
            Long id,
            String fileName,
            String fileType) {

        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
    }

    /**
     * Converts Resume entity into a safe response DTO.
     */
    public static ResumeResponse fromEntity(Resume resume) {

        if (resume == null) {
            throw new IllegalArgumentException(
                    "Resume information cannot be null."
            );
        }

        return new ResumeResponse(
                resume.getId(),
                resume.getFileName(),
                resume.getFileType()
        );
    }

    public Long getId() {
        return id;
    }

    public String getFileName() {
        return fileName;
    }

    public String getFileType() {
        return fileType;
    }
}
