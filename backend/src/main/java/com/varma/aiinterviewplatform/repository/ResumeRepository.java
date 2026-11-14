package com.varma.aiinterviewplatform.repository;

import com.varma.aiinterviewplatform.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Repository used to save and retrieve resume records.
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    // Finds the resume belonging to a particular user's email.
    Optional<Resume> findByUser_Email(String email);
}