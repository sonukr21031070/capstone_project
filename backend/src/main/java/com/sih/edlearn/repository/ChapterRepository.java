package com.sih.edlearn.repository;

import com.sih.edlearn.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Integer> {
    List<Chapter> findBySubjectIdAndSchoolClassId(Integer subjectId, Integer classId);
    List<Chapter> findBySchoolClassId(Integer classId);
    List<Chapter> findBySubjectId(Integer subjectId);
}



