package com.sih.edlearn.repository;

import com.sih.edlearn.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByStudentId(Long studentId);
    Optional<QuizAttempt> findTopByStudentIdAndQuizIdOrderByCompletedAtDesc(Long studentId, Long quizId);
    long countByStudentIdAndStatus(Long studentId, QuizAttempt.Status status);
}

