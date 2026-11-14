
package com.varma.aiinterviewplatform.repository;

import com.varma.aiinterviewplatform.entity.Question;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestionRepository
        extends JpaRepository<Question, Long> {

    // Find questions by technology without case sensitivity.
    List<Question> findByTechnologyIgnoreCase(String technology);

    // Keep the original technology-based query for existing code.
    List<Question> findByTechnology(String technology);

    // Find questions by technology and difficulty, ignoring case and spaces.
    @Query("""
        SELECT q FROM Question q
        WHERE LOWER(TRIM(q.technology)) = LOWER(TRIM(:technology))
          AND LOWER(TRIM(q.difficulty)) = LOWER(TRIM(:difficulty))
        """)
    List<Question> findMatchingQuestions(
            @Param("technology") String technology,
            @Param("difficulty") String difficulty
    );

    // Find MCQ questions for a technology that have all options and an answer.
    List<Question>
    findByTechnologyAndOptionANotNullAndOptionBNotNullAndOptionCNotNullAndOptionDNotNullAndCorrectOptionNotNull(
            String technology
    );

    // Find MCQ questions by technology and difficulty.
    List<Question>
    findByTechnologyAndDifficultyAndOptionANotNullAndOptionBNotNullAndOptionCNotNullAndOptionDNotNullAndCorrectOptionNotNull(
            String technology,
            String difficulty
    );
}
