
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.AuthResponse;
import com.varma.aiinterviewplatform.dto.LoginRequest;
import com.varma.aiinterviewplatform.dto.RegisterRequest;
import com.varma.aiinterviewplatform.entity.User;
import com.varma.aiinterviewplatform.service.AuthService;
import com.varma.aiinterviewplatform.service.EmailOtpService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final AuthService authService;
    private final EmailOtpService emailOtpService;

    public AuthController(
            AuthService authService,
            EmailOtpService emailOtpService) {
        this.authService = authService;
        this.emailOtpService = emailOtpService;
    }

    // Request DTO for email-based operations.
    public record EmailRequest(
            @NotBlank @Email String email
    ) {}

    // Request DTO for reset OTP verification.
    public record VerifyResetOtpRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, max = 6) String otp
    ) {}

    // Request DTO for password reset.
    public record ResetPasswordRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, max = 6) String otp,
            @NotBlank @Size(min = 8, max = 72) String newPassword
    ) {}

    // Register a new user and send email verification OTP.
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);

            return ResponseEntity.ok(Map.of(
                    "message",
                    "Registration successful! Please check your email for the verification OTP.",
                    "email",
                    user.getEmail()
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Registration failed. Please try again."
                    ));
        }
    }

    // Login an existing user.
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    // Request a password-reset OTP.
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody EmailRequest request) {
        try {
            emailOtpService.sendPasswordResetOtp(request.email());

            return ResponseEntity.ok(Map.of(
                    "message",
                    "If an account exists for that email, a reset OTP has been sent."
            ));
        } catch (IllegalArgumentException ex) {
            // Use the same public response to avoid exposing whether an
            // email address belongs to an account.
            return ResponseEntity.ok(Map.of(
                    "message",
                    "If an account exists for that email, a reset OTP has been sent."
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Unable to process the request right now. Please try again later."
                    ));
        }
    }

    // Verify a password-reset OTP.
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<Map<String, String>> verifyResetOtp(
            @Valid @RequestBody VerifyResetOtpRequest request) {
        try {
            emailOtpService.verifyPasswordResetOtp(
                    request.email(),
                    request.otp()
            );

            return ResponseEntity.ok(Map.of(
                    "message",
                    "OTP verified successfully."
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    // Reset password after validating the reset OTP.
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        try {
            emailOtpService.resetPassword(
                    request.email(),
                    request.otp(),
                    request.newPassword()
            );

            return ResponseEntity.ok(Map.of(
                    "message",
                    "Password reset successful. Please log in with your new password."
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }
}
