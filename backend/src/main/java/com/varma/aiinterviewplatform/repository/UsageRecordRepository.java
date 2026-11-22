
package com.varma.aiinterviewplatform.repository;

import com.varma.aiinterviewplatform.entity.UsageRecord;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UsageRecordRepository
        extends JpaRepository<UsageRecord, Long> {

    Optional<UsageRecord> findByIdempotencyKey(
            String idempotencyKey
    );

    @Query("""
        SELECT COALESCE(SUM(u.quantity), 0)
        FROM UsageRecord u
        WHERE u.user.id = :userId
          AND u.featureCode = :featureCode
          AND u.usageStatus = :usageStatus
          AND u.periodStart >= :periodStart
          AND u.periodEnd <= :periodEnd
        """)
    Long sumQuantityByUserAndFeatureAndStatusAndPeriod(
            @Param("userId") Long userId,
            @Param("featureCode") String featureCode,
            @Param("usageStatus") String usageStatus,
            @Param("periodStart") LocalDateTime periodStart,
            @Param("periodEnd") LocalDateTime periodEnd
    );

    List<UsageRecord>
    findByUser_IdAndFeatureCodeAndPeriodStartGreaterThanEqualAndPeriodEndLessThanEqual(
            Long userId,
            String featureCode,
            LocalDateTime periodStart,
            LocalDateTime periodEnd
    );
}
