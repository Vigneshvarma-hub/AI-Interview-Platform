package com.varma.aiinterviewplatform.repository;

import com.varma.aiinterviewplatform.entity.EmailOtp;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EmailOtpRepository
        extends JpaRepository<EmailOtp, Long> {

    Optional<EmailOtp> findByEmailAndPurpose(
            String email,
            EmailOtp.Purpose purpose
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT o FROM EmailOtp o
        WHERE o.email = :email
        AND o.purpose = :purpose
        """)
    Optional<EmailOtp> findByEmailAndPurposeForUpdate(
            @Param("email") String email,
            @Param("purpose") EmailOtp.Purpose purpose
    );

    void deleteByEmailAndPurpose(
            String email,
            EmailOtp.Purpose purpose
    );

    Optional<EmailOtp> findByEmail(String email);

    void deleteByEmail(String email);
}