package com.varma.aiinterviewplatform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "email_otps",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_email_otp_purpose",
                        columnNames = {"email", "purpose"}
                )
        }
)
public class EmailOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    // Store only the BCrypt hash of the OTP.
    @Column(nullable = false)
    private String otp;

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Purpose purpose = Purpose.EMAIL_VERIFICATION;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int attempts = 0;

    @Column(name = "last_sent_at")
    private LocalDateTime lastSentAt;

    public enum Purpose {
        EMAIL_VERIFICATION,
        PASSWORD_RESET
    }

    public EmailOtp() {
    }

    public EmailOtp(String email, String otp, LocalDateTime expiryTime) {
        this.email = email;
        this.otp = otp;
        this.expiryTime = expiryTime;
        this.purpose = Purpose.EMAIL_VERIFICATION;
        this.attempts = 0;
    }

    public EmailOtp(
            String email,
            String otp,
            LocalDateTime expiryTime,
            Purpose purpose
    ) {
        this.email = email;
        this.otp = otp;
        this.expiryTime = expiryTime;
        this.purpose = purpose;
        this.attempts = 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }

    public void setExpiryTime(LocalDateTime expiryTime) {
        this.expiryTime = expiryTime;
    }

    public Purpose getPurpose() {
        return purpose;
    }

    public void setPurpose(Purpose purpose) {
        this.purpose = purpose;
    }

    public int getAttempts() {
        return attempts;
    }

    public void setAttempts(int attempts) {
        this.attempts = attempts;
    }

    public LocalDateTime getLastSentAt() {
        return lastSentAt;
    }

    public void setLastSentAt(LocalDateTime lastSentAt) {
        this.lastSentAt = lastSentAt;
    }
}