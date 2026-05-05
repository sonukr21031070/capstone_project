package com.sih.edlearn.repository;

import com.sih.edlearn.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    Page<Student> findBySchoolClassId(Integer classId, Pageable pageable);

    @Query("SELECT s FROM Student s JOIN s.user u WHERE u.status = 'APPROVED'")
    Page<Student> findAllApproved(Pageable pageable);
}

