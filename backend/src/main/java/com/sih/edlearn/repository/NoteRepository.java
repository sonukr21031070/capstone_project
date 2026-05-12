package com.sih.edlearn.repository;

import com.sih.edlearn.entity.Note;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    // JOIN FETCH queries to avoid LazyInitializationException
    @Query("SELECT DISTINCT n FROM Note n " +
           "LEFT JOIN FETCH n.teacher t " +
           "LEFT JOIN FETCH t.user " +
           "LEFT JOIN FETCH n.chapter " +
           "LEFT JOIN FETCH n.subject " +
           "LEFT JOIN FETCH n.schoolClass " +
           "WHERE n.schoolClass.id = :classId AND n.subject.id = :subjectId AND n.status = :status " +
           "ORDER BY n.createdAt DESC")
    Page<Note> findBySchoolClassIdAndSubjectIdAndStatus(
            Integer classId, Integer subjectId, Note.Status status, Pageable pageable);

    @Query("SELECT DISTINCT n FROM Note n " +
           "LEFT JOIN FETCH n.teacher t " +
           "LEFT JOIN FETCH t.user " +
           "LEFT JOIN FETCH n.chapter " +
           "LEFT JOIN FETCH n.subject " +
           "LEFT JOIN FETCH n.schoolClass " +
           "WHERE n.schoolClass.id = :classId AND n.status = :status " +
           "ORDER BY n.createdAt DESC")
    Page<Note> findBySchoolClassIdAndStatus(Integer classId, Note.Status status, Pageable pageable);

    @Query("SELECT DISTINCT n FROM Note n " +
           "LEFT JOIN FETCH n.teacher t " +
           "LEFT JOIN FETCH t.user " +
           "LEFT JOIN FETCH n.chapter " +
           "LEFT JOIN FETCH n.subject " +
           "LEFT JOIN FETCH n.schoolClass " +
           "WHERE n.chapter.id = :chapterId AND n.status = :status " +
           "ORDER BY n.createdAt DESC")
    Page<Note> findByChapterIdAndStatus(Integer chapterId, Note.Status status, Pageable pageable);

    @Query("SELECT DISTINCT n FROM Note n " +
           "LEFT JOIN FETCH n.teacher t " +
           "LEFT JOIN FETCH t.user " +
           "LEFT JOIN FETCH n.chapter " +
           "LEFT JOIN FETCH n.subject " +
           "LEFT JOIN FETCH n.schoolClass " +
           "WHERE n.teacher.id = :teacherId AND n.status = :status " +
           "ORDER BY n.createdAt DESC")
    Page<Note> findByTeacherIdAndStatus(Long teacherId, Note.Status status, Pageable pageable);

    @Query("SELECT COUNT(n) FROM Note n WHERE n.teacher.id = :teacherId")
    long countByTeacherId(Long teacherId);
}

