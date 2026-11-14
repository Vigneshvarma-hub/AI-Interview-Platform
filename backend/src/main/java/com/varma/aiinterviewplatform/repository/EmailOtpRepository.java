
package com.varma.aiinterviewplatform.repository;

import com.varma.aiinterviewplatform.entity.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {

    // Find an OTP by email and purpose to keep OTP flows separate.
    Optional<EmailOtp> findByEmailAndPurpose(
            String email,
            EmailOtp.Purpose purpose
    );

    // Delete only the OTP belonging to a specific purpose.
    void deleteByEmailAndPurpose(
            String email,
            EmailOtp.Purpose purpose
    );

    // Keep existing email-only methods for compatibility with current code.
    Optional<EmailOtp> findByEmail(String email);

    void deleteByEmail(String email);
}
