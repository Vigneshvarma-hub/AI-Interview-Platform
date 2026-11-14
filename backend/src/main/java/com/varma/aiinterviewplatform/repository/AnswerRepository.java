
package com.varma.aiinterviewplatform.repository;

import com.varma.aiinterviewplatform.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

    // Retrieve all answers submitted for an interview.
    List<Answer> findByInterviewId(Long interviewId);

    // Find an answer using its interview and question IDs.
    Optional<Answer> findByInterview_IdAndQuestion_Id(
            Long interviewId,
            Long questionId
    );

    // Count answers submitted for an interview.
    long countByInterviewId(Long interviewId);

    // Check whether an answer already exists for a question in an interview.
    boolean existsByInterview_IdAndQuestion_Id(
            Long interviewId,
            Long questionId
    );

    // Count only answers belonging to AI mock interviews for a user.
    // Normal interviews and MCQ assessments are not included.
    long countByInterview_User_IdAndInterview_InterviewTypeIgnoreCase(
            Long userId,
            String interviewType
    );
}
