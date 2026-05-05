package com.sih.edlearn.repository;

import com.sih.edlearn.entity.Teacher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByUserId(Long userId);
    boolean existsByEmployeeId(String employeeId);
    Page<Teacher> findAll(Pageable pageable);
}

