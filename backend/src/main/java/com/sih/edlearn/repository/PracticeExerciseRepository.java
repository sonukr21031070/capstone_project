package com.sih.edlearn.repository;

import com.sih.edlearn.entity.PracticeExercise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PracticeExerciseRepository extends JpaRepository<PracticeExercise, Long> {
    Page<PracticeExercise> findBySchoolClassIdAndStatus(
            Integer classId, PracticeExercise.Status status, Pageable pageable);
    Page<PracticeExercise> findByTeacherIdAndStatus(
            Long teacherId, PracticeExercise.Status status, Pageable pageable);
}

