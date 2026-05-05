package com.sih.edlearn.repository;

import com.sih.edlearn.entity.ExerciseSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseSubmissionRepository extends JpaRepository<ExerciseSubmission, Long> {

    /**
     * Find submission by exercise and student
     */
    Optional<ExerciseSubmission> findByExerciseIdAndStudentId(Long exerciseId, Long studentId);

    /**
     * Find all submissions for a student
     */
    Page<ExerciseSubmission> findByStudentIdOrderBySubmittedAtDesc(Long studentId, Pageable pageable);

    /**
     * Find submissions for an exercise
     */
    Page<ExerciseSubmission> findByExerciseIdOrderBySubmittedAtDesc(Long exerciseId, Pageable pageable);

    /**
     * Find all graded submissions for an exercise
     */
    Page<ExerciseSubmission> findByExerciseIdAndStatusOrderByGradedAtDesc(
            Long exerciseId, ExerciseSubmission.SubmissionStatus status, Pageable pageable);

    /**
     * Find pending submissions for a teacher's exercise
     */
    List<ExerciseSubmission> findByExerciseIdAndStatusNot(
            Long exerciseId, ExerciseSubmission.SubmissionStatus status);

    /**
     * Count submissions by status for an exercise
     */
    long countByExerciseIdAndStatus(Long exerciseId, ExerciseSubmission.SubmissionStatus status);

    /**
     * Check if student has submitted exercise
     */
    boolean existsByExerciseIdAndStudentIdAndStatusIn(
            Long exerciseId, Long studentId, List<ExerciseSubmission.SubmissionStatus> statuses);
}

