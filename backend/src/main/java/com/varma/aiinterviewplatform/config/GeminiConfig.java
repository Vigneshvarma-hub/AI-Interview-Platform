
package com.varma.aiinterviewplatform.config;

import com.google.genai.Client;
import com.google.genai.types.HttpOptions;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
public class GeminiConfig {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Bean
    public Client geminiClient() {

        // Stop application startup if the API key is missing.
        if (!StringUtils.hasText(geminiApiKey)) {
            throw new IllegalStateException(
                    "GEMINI_API_KEY is missing. Check IntelliJ environment variables."
            );
        }

        // Log only key presence and length. Never print the actual key.
        System.out.println(
                "Gemini API key loaded: YES | Length: " + geminiApiKey.trim().length()
        );

        HttpOptions httpOptions = HttpOptions.builder()
                .timeout(180000)
                .build();

        return Client.builder()
                .apiKey(geminiApiKey.trim())
                .httpOptions(httpOptions)
                .build();
    }
}
