
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

    // Email address for which the OTP is generated.
    @Column(nullable = false)
    private String email;

    // OTP code sent to the user's email.
    @Column(nullable = false)
    private String otp;

    // Time after which the OTP becomes invalid.
    @Column(nullable = false)
    private LocalDateTime expiryTime;

    // Identifies the OTP's purpose so separate flows do not interfere.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Purpose purpose = Purpose.EMAIL_VERIFICATION;

    public enum Purpose {
        EMAIL_VERIFICATION,
        PASSWORD_RESET
    }

    // Default constructor required by JPA.
    public EmailOtp() {
    }

    // Preserve compatibility with existing registration OTP code.
    public EmailOtp(String email, String otp, LocalDateTime expiryTime) {
        this.email = email;
        this.otp = otp;
        this.expiryTime = expiryTime;
        this.purpose = Purpose.EMAIL_VERIFICATION;
    }

    // Constructor for OTP records with an explicit purpose.
    public EmailOtp(
            String email,
            String otp,
            LocalDateTime expiryTime,
            Purpose purpose) {
        this.email = email;
        this.otp = otp;
        this.expiryTime = expiryTime;
        this.purpose = purpose;
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
}
