package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.dto.SkillExtractionResponse;
import com.varma.aiinterviewplatform.entity.Resume;
import com.varma.aiinterviewplatform.repository.ResumeRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SkillExtractionService {

    private final ResumeRepository resumeRepository;

    // Constructor injection for ResumeRepository.
    public SkillExtractionService(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    // Extract skills from the currently logged-in user's resume.
    public SkillExtractionResponse extractSkills(String email) {

        // Find the resume belonging to the logged-in user.
        Resume resume = resumeRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Resume not found. Please upload your resume first."));

        // Get the text extracted from the resume by Apache Tika.
        String extractedText = resume.getExtractedText();

        // Make sure the resume contains readable text.
        if (extractedText == null || extractedText.isBlank()) {
            throw new RuntimeException("No text found in the uploaded resume.");
        }

        // Convert text to lowercase so matching becomes case-insensitive.
        String text = extractedText.toLowerCase();

        // Store skill names and their possible keywords.
        // LinkedHashMap keeps the response order predictable.
        Map<String, String[]> skillKeywords = new LinkedHashMap<>();

        skillKeywords.put("Java", new String[]{"java"});
        skillKeywords.put("Python", new String[]{"python"});
        skillKeywords.put("C", new String[]{"c programming", "c language"});
        skillKeywords.put("C++", new String[]{"c++"});
        skillKeywords.put("JavaScript", new String[]{"javascript"});
        skillKeywords.put("TypeScript", new String[]{"typescript"});
        skillKeywords.put("React", new String[]{"react", "react.js", "reactjs"});
        skillKeywords.put("Spring Boot", new String[]{"spring boot"});
        skillKeywords.put("Spring", new String[]{"spring framework"});
        skillKeywords.put("SQL", new String[]{"sql"});
        skillKeywords.put("MySQL", new String[]{"mysql"});
        skillKeywords.put("PostgreSQL", new String[]{"postgresql", "postgres"});
        skillKeywords.put("Git", new String[]{"git"});
        skillKeywords.put("GitHub", new String[]{"github"});
        skillKeywords.put("HTML", new String[]{"html"});
        skillKeywords.put("CSS", new String[]{"css"});
        skillKeywords.put("REST API", new String[]{"rest api", "restful api"});
        skillKeywords.put("AWS", new String[]{"aws", "amazon web services"});
        skillKeywords.put("Docker", new String[]{"docker"});
        skillKeywords.put("Linux", new String[]{"linux"});
        skillKeywords.put("MATLAB", new String[]{"matlab"});
        skillKeywords.put("Simulink", new String[]{"simulink"});
        skillKeywords.put("Arduino", new String[]{"arduino"});
        skillKeywords.put("ESP32", new String[]{"esp32"});
        skillKeywords.put("IoT", new String[]{"iot", "internet of things"});
        skillKeywords.put("Machine Learning", new String[]{"machine learning"});
        skillKeywords.put("Artificial Intelligence", new String[]{"artificial intelligence"});
        skillKeywords.put("OOP", new String[]{"object oriented programming", "oop"});
        skillKeywords.put("Data Structures", new String[]{"data structures", "data structure"});
        skillKeywords.put("Spring Security", new String[]{"spring security"});
        skillKeywords.put("JWT", new String[]{"jwt", "json web token"});

        // List that will contain the skills actually found in the resume.
        List<String> extractedSkills = new ArrayList<>();

        // Check every skill against the extracted resume text.
        for (Map.Entry<String, String[]> entry : skillKeywords.entrySet()) {

            String skillName = entry.getKey();
            String[] keywords = entry.getValue();

            boolean found = false;

            for (String keyword : keywords) {

                // Check whether the resume contains the current keyword.
                if (text.contains(keyword.toLowerCase())) {
                    found = true;
                    break;
                }
            }

            // Add the skill only once if it was found.
            if (found) {
                extractedSkills.add(skillName);
            }
        }

        // Return resume ID and all detected skills.
        return new SkillExtractionResponse(
                resume.getId(),
                extractedSkills
        );
    }
}