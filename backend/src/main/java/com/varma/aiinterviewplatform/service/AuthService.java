
package com.varma.aiinterviewplatform.service;

import com.varma.aiinterviewplatform.dto.AuthResponse;
import com.varma.aiinterviewplatform.dto.LoginRequest;
import com.varma.aiinterviewplatform.dto.RegisterRequest;
import com.varma.aiinterviewplatform.entity.User;
import com.varma.aiinterviewplatform.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailOtpService emailOtpService;

    // Constructor injection.
    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailOtpService emailOtpService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailOtpService = emailOtpService;
    }

    // Register a new user and send an email verification OTP.
    public User register(RegisterRequest request) {

        // Normalize email to avoid duplicate accounts with different casing.
        String email = request.getEmail().trim().toLowerCase();

        // Check whether the email is already registered.
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException(
                    "This email is already registered. Please log in."
            );
        }

        // Validate password requirements.
        validatePassword(request.getPassword());

        // Create a new user.
        User user = new User();

        user.setName(request.getName().trim());
        user.setEmail(email);

        // Encrypt the password before storing it.
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // Set the default user role.
        user.setRole("USER");

        // Newly registered accounts are active.
        user.setActive(true);

        // Email must be verified before login.
        user.setEmailVerified(false);

        // Save user details in the database.
        User savedUser = userRepository.save(user);

        // Generate and send OTP to the registered email.
        emailOtpService.sendVerificationOtp(email);

        return savedUser;
    }

    // Validate password eligibility criteria.
    private void validatePassword(String password) {

        // Minimum 8 characters.
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters."
            );
        }

        // At least one uppercase letter.
        if (!password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException(
                    "Password must contain at least one uppercase letter."
            );
        }

        // At least one lowercase letter.
        if (!password.matches(".*[a-z].*")) {
            throw new IllegalArgumentException(
                    "Password must contain at least one lowercase letter."
            );
        }

        // At least one number.
        if (!password.matches(".*[0-9].*")) {
            throw new IllegalArgumentException(
                    "Password must contain at least one number."
            );
        }

        // At least one special character.
        if (!password.matches(".*[^a-zA-Z0-9].*")) {
            throw new IllegalArgumentException(
                    "Password must contain at least one special character."
            );
        }
    }

    // Authenticate an existing user.
    public AuthResponse login(LoginRequest request) {

        // Normalize email before searching.
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        // Block login if the account is deactivated.
        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new RuntimeException(
                    "Your account has been deactivated. Please contact the administrator."
            );
        }

        // Require email verification before login.
        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException(
                    "Please verify your email before logging in."
            );
        }

        // Verify the entered password.
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException("Invalid password");
        }

        // Generate JWT token after successful authentication.
        String token =
                jwtService.generateToken(user.getEmail());

        // Return authentication response.
        return new AuthResponse(
                token,
                user.getRole(),
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }
}