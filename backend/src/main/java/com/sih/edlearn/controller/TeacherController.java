package com.sih.edlearn.controller;

import com.sih.edlearn.dto.request.*;
import com.sih.edlearn.dto.response.*;
import com.sih.edlearn.service.TeacherService;
import com.sih.edlearn.util.ApiResponse;
import com.sih.edlearn.util.PagedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/teacher")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
public class TeacherController {

    private final TeacherService teacherService;

    @PostMapping("/notes")
    public ResponseEntity<ApiResponse<NoteResponse>> createNote(@Valid @RequestBody NoteRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        NoteResponse response = teacherService.createNote(request, username);
        return ResponseEntity.ok(ApiResponse.success("Note created successfully", response));
    }

    @PostMapping("/notes/upload-pdf")
    public ResponseEntity<ApiResponse<NoteResponse>> uploadPdfNote(
            @RequestParam MultipartFile file,
            @RequestParam Integer classId,
            @RequestParam Integer subjectId,
            @RequestParam Integer chapterId,
            @RequestParam String title) throws IOException {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        NoteResponse response = teacherService.uploadPdfNote(file, classId, subjectId, chapterId, title, username);
        return ResponseEntity.ok(ApiResponse.success("PDF note uploaded successfully", response));
    }

    @GetMapping("/notes")
    public ResponseEntity<ApiResponse<PagedResponse<NoteResponse>>> getMyNotes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        PagedResponse<NoteResponse> response = teacherService.getTeacherNotes(username, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/notes/{id}/publish")
    public ResponseEntity<ApiResponse<String>> publishNote(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        teacherService.publishNote(id, username);
        return ResponseEntity.ok(ApiResponse.success("Note published successfully"));
    }

    @DeleteMapping("/notes/{id}")
    public ResponseEntity<ApiResponse<String>> deleteNote(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        teacherService.deleteNote(id, username);
        return ResponseEntity.ok(ApiResponse.success("Note deleted successfully"));
    }

    @PostMapping("/videos/upload")
    public ResponseEntity<ApiResponse<VideoResponse>> uploadVideo(
            @RequestParam MultipartFile video,
            @RequestParam(required = false) MultipartFile thumbnail,
            @RequestParam Integer classId,
            @RequestParam Integer subjectId,
            @RequestParam Integer chapterId,
            @RequestParam String title,
            @RequestParam(required = false) String transcript) throws IOException {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        VideoResponse response = teacherService.uploadVideo(video, thumbnail, classId, subjectId, chapterId, title, transcript, username);
        return ResponseEntity.ok(ApiResponse.success("Video uploaded successfully", response));
    }

    @GetMapping("/videos")
    public ResponseEntity<ApiResponse<PagedResponse<VideoResponse>>> getMyVideos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        PagedResponse<VideoResponse> response = teacherService.getTeacherVideos(username, page, size, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/videos/{id}/publish")
    public ResponseEntity<ApiResponse<String>> publishVideo(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        teacherService.publishVideo(id, username);
        return ResponseEntity.ok(ApiResponse.success("Video published successfully"));
    }

    @DeleteMapping("/videos/{id}")
    public ResponseEntity<ApiResponse<String>> deleteVideo(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        teacherService.deleteVideo(id, username);
        return ResponseEntity.ok(ApiResponse.success("Video deleted successfully"));
    }

    @PostMapping("/quizzes")
    public ResponseEntity<ApiResponse<QuizResponse>> createQuiz(@Valid @RequestBody QuizRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        QuizResponse response = teacherService.createQuiz(request, username);
        return ResponseEntity.ok(ApiResponse.success("Quiz created successfully", response));
    }

    @PutMapping("/quizzes/{id}/publish")
    public ResponseEntity<ApiResponse<String>> publishQuiz(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        teacherService.publishQuiz(id, username);
        return ResponseEntity.ok(ApiResponse.success("Quiz published successfully"));
    }

    @PostMapping("/exercises")
    public ResponseEntity<ApiResponse<Long>> createExercise(@Valid @RequestBody ExerciseRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Long exerciseId = teacherService.createExercise(request, username);
        return ResponseEntity.ok(ApiResponse.success("Exercise created successfully", exerciseId));
    }

    @GetMapping("/exercises/{exerciseId}/submissions")
    public ResponseEntity<ApiResponse<PagedResponse<ExerciseSubmissionResponse>>> getSubmissions(
            @PathVariable Long exerciseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        PagedResponse<ExerciseSubmissionResponse> response = teacherService.getPendingSubmissions(exerciseId, username, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/exercises/{exerciseId}/submissions/pending-count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPendingCount(
            @PathVariable Long exerciseId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        long count = teacherService.countPendingSubmissions(exerciseId, username);
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("exerciseId", exerciseId);
        result.put("pendingCount", count);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<ApiResponse<ExerciseSubmissionResponse>> getSubmission(
            @PathVariable Long submissionId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        ExerciseSubmissionResponse response = teacherService.getSubmissionDetails(submissionId, username);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<ApiResponse<ExerciseSubmissionResponse>> gradeSubmission(
            @PathVariable Long submissionId,
            @Valid @RequestBody GradeSubmissionRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        ExerciseSubmissionResponse response = teacherService.gradeSubmission(submissionId, username, request);
        return ResponseEntity.ok(ApiResponse.success("Submission graded successfully", response));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> dashboard = teacherService.getDashboard(username);
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }
}

