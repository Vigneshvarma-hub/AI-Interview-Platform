
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.service.EmailOtpService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/email")
public class EmailVerificationController {

    private static final Logger log =
            LoggerFactory.getLogger(EmailVerificationController.class);

    private final EmailOtpService emailOtpService;

    public EmailVerificationController(EmailOtpService emailOtpService) {
        this.emailOtpService = emailOtpService;
    }

    public record VerifyEmailRequest(
            @NotBlank
            @Email
            @Size(max = 254)
            String email,

            @NotBlank
            @Pattern(
                    regexp = "[0-9]{6}",
                    message = "OTP must contain exactly 6 digits."
            )
            String otp
    ) {}

    public record ResendOtpRequest(
            @NotBlank
            @Email
            @Size(max = 254)
            String email
    ) {}

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request
    ) {

        try {
            emailOtpService.verifyOtp(
                    request.email(),
                    request.otp()
            );

            return ResponseEntity.ok(Map.of(
                    "message",
                    "Email verified successfully. You can now log in."
            ));

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", exception.getMessage())
            );

        } catch (Exception exception) {

            log.error("Failed to verify email", exception);

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Unable to verify email. Please try again."
                    ));
        }
    }

    @PostMapping("/resend")
    public ResponseEntity<Map<String, String>> resendOtp(
            @Valid @RequestBody ResendOtpRequest request
    ) {

        try {
            emailOtpService.resendVerificationOtp(
                    request.email()
            );

            return ResponseEntity.ok(Map.of(
                    "message",
                    "If the account exists and requires verification, "
                            + "a verification OTP has been sent."
            ));

        } catch (IllegalArgumentException exception) {

            // Do not reveal whether an email account exists,
            // is already verified, or has a pending OTP cooldown.
            return ResponseEntity.ok(Map.of(
                    "message",
                    "If the account exists and requires verification, "
                            + "a verification OTP has been sent."
            ));

        } catch (Exception exception) {

            log.error("Failed to resend verification OTP", exception);

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Unable to process your request. Please try again."
                    ));
        }
    }
}
