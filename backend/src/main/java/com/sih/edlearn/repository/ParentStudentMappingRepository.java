package com.sih.edlearn.repository;

import com.sih.edlearn.entity.ParentStudentMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParentStudentMappingRepository extends JpaRepository<ParentStudentMapping, Long> {
    List<ParentStudentMapping> findByParentId(Long parentId);
    List<ParentStudentMapping> findByStudentId(Long studentId);
    boolean existsByParentIdAndStudentId(Long parentId, Long studentId);
}

