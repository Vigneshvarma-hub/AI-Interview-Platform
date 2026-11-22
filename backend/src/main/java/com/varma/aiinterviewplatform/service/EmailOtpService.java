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

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

@Service
public class EmailOtpService {

    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int MAX_OTP_ATTEMPTS = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 60;
    private static final int MIN_PASSWORD_LENGTH = 8;
    private static final int MAX_BCRYPT_PASSWORD_BYTES = 72;

    private final JavaMailSender mailSender;
    private final EmailOtpRepository emailOtpRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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

    private String normalizeEmail(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String generateOtp() {

        return String.valueOf(
                100000 + secureRandom.nextInt(900000)
        );
    }

    private void checkResendCooldown(EmailOtp existingOtp) {

        if (existingOtp == null || existingOtp.getLastSentAt() == null) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        long elapsedSeconds = ChronoUnit.SECONDS.between(
                existingOtp.getLastSentAt(),
                now
        );

        if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {

            long remainingSeconds =
                    RESEND_COOLDOWN_SECONDS - elapsedSeconds;

            throw new IllegalArgumentException(
                    "Please wait " + remainingSeconds
                            + " seconds before requesting another OTP."
            );
        }
    }

    private void createAndSendOtp(
            String email,
            EmailOtp.Purpose purpose,
            String subject,
            String purposeDescription) {

        EmailOtp existingOtp = emailOtpRepository
                .findByEmailAndPurposeForUpdate(email, purpose)
                .orElse(null);

        checkResendCooldown(existingOtp);

        String plainOtp = generateOtp();
        String hashedOtp = passwordEncoder.encode(plainOtp);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiryTime = now.plusMinutes(OTP_EXPIRY_MINUTES);

        EmailOtp emailOtp;

        if (existingOtp != null) {

            emailOtp = existingOtp;

            emailOtp.setOtp(hashedOtp);
            emailOtp.setExpiryTime(expiryTime);
            emailOtp.setAttempts(0);
            emailOtp.setLastSentAt(now);

        } else {

            emailOtp = new EmailOtp(
                    email,
                    hashedOtp,
                    expiryTime,
                    purpose
            );

            emailOtp.setAttempts(0);
            emailOtp.setLastSentAt(now);
        }

        emailOtpRepository.saveAndFlush(emailOtp);

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);
        message.setSubject(subject);

        message.setText(
                "Hello,\n\n"
                        + "Your " + purposeDescription
                        + " OTP is: " + plainOtp + "\n\n"
                        + "This OTP is valid for "
                        + OTP_EXPIRY_MINUTES + " minutes.\n"
                        + "You have a maximum of "
                        + MAX_OTP_ATTEMPTS
                        + " verification attempts.\n\n"
                        + "Please do not share this code with anyone.\n\n"
                        + "Regards,\n"
                        + "NexPrep AI Team"
        );

        mailSender.send(message);
    }

    // ---------------- EMAIL VERIFICATION ----------------

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

    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public void verifyOtp(String email, String enteredOtp) {

        String normalizedEmail = normalizeEmail(email);

        EmailOtp storedOtp = emailOtpRepository
                .findByEmailAndPurposeForUpdate(
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

        emailOtpRepository.delete(storedOtp);
    }

    // ---------------- FORGOT PASSWORD ----------------

    @Transactional
    public void sendPasswordResetOtp(String email) {

        String normalizedEmail = normalizeEmail(email);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "If an account exists for that email, a reset OTP can be sent."
                ));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new IllegalArgumentException(
                    "If an account exists for that email, a reset OTP can be sent."
            );
        }

        createAndSendOtp(
                normalizedEmail,
                EmailOtp.Purpose.PASSWORD_RESET,
                "NexPrep AI - Password Reset OTP",
                "password reset"
        );
    }

    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public void verifyPasswordResetOtp(
            String email,
            String enteredOtp) {

        String normalizedEmail = normalizeEmail(email);

        EmailOtp storedOtp = emailOtpRepository
                .findByEmailAndPurposeForUpdate(
                        normalizedEmail,
                        EmailOtp.Purpose.PASSWORD_RESET
                )
                .orElseThrow(() -> new IllegalArgumentException(
                        "Reset OTP not found. Please request a new OTP."
                ));

        validateOtp(storedOtp, enteredOtp);
    }

    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public void resetPassword(
            String email,
            String enteredOtp,
            String newPassword) {

        String normalizedEmail = normalizeEmail(email);

        validatePassword(newPassword);

        EmailOtp storedOtp = emailOtpRepository
                .findByEmailAndPurposeForUpdate(
                        normalizedEmail,
                        EmailOtp.Purpose.PASSWORD_RESET
                )
                .orElseThrow(() -> new IllegalArgumentException(
                        "Reset OTP not found. Please request a new OTP."
                ));

        validateOtp(storedOtp, enteredOtp);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "User account not found."
                ));

        // Update the password.
        user.setPassword(passwordEncoder.encode(newPassword));

        // Invalidate all previously issued JWT sessions for this user.
        long currentVersion = user.getTokenVersion() == null
                ? 0L
                : user.getTokenVersion();

        user.setTokenVersion(Math.addExact(currentVersion, 1L));

        userRepository.save(user);

        // Consume the reset OTP after successful password reset.
        emailOtpRepository.delete(storedOtp);
    }

    // ---------------- PASSWORD VALIDATION ----------------

    private void validatePassword(String password) {

        if (password == null || password.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters."
            );
        }

        int passwordBytes = password.getBytes(
                StandardCharsets.UTF_8
        ).length;

        if (passwordBytes > MAX_BCRYPT_PASSWORD_BYTES) {
            throw new IllegalArgumentException(
                    "Password must not exceed 72 UTF-8 bytes."
            );
        }

        if (!password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException(
                    "Password must contain at least one uppercase letter."
            );
        }

        if (!password.matches(".*[a-z].*")) {
            throw new IllegalArgumentException(
                    "Password must contain at least one lowercase letter."
            );
        }

        if (!password.matches(".*[0-9].*")) {
            throw new IllegalArgumentException(
                    "Password must contain at least one number."
            );
        }

        if (!password.matches(".*[^a-zA-Z0-9].*")) {
            throw new IllegalArgumentException(
                    "Password must contain at least one special character."
            );
        }
    }

    // ---------------- OTP VALIDATION ----------------

    private void validateOtp(
            EmailOtp storedOtp,
            String enteredOtp) {

        if (LocalDateTime.now().isAfter(storedOtp.getExpiryTime())) {

            emailOtpRepository.delete(storedOtp);

            throw new IllegalArgumentException(
                    "OTP has expired. Please request a new OTP."
            );
        }

        if (storedOtp.getAttempts() >= MAX_OTP_ATTEMPTS) {

            emailOtpRepository.delete(storedOtp);

            throw new IllegalArgumentException(
                    "Maximum OTP attempts exceeded. Please request a new OTP."
            );
        }

        boolean validFormat = enteredOtp != null
                && enteredOtp.trim().matches("[0-9]{6}");

        boolean matches = false;

        if (validFormat) {
            try {
                matches = passwordEncoder.matches(
                        enteredOtp.trim(),
                        storedOtp.getOtp()
                );
            } catch (IllegalArgumentException exception) {
                matches = false;
            }
        }

        if (!matches) {

            int attempts = storedOtp.getAttempts() + 1;
            storedOtp.setAttempts(attempts);

            if (attempts >= MAX_OTP_ATTEMPTS) {

                emailOtpRepository.delete(storedOtp);

                throw new IllegalArgumentException(
                        "Maximum OTP attempts exceeded. Please request a new OTP."
                );
            }

            emailOtpRepository.save(storedOtp);

            int remainingAttempts = MAX_OTP_ATTEMPTS - attempts;

            throw new IllegalArgumentException(
                    "Invalid OTP. "
                            + remainingAttempts
                            + " attempt(s) remaining."
            );
        }
    }
}