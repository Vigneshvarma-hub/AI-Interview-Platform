package com.varma.aiinterviewplatform.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class TestCenterAsyncConfig {

    /**
     * Dedicated background thread pool for Test Center question generation.
     * This keeps Gemini calls from blocking normal API request threads.
     */
    @Bean(name = "testCenterQuestionExecutor")
    public Executor testCenterQuestionExecutor() {

        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(20);
        executor.setThreadNamePrefix("test-center-gemini-");

        executor.initialize();

        return executor;
    }
}