package com.sih.edlearn.repository;

import com.sih.edlearn.entity.Video;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
    Page<Video> findBySchoolClassIdAndSubjectIdAndStatus(
            Integer classId, Integer subjectId, Video.Status status, Pageable pageable);
    Page<Video> findByTeacherIdAndStatus(Long teacherId, Video.Status status, Pageable pageable);
    Page<Video> findByTeacherId(Long teacherId, Pageable pageable);
    Page<Video> findByChapterIdAndStatus(Integer chapterId, Video.Status status, Pageable pageable);
    long countByTeacherId(Long teacherId);
}


