package com.sih.edlearn.repository;

import com.sih.edlearn.entity.Video;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

    @Query("SELECT DISTINCT v FROM Video v " +
           "LEFT JOIN FETCH v.teacher t " +
           "LEFT JOIN FETCH t.user " +
           "LEFT JOIN FETCH v.chapter " +
           "LEFT JOIN FETCH v.subject " +
           "LEFT JOIN FETCH v.schoolClass " +
           "WHERE v.schoolClass.id = :classId AND v.subject.id = :subjectId AND v.status = :status " +
           "ORDER BY v.createdAt DESC")
    Page<Video> findBySchoolClassIdAndSubjectIdAndStatus(
            Integer classId, Integer subjectId, Video.Status status, Pageable pageable);

    @Query("SELECT DISTINCT v FROM Video v " +
           "LEFT JOIN FETCH v.teacher t " +
           "LEFT JOIN FETCH t.user " +
           "LEFT JOIN FETCH v.chapter " +
           "LEFT JOIN FETCH v.subject " +
           "LEFT JOIN FETCH v.schoolClass " +
           "WHERE v.teacher.id = :teacherId AND v.status = :status " +
           "ORDER BY v.createdAt DESC")
    Page<Video> findByTeacherIdAndStatus(Long teacherId, Video.Status status, Pageable pageable);

    @Query("SELECT DISTINCT v FROM Video v " +
           "LEFT JOIN FETCH v.teacher t " +
           "LEFT JOIN FETCH t.user " +
           "LEFT JOIN FETCH v.chapter " +
           "LEFT JOIN FETCH v.subject " +
           "LEFT JOIN FETCH v.schoolClass " +
           "WHERE v.teacher.id = :teacherId " +
           "ORDER BY v.createdAt DESC")
    Page<Video> findByTeacherId(Long teacherId, Pageable pageable);

    @Query("SELECT DISTINCT v FROM Video v " +
           "LEFT JOIN FETCH v.teacher t " +
           "LEFT JOIN FETCH t.user " +
           "LEFT JOIN FETCH v.chapter " +
           "LEFT JOIN FETCH v.subject " +
           "LEFT JOIN FETCH v.schoolClass " +
           "WHERE v.chapter.id = :chapterId AND v.status = :status " +
           "ORDER BY v.createdAt DESC")
    Page<Video> findByChapterIdAndStatus(Integer chapterId, Video.Status status, Pageable pageable);

     @Query("SELECT COUNT(v) FROM Video v WHERE v.teacher.id = :teacherId")
     long countByTeacherId(Long teacherId);

     @Query("SELECT DISTINCT v FROM Video v " +
            "LEFT JOIN FETCH v.teacher t " +
            "LEFT JOIN FETCH t.user " +
            "LEFT JOIN FETCH v.chapter " +
            "LEFT JOIN FETCH v.subject " +
            "LEFT JOIN FETCH v.schoolClass " +
            "WHERE v.schoolClass.id = :classId AND v.subject.id = :subjectId AND v.chapter.id = :chapterId AND v.status = :status " +
            "ORDER BY v.createdAt DESC")
     Page<Video> findBySchoolClassIdAndSubjectIdAndChapterIdAndStatus(
             Integer classId, Integer subjectId, Integer chapterId, Video.Status status, Pageable pageable);
}


