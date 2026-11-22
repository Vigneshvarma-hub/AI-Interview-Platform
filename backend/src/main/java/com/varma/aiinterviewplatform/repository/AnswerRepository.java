
package com.varma.aiinterviewplatform.repository;

import com.varma.aiinterviewplatform.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

    List<Answer> findByInterviewId(Long interviewId);

    Optional<Answer> findByInterview_IdAndQuestion_Id(
            Long interviewId,
            Long questionId
    );

    long countByInterviewId(Long interviewId);

    boolean existsByInterview_IdAndQuestion_Id(
            Long interviewId,
            Long questionId
    );

    long countByInterview_User_IdAndInterview_InterviewTypeIgnoreCase(
            Long userId,
            String interviewType
    );

    // Retrieve answers only when the interview belongs to this email.
    List<Answer> findByInterview_IdAndInterview_User_EmailOrderByIdAsc(
            Long interviewId,
            String email
    );
}
