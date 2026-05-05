package com.sih.edlearn.repository;

import com.sih.edlearn.entity.ClassSubjectTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassSubjectTeacherRepository extends JpaRepository<ClassSubjectTeacher, Integer> {
    List<ClassSubjectTeacher> findByTeacherId(Long teacherId);
    List<ClassSubjectTeacher> findBySchoolClassId(Integer classId);
}

