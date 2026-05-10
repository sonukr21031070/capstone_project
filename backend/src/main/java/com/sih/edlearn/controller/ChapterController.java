package com.sih.edlearn.controller;

import com.sih.edlearn.entity.Chapter;
import com.sih.edlearn.repository.ChapterRepository;
import com.sih.edlearn.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chapters")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
public class ChapterController {

    private final ChapterRepository chapterRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Chapter>>> getChapters(
            @RequestParam(required = false) Integer classId,
            @RequestParam(required = false) Integer subjectId) {
        List<Chapter> chapters;
        if (classId != null && subjectId != null) {
            chapters = chapterRepository.findBySubjectIdAndSchoolClassId(subjectId, classId);
        } else if (classId != null) {
            chapters = chapterRepository.findBySchoolClassId(classId);
        } else if (subjectId != null) {
            chapters = chapterRepository.findBySubjectId(subjectId);
        } else {
            chapters = chapterRepository.findAll();
        }
        return ResponseEntity.ok(ApiResponse.success(chapters));
    }
}

