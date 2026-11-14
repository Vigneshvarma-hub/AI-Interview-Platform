
package com.varma.aiinterviewplatform.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

// Central service for sending prompts to Gemini.
@Service
public class GeminiService {

    private final Client geminiClient;

    // Read the API key from application.properties.
    public GeminiService(
            @Value("${gemini.api.key}") String apiKey) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "Gemini API key is not configured.");
        }

        // Configure the official Google Gen AI Java SDK.
        this.geminiClient = Client.builder()
                .apiKey(apiKey)
                .build();
    }

    // Send a prompt to Gemini and return its text response.
    public String generateText(String prompt) {

        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException(
                    "Prompt cannot be empty.");
        }

        GenerateContentResponse response =
                geminiClient.models.generateContent(
                        "gemini-3.8-flash",
                        prompt,
                        null);

        String result = response.text();

        if (result == null || result.isBlank()) {
            throw new IllegalStateException(
                    "Gemini returned an empty response.");
        }

        return result.trim();
    }
}
