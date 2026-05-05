package com.sih.edlearn.repository;

import com.sih.edlearn.entity.Quiz;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Page<Quiz> findBySchoolClassIdAndSubjectIdAndIsPublished(
            Integer classId, Integer subjectId, Boolean isPublished, Pageable pageable);
    Page<Quiz> findBySchoolClassIdAndDifficultyAndIsPublished(
            Integer classId, Quiz.Difficulty difficulty, Boolean isPublished, Pageable pageable);
    Page<Quiz> findByTeacherIdAndIsPublished(Long teacherId, Boolean isPublished, Pageable pageable);
    long countByTeacherId(Long teacherId);
}


