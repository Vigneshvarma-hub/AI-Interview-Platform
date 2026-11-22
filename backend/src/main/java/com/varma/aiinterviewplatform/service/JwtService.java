package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.entity.User;
import com.varma.aiinterviewplatform.repository.UserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationTime;
    private final UserRepository userRepository;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:3600000}") long expirationTime,
            UserRepository userRepository) {

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "JWT secret is not configured."
            );
        }

        if (expirationTime <= 0) {
            throw new IllegalStateException(
                    "JWT expiration time must be positive."
            );
        }

        try {
            byte[] keyBytes = Decoders.BASE64.decode(secret);
            this.signingKey = Keys.hmacShaKeyFor(keyBytes);

        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Invalid JWT secret. Configure a valid Base64 secret of at least 32 bytes.",
                    exception
            );
        }

        this.expirationTime = expirationTime;
        this.userRepository = userRepository;
    }

    // Generate a token using the user's current token version.
    public String generateToken(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Email cannot be empty."
            );
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "User account not found."
                ));

        long tokenVersion = user.getTokenVersion() == null
                ? 0L
                : user.getTokenVersion();

        Date issuedAt = new Date();
        Date expiration = new Date(
                issuedAt.getTime() + expirationTime
        );

        return Jwts.builder()
                .subject(email)
                .claim("tokenVersion", tokenVersion)
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(signingKey)
                .compact();
    }

    // Extract email from a verified JWT.
    public String extractEmail(String token) {

        return parseClaims(token).getSubject();
    }

    // Extract the token version stored inside the JWT.
    public long extractTokenVersion(String token) {

        Object version = parseClaims(token).get("tokenVersion");

        if (!(version instanceof Number)) {
            throw new JwtException(
                    "JWT token version is missing or invalid."
            );
        }

        return ((Number) version).longValue();
    }

    // Validate JWT signature and expiration.
    public boolean isTokenValid(String token) {

        try {
            String subject = parseClaims(token).getSubject();

            return subject != null && !subject.isBlank();

        } catch (JwtException | IllegalArgumentException exception) {
            return false;
        }
    }

    private Claims parseClaims(String token) {

        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}