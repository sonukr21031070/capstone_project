package com.sih.edlearn.repository;

import com.sih.edlearn.entity.Progress;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {

    @Query("SELECT DISTINCT p FROM Progress p " +
           "LEFT JOIN FETCH p.subject " +
           "LEFT JOIN FETCH p.chapter " +
           "WHERE p.student.id = :studentId " +
           "ORDER BY p.chapter.id")
    List<Progress> findByStudentId(Long studentId);

    @Query("SELECT p FROM Progress p " +
           "LEFT JOIN FETCH p.subject " +
           "LEFT JOIN FETCH p.chapter " +
           "WHERE p.student.id = :studentId AND p.chapter.id = :chapterId")
    Optional<Progress> findByStudentIdAndChapterId(Long studentId, Integer chapterId);

    @Query("SELECT DISTINCT p FROM Progress p " +
           "LEFT JOIN FETCH p.subject " +
           "LEFT JOIN FETCH p.chapter " +
           "WHERE p.student.id = :studentId AND p.subject.id = :subjectId " +
           "ORDER BY p.chapter.id")
    List<Progress> findByStudentIdAndSubjectId(Long studentId, Integer subjectId);
}

