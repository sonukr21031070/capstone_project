package com.sih.edlearn.controller;

import com.sih.edlearn.entity.SchoolClass;
import com.sih.edlearn.entity.Subject;
import com.sih.edlearn.repository.SchoolClassRepository;
import com.sih.edlearn.repository.SubjectRepository;
import com.sih.edlearn.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicController {

    private final SchoolClassRepository classRepository;
    private final SubjectRepository subjectRepository;

    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<List<SchoolClass>>> getAllClasses() {
        List<SchoolClass> classes = classRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(classes));
    }

    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<List<Subject>>> getAllSubjects() {
        List<Subject> subjects = subjectRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(subjects));
    }
}

