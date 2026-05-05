package com.sih.edlearn.repository;

import com.sih.edlearn.entity.Note;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    Page<Note> findBySchoolClassIdAndSubjectIdAndStatus(
            Integer classId, Integer subjectId, Note.Status status, Pageable pageable);

    Page<Note> findBySchoolClassIdAndStatus(Integer classId, Note.Status status, Pageable pageable);

    Page<Note> findByChapterIdAndStatus(Integer chapterId, Note.Status status, Pageable pageable);

    Page<Note> findByTeacherIdAndStatus(Long teacherId, Note.Status status, Pageable pageable);

    long countByTeacherId(Long teacherId);
}

