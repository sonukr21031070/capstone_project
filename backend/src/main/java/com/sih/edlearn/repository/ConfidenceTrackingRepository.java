package com.sih.edlearn.repository;

import com.sih.edlearn.entity.ConfidenceTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConfidenceTrackingRepository extends JpaRepository<ConfidenceTracking, Long> {
    Optional<ConfidenceTracking> findTopByStudentIdAndChapterIdOrderByRecordedAtDesc(
            Long studentId, Integer chapterId);
    List<ConfidenceTracking> findByStudentIdOrderByRecordedAtDesc(Long studentId);
}

