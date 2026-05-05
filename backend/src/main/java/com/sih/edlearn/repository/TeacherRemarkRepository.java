package com.sih.edlearn.repository;

import com.sih.edlearn.entity.TeacherRemark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherRemarkRepository extends JpaRepository<TeacherRemark, Long> {
    List<TeacherRemark> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<TeacherRemark> findByTeacherIdAndStudentId(Long teacherId, Long studentId);
}

