
package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.entity.EmailOtp;
import com.varma.aiinterviewplatform.entity.User;
import com.varma.aiinterviewplatform.repository.EmailOtpRepository;
import com.varma.aiinterviewplatform.repository.UserRepository;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
public class EmailOtpService {

    private final JavaMailSender mailSender;
    private final EmailOtpRepository emailOtpRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Secure random generator for six-digit OTPs.
    private final SecureRandom secureRandom = new SecureRandom();

    public EmailOtpService(
            JavaMailSender mailSender,
            EmailOtpRepository emailOtpRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.mailSender = mailSender;
        this.emailOtpRepository = emailOtpRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Normalize email consistently before database operations.
    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }

    // Generate a cryptographically secure six-digit OTP.
    private String generateOtp() {
        return String.valueOf(100000 + secureRandom.nextInt(900000));
    }

    // Create and send an OTP for a specific purpose.
    private void createAndSendOtp(
            String email,
            EmailOtp.Purpose purpose,
            String subject,
            String purposeDescription) {

        String otp = generateOtp();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(10);

        // Replace only the OTP for this purpose.
        emailOtpRepository.deleteByEmailAndPurpose(email, purpose);

        // Save the OTP with its purpose and expiry.
        EmailOtp emailOtp = new EmailOtp(
                email,
                otp,
                expiryTime,
                purpose
        );

        emailOtpRepository.saveAndFlush(emailOtp);

        // Prepare the email.
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject(subject);
        message.setText(
                "Hello,\n\n"
                        + "Your " + purposeDescription + " OTP is: " + otp + "\n\n"
                        + "This OTP is valid for 10 minutes.\n"
                        + "Please do not share this code with anyone.\n\n"
                        + "Regards,\n"
                        + "NexPrep AI Team"
        );

        // If email delivery fails, propagate the error to the caller.
        mailSender.send(message);
    }

    // ---------------- EMAIL VERIFICATION ----------------

    // Generate and send an OTP for new-user email verification.
    @Transactional
    public void sendVerificationOtp(String email) {
        String normalizedEmail = normalizeEmail(email);

        createAndSendOtp(
                normalizedEmail,
                EmailOtp.Purpose.EMAIL_VERIFICATION,
                "NexPrep AI - Email Verification",
                "email verification"
        );
    }

    // Resend an OTP to an existing unverified user.
    @Transactional
    public void resendVerificationOtp(String email) {
        String normalizedEmail = normalizeEmail(email);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "User account not found. Please register first."
                ));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new IllegalArgumentException(
                    "Email is already verified. Please log in."
            );
        }

        sendVerificationOtp(normalizedEmail);
    }

    // Verify an email-verification OTP without accepting reset OTPs.
    @Transactional
    public void verifyOtp(String email, String enteredOtp) {
        String normalizedEmail = normalizeEmail(email);

        EmailOtp storedOtp = emailOtpRepository
                .findByEmailAndPurpose(
                        normalizedEmail,
                        EmailOtp.Purpose.EMAIL_VERIFICATION
                )
                .orElseThrow(() -> new IllegalArgumentException(
                        "Verification OTP not found. Please request a new OTP."
                ));

        validateOtp(storedOtp, enteredOtp);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "User account not found."
                ));

        user.setEmailVerified(true);
        userRepository.save(user);

        // Consume the OTP after successful verification.
        emailOtpRepository.delete(storedOtp);
    }

    // ---------------- FORGOT PASSWORD ----------------

    // Send a password-reset OTP to a registered email.
    @Transactional
    public void sendPasswordResetOtp(String email) {
        String normalizedEmail = normalizeEmail(email);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "If an account exists for that email, a reset OTP can be sent."
                ));

        if (Boolean.FALSE.equals(user.getActive())) {
            throw new IllegalArgumentException(
                    "This account is inactive. Please contact support."
            );
        }

        createAndSendOtp(
                normalizedEmail,
                EmailOtp.Purpose.PASSWORD_RESET,
                "NexPrep AI - Password Reset OTP",
                "password reset"
        );
    }

    // Verify the password-reset OTP; do not mark the email as verified here.
    @Transactional(readOnly = true)
    public void verifyPasswordResetOtp(String email, String enteredOtp) {
        String normalizedEmail = normalizeEmail(email);

        EmailOtp storedOtp = emailOtpRepository
                .findByEmailAndPurpose(
                        normalizedEmail,
                        EmailOtp.Purpose.PASSWORD_RESET
                )
                .orElseThrow(() -> new IllegalArgumentException(
                        "Reset OTP not found. Please request a new OTP."
                ));

        validateOtp(storedOtp, enteredOtp);
    }

    // Change the password only after the correct, unexpired reset OTP is supplied.
    @Transactional
    public void resetPassword(
            String email,
            String enteredOtp,
            String newPassword) {

        String normalizedEmail = normalizeEmail(email);

        if (newPassword == null
                || newPassword.length() < 8
                || newPassword.length() > 72) {
            throw new IllegalArgumentException(
                    "Password must contain between 8 and 72 characters."
            );
        }

        EmailOtp storedOtp = emailOtpRepository
                .findByEmailAndPurpose(
                        normalizedEmail,
                        EmailOtp.Purpose.PASSWORD_RESET
                )
                .orElseThrow(() -> new IllegalArgumentException(
                        "Reset OTP not found. Please request a new OTP."
                ));

        // Verify OTP and expiry before changing the password.
        validateOtp(storedOtp, enteredOtp);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "User account not found."
                ));

        // Store only the BCrypt hash, never the plain-text password.
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // A reset OTP must be usable only once.
        emailOtpRepository.delete(storedOtp);
    }

    // Shared validation for both OTP purposes.
    private void validateOtp(EmailOtp storedOtp, String enteredOtp) {
        if (LocalDateTime.now().isAfter(storedOtp.getExpiryTime())) {
            emailOtpRepository.delete(storedOtp);

            throw new IllegalArgumentException(
                    "OTP has expired. Please request a new OTP."
            );
        }

        if (enteredOtp == null
                || !storedOtp.getOtp().equals(enteredOtp.trim())) {
            throw new IllegalArgumentException(
                    "Invalid OTP. Please enter the correct code."
            );
        }
    }
}
