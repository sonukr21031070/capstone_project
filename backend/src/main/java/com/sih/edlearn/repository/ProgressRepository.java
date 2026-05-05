package com.sih.edlearn.repository;

import com.sih.edlearn.entity.Progress;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {
    List<Progress> findByStudentId(Long studentId);
    Optional<Progress> findByStudentIdAndChapterId(Long studentId, Integer chapterId);
    List<Progress> findByStudentIdAndSubjectId(Long studentId, Integer subjectId);
}

