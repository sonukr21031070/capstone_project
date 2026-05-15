package com.sih.edlearn.repository;

import com.sih.edlearn.entity.Quiz;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    @Query("SELECT DISTINCT q FROM Quiz q " +
           "LEFT JOIN FETCH q.teacher t " +
           "LEFT JOIN FETCH t.user " +
           "LEFT JOIN FETCH q.chapter " +
           "LEFT JOIN FETCH q.subject " +
           "LEFT JOIN FETCH q.schoolClass " +
           "WHERE q.schoolClass.id = :classId AND q.subject.id = :subjectId AND q.isPublished = :isPublished " +
           "ORDER BY q.createdAt DESC")
    Page<Quiz> findBySchoolClassIdAndSubjectIdAndIsPublished(
            Integer classId, Integer subjectId, Boolean isPublished, Pageable pageable);

    @Query("SELECT DISTINCT q FROM Quiz q " +
           "LEFT JOIN FETCH q.teacher t " +
           "LEFT JOIN FETCH t.user " +
           "LEFT JOIN FETCH q.chapter " +
           "LEFT JOIN FETCH q.subject " +
           "LEFT JOIN FETCH q.schoolClass " +
           "WHERE q.schoolClass.id = :classId AND q.difficulty = :difficulty AND q.isPublished = :isPublished " +
           "ORDER BY q.createdAt DESC")
    Page<Quiz> findBySchoolClassIdAndDifficultyAndIsPublished(
            Integer classId, Quiz.Difficulty difficulty, Boolean isPublished, Pageable pageable);

    @Query("SELECT DISTINCT q FROM Quiz q " +
           "LEFT JOIN FETCH q.teacher t " +
           "LEFT JOIN FETCH t.user " +
           "LEFT JOIN FETCH q.chapter " +
           "LEFT JOIN FETCH q.subject " +
           "LEFT JOIN FETCH q.schoolClass " +
           "WHERE q.teacher.id = :teacherId AND q.isPublished = :isPublished " +
           "ORDER BY q.createdAt DESC")
    Page<Quiz> findByTeacherIdAndIsPublished(Long teacherId, Boolean isPublished, Pageable pageable);

     @Query("SELECT COUNT(q) FROM Quiz q WHERE q.teacher.id = :teacherId")
     long countByTeacherId(Long teacherId);

     @Query("SELECT DISTINCT q FROM Quiz q " +
            "LEFT JOIN FETCH q.teacher t " +
            "LEFT JOIN FETCH t.user " +
            "LEFT JOIN FETCH q.chapter " +
            "LEFT JOIN FETCH q.subject " +
            "LEFT JOIN FETCH q.schoolClass " +
            "WHERE q.schoolClass.id = :classId AND q.subject.id = :subjectId AND q.chapter.id = :chapterId AND q.isPublished = :isPublished " +
            "ORDER BY q.createdAt DESC")
     Page<Quiz> findBySchoolClassIdAndSubjectIdAndChapterIdAndIsPublished(
             Integer classId, Integer subjectId, Integer chapterId, Boolean isPublished, Pageable pageable);
 }
 

