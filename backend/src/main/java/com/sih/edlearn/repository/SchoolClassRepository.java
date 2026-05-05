package com.sih.edlearn.repository;

import com.sih.edlearn.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchoolClassRepository extends JpaRepository<SchoolClass, Integer> {
    List<SchoolClass> findByGrade(int grade);
}

