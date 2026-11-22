
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.dto.AuthResponse;
import com.varma.aiinterviewplatform.dto.LoginRequest;
import com.varma.aiinterviewplatform.dto.RegisterRequest;
import com.varma.aiinterviewplatform.entity.User;
import com.varma.aiinterviewplatform.exception.LoginRateLimitException;
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

    public record EmailRequest(
            @NotBlank @Email @Size(max = 254) String email
    ) {}

    public record VerifyResetOtpRequest(
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank
            @Size(min = 6, max = 6)
            @jakarta.validation.constraints.Pattern(regexp = "[0-9]{6}")
            String otp
    ) {}

    public record ResetPasswordRequest(
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank
            @Size(min = 6, max = 6)
            @jakarta.validation.constraints.Pattern(regexp = "[0-9]{6}")
            String otp,
            @NotBlank @Size(min = 8, max = 72) String newPassword
    ) {}

    // REGISTER

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
            @Valid @RequestBody RegisterRequest request) {

        try {
            User user = authService.register(request);

            return ResponseEntity.ok(Map.of(
                    "message",
                    "Registration successful! Please check your email for the verification OTP.",
                    "email",
                    user.getEmail()
            ));

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );

        } catch (Exception exception) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Registration failed. Please try again."
                    ));
        }
    }

    // LOGIN

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request) {

        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);

        } catch (LoginRateLimitException exception) {

            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of(
                            "message",
                            exception.getMessage()
                    ));

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            exception.getMessage()
                    ));
        }
    }

    // FORGOT PASSWORD

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody EmailRequest request) {

        String genericMessage =
                "If an account exists for that email, a reset OTP has been sent.";

        try {
            emailOtpService.sendPasswordResetOtp(request.email());

            return ResponseEntity.ok(
                    Map.of("message", genericMessage)
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.ok(
                    Map.of("message", genericMessage)
            );

        } catch (Exception exception) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Unable to process the request right now. Please try again later."
                    ));
        }
    }

    // VERIFY RESET OTP

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<Map<String, String>> verifyResetOtp(
            @Valid @RequestBody VerifyResetOtpRequest request) {

        try {
            emailOtpService.verifyPasswordResetOtp(
                    request.email(),
                    request.otp()
            );

            return ResponseEntity.ok(
                    Map.of("message", "OTP verified successfully.")
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );
        }
    }

    // RESET PASSWORD

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

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );
        }
    }
}
