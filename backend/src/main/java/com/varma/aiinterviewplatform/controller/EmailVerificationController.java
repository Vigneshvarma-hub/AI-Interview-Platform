
package com.varma.aiinterviewplatform.controller;

import com.varma.aiinterviewplatform.service.EmailOtpService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/email")
public class EmailVerificationController {

    private final EmailOtpService emailOtpService;

    public EmailVerificationController(
            EmailOtpService emailOtpService) {

        this.emailOtpService = emailOtpService;
    }

    // Verify the OTP entered by the user.
    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyEmail(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String otp = request.get("otp");

        // Validate request fields.
        if (email == null || email.isBlank() ||
                otp == null || otp.isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Email and OTP are required."
                    ));
        }

        try {

            // Verify the OTP using the service.
            emailOtpService.verifyOtp(email, otp);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Email verified successfully. You can now log in."
                    )
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            exception.getMessage()
                    ));

        } catch (Exception exception) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Unable to verify email. Please try again."
                    ));
        }
    }

    // Resend OTP to an existing unverified email.
    @PostMapping("/resend")
    public ResponseEntity<Map<String, String>> resendOtp(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");

        // Validate email.
        if (email == null || email.isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Email is required."
                    ));
        }

        try {

            // Generate and send a new OTP.
            emailOtpService.resendVerificationOtp(email);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "A new verification OTP has been sent to your email."
                    )
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            exception.getMessage()
                    ));

        } catch (Exception exception) {

            // Print the actual error in the IntelliJ console.
            exception.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Unable to resend OTP. Please try again."
                    ));

        }
    }
}