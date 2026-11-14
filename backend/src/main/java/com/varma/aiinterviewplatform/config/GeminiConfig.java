
package com.varma.aiinterviewplatform.config;

import com.google.genai.Client;
import com.google.genai.types.HttpOptions;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Bean
    public Client geminiClient() {

        HttpOptions httpOptions = HttpOptions.builder()
                .timeout(60000)
                .build();

        return Client.builder()
                .apiKey(geminiApiKey)
                .httpOptions(httpOptions)
                .build();
    }
}
