package com.varma.aiinterviewplatform.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoginRateLimitService {

    private static final int MAX_FAILED_ATTEMPTS = 5;

    private final JdbcTemplate jdbcTemplate;

    public LoginRateLimitService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean isBlocked(String identifierType, String identifierValue) {

        String sql = """
                SELECT EXISTS (
                    SELECT 1
                    FROM login_rate_limits
                    WHERE identifier_type = ?
                    AND identifier_value = ?
                    AND locked_until > CURRENT_TIMESTAMP
                )
                """;

        Boolean blocked = jdbcTemplate.queryForObject(
                sql,
                Boolean.class,
                identifierType,
                identifierValue
        );

        return Boolean.TRUE.equals(blocked);
    }

    @Transactional
    public void recordFailedAttempt(
            String identifierType,
            String identifierValue
    ) {

        String sql = """
                INSERT INTO login_rate_limits (
                    identifier_type,
                    identifier_value,
                    failed_attempts,
                    window_started_at,
                    locked_until,
                    updated_at
                )
                VALUES (?, ?, 1, CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP)

                ON CONFLICT (identifier_type, identifier_value)
                DO UPDATE SET

                    failed_attempts =
                        CASE
                            WHEN login_rate_limits.window_started_at
                                 < CURRENT_TIMESTAMP - INTERVAL '15 minutes'
                            THEN 1
                            ELSE login_rate_limits.failed_attempts + 1
                        END,

                    window_started_at =
                        CASE
                            WHEN login_rate_limits.window_started_at
                                 < CURRENT_TIMESTAMP - INTERVAL '15 minutes'
                            THEN CURRENT_TIMESTAMP
                            ELSE login_rate_limits.window_started_at
                        END,

                    locked_until =
                        CASE
                            WHEN (
                                CASE
                                    WHEN login_rate_limits.window_started_at
                                         < CURRENT_TIMESTAMP - INTERVAL '15 minutes'
                                    THEN 1
                                    ELSE login_rate_limits.failed_attempts + 1
                                END
                            ) >= ?
                            THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes'
                            ELSE NULL
                        END,

                    updated_at = CURRENT_TIMESTAMP
                """;

        jdbcTemplate.update(
                sql,
                identifierType,
                identifierValue,
                MAX_FAILED_ATTEMPTS
        );
    }

    @Transactional
    public void resetAttempts(String identifierType, String identifierValue) {

        String sql = """
                DELETE FROM login_rate_limits
                WHERE identifier_type = ?
                AND identifier_value = ?
                """;

        jdbcTemplate.update(sql, identifierType, identifierValue);
    }
}