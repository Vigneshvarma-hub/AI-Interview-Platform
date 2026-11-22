
package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.dto.AuthResponse;
import com.varma.aiinterviewplatform.dto.LoginRequest;
import com.varma.aiinterviewplatform.dto.RegisterRequest;
import com.varma.aiinterviewplatform.entity.User;
import com.varma.aiinterviewplatform.exception.LoginRateLimitException;
import com.varma.aiinterviewplatform.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Optional;

@Service
public class AuthService {

    private static final int MIN_PASSWORD_LENGTH = 8;
    private static final int MAX_BCRYPT_PASSWORD_BYTES = 72;
    private static final int MAX_NAME_LENGTH = 100;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailOtpService emailOtpService;
    private final LoginRateLimitService loginRateLimitService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailOtpService emailOtpService,
            LoginRateLimitService loginRateLimitService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailOtpService = emailOtpService;
        this.loginRateLimitService = loginRateLimitService;
    }

    // ---------------- REGISTRATION ----------------

    @Transactional
    public User register(RegisterRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Registration details are required."
            );
        }

        String name = request.getName() == null
                ? ""
                : request.getName().trim();

        if (name.isBlank() || name.length() > MAX_NAME_LENGTH) {
            throw new IllegalArgumentException(
                    "Name must contain between 1 and 100 characters."
            );
        }

        String email = normalizeEmail(request.getEmail());

        validatePassword(request.getPassword());

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException(
                    "This email is already registered. Please log in."
            );
        }

        User user = new User();

        user.setName(name);
        user.setEmail(email);
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole("USER");
        user.setActive(true);
        user.setEmailVerified(false);

        // Preserve existing subscription defaults.
        user.setSubscriptionPlan("FREE");
        user.setTrialUsed(false);

        User savedUser = userRepository.saveAndFlush(user);

        emailOtpService.sendVerificationOtp(email);

        return savedUser;
    }

    // ---------------- EMAIL NORMALIZATION ----------------

    private String normalizeEmail(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }

    // ---------------- PASSWORD VALIDATION ----------------

    public void validatePassword(String password) {

        if (password == null
                || password.length() < MIN_PASSWORD_LENGTH) {

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

    // ---------------- LOGIN ----------------

    public AuthResponse login(LoginRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Invalid login request."
            );
        }

        String email = normalizeEmail(request.getEmail());
        String rawPassword = request.getPassword();

        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException(
                    "Email or password is incorrect."
            );
        }

        String emailIdentifier = hashIdentifier("EMAIL:" + email);

        String ipIdentifier = hashIdentifier(
                "IP:" + getClientIpAddress()
        );

        // Check email and IP lockouts independently.
        boolean emailBlocked =
                loginRateLimitService.isBlocked(
                        "EMAIL", emailIdentifier
                );

        boolean ipBlocked =
                loginRateLimitService.isBlocked(
                        "IP", ipIdentifier
                );

        if (emailBlocked || ipBlocked) {
            throw new LoginRateLimitException(
                    "Too many failed login attempts. Please try again after 15 minutes."
            );
        }

        Optional<User> optionalUser =
                userRepository.findByEmail(email);

        // Same response for unknown email and incorrect password.
        if (optionalUser.isEmpty()) {

            recordFailedLogin(emailIdentifier, ipIdentifier);

            throw new IllegalArgumentException(
                    "Email or password is incorrect."
            );
        }

        User user = optionalUser.get();

        // Check password before revealing account status.
        if (user.getPassword() == null
                || !passwordEncoder.matches(
                rawPassword,
                user.getPassword()
        )) {

            recordFailedLogin(emailIdentifier, ipIdentifier);

            throw new IllegalArgumentException(
                    "Email or password is incorrect."
            );
        }

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new IllegalArgumentException(
                    "Your account has been deactivated. Please contact support."
            );
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new IllegalArgumentException(
                    "Please verify your email before logging in."
            );
        }

        // Reset counters only after a successful login.
        loginRateLimitService.resetAttempts(
                "EMAIL", emailIdentifier
        );

        loginRateLimitService.resetAttempts(
                "IP", ipIdentifier
        );

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(
                token,
                user.getRole(),
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }

    // ---------------- FAILED LOGIN RECORDING ----------------

    private void recordFailedLogin(
            String emailIdentifier,
            String ipIdentifier) {

        loginRateLimitService.recordFailedAttempt(
                "EMAIL", emailIdentifier
        );

        loginRateLimitService.recordFailedAttempt(
                "IP", ipIdentifier
        );
    }

    // ---------------- CLIENT IP ----------------

    private String getClientIpAddress() {

        if (RequestContextHolder.getRequestAttributes()
                instanceof ServletRequestAttributes attributes) {

            HttpServletRequest request = attributes.getRequest();

            return request.getRemoteAddr();
        }

        return "UNKNOWN";
    }

    // ---------------- IDENTIFIER HASHING ----------------

    private String hashIdentifier(String value) {

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    value.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "Unable to process login security identifier.",
                    exception
            );
        }
    }
}
