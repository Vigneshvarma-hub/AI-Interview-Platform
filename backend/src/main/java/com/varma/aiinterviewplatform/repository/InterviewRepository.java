
package com.varma.aiinterviewplatform.repository;

import com.varma.aiinterviewplatform.entity.Interview;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    // Logged-in user's interviews, latest first.
    List<Interview> findByUser_EmailOrderByIdDesc(String email);

    // Fetch completed interviews of the logged-in user.
    List<Interview> findByUser_EmailAndStatusOrderByIdDesc(
            String email,
            String status
    );

    // Count all assessments belonging to a particular user.
    long countByUser_Id(Long userId);

    // Count completed assessments belonging to a particular user.
    long countByUser_IdAndStatusIgnoreCase(
            Long userId,
            String status
    );

    // Calculate average score of completed assessments.
    @Query("""
            SELECT AVG(i.score)
            FROM Interview i
            WHERE i.user.id = :userId
            AND UPPER(i.status) = 'COMPLETED'
            AND i.score IS NOT NULL
            """)
    Double findAverageScoreByUserId(
            @Param("userId") Long userId
    );

    // Test Center lo user complete chesina tests count kosam
    long countByUser_IdAndInterviewTypeIgnoreCaseAndStatusIgnoreCase(
            Long userId,
            String interviewType,
            String status
    );

    // Test Center tests average score calculate cheyadaniki
    @Query("""
    SELECT AVG(i.score)
    FROM Interview i
    WHERE i.user.id = :userId
      AND LOWER(i.interviewType) = LOWER(:interviewType)
      AND LOWER(i.status) = LOWER(:status)
    """)
    Double findAverageScoreByUserIdAndInterviewTypeIgnoreCaseAndStatusIgnoreCase(
            @Param("userId") Long userId,
            @Param("interviewType") String interviewType,
            @Param("status") String status
    );

    // Test Center lo highest score calculate cheyadaniki
    @Query("""
    SELECT MAX(i.score)
    FROM Interview i
    WHERE i.user.id = :userId
      AND LOWER(i.interviewType) = LOWER(:interviewType)
      AND LOWER(i.status) = LOWER(:status)
    """)
    Double findHighestScoreByUserIdAndInterviewTypeIgnoreCaseAndStatusIgnoreCase(
            @Param("userId") Long userId,
            @Param("interviewType") String interviewType,
            @Param("status") String status
    );
}