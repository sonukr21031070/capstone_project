package com.sih.edlearn.controller;

import com.sih.edlearn.dto.request.QuizSubmitRequest;
import com.sih.edlearn.dto.response.*;
import com.sih.edlearn.entity.Subject;
import com.sih.edlearn.entity.Chapter;
import com.sih.edlearn.service.StudentService;
import com.sih.edlearn.util.ApiResponse;
import com.sih.edlearn.util.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<List<Subject>>> getSubjects() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Subject> subjects = studentService.getSubjectsForStudent(username);
        return ResponseEntity.ok(ApiResponse.success(subjects));
    }

    @GetMapping("/chapters")
    public ResponseEntity<ApiResponse<List<Chapter>>> getChapters(
            @RequestParam(required = false) Integer subjectId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Chapter> chapters = studentService.getChaptersForStudent(username, subjectId);
        return ResponseEntity.ok(ApiResponse.success(chapters));
    }

    @GetMapping("/notes")
    public ResponseEntity<ApiResponse<PagedResponse<NoteResponse>>> getNotes(
            @RequestParam(required = false) Integer subjectId,
            @RequestParam(required = false) Integer chapterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        PagedResponse<NoteResponse> response = studentService.getNotes(username, subjectId, chapterId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/videos")
    public ResponseEntity<ApiResponse<PagedResponse<VideoResponse>>> getVideos(
            @RequestParam(required = false) Integer subjectId,
            @RequestParam(required = false) Integer chapterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        PagedResponse<VideoResponse> response = studentService.getVideos(username, subjectId, chapterId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/quizzes")
    public ResponseEntity<ApiResponse<PagedResponse<QuizResponse>>> getQuizzes(
            @RequestParam(required = false) Integer subjectId,
            @RequestParam(required = false) Integer chapterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        PagedResponse<QuizResponse> response = studentService.getQuizzes(username, subjectId, chapterId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/quiz/{quizId}/submit")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitQuiz(
            @PathVariable Long quizId,
            @RequestBody QuizSubmitRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> result = studentService.submitQuiz(username, quizId, request);
        return ResponseEntity.ok(ApiResponse.success("Quiz submitted successfully", result));
    }

    @GetMapping("/exercises")
    public ResponseEntity<ApiResponse<PagedResponse<ExerciseResponse>>> getExercises(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "ALL") String filter) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        PagedResponse<ExerciseResponse> response = studentService.getStudentExercises(username, page, size, filter);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/exercises/{exerciseId}")
    public ResponseEntity<ApiResponse<ExerciseResponse>> getExerciseDetails(
            @PathVariable Long exerciseId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        ExerciseResponse response = studentService.getExerciseDetails(username, exerciseId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/exercises/{exerciseId}/submit")
    public ResponseEntity<ApiResponse<ExerciseSubmissionResponse>> submitExercise(
            @PathVariable Long exerciseId,
            @RequestParam(required = false) MultipartFile[] files,
            @RequestParam(required = false, defaultValue = "") String notes) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        ExerciseSubmissionResponse response = studentService.submitExercise(username, exerciseId, files, notes);
        return ResponseEntity.ok(ApiResponse.success("Exercise submitted successfully", response));
    }

    @GetMapping("/exercises/{exerciseId}/submission")
    public ResponseEntity<ApiResponse<ExerciseSubmissionResponse>> getExerciseSubmission(
            @PathVariable Long exerciseId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        ExerciseSubmissionResponse response = studentService.getStudentSubmission(username, exerciseId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/submissions")
    public ResponseEntity<ApiResponse<PagedResponse<ExerciseSubmissionResponse>>> getMySubmissions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        PagedResponse<ExerciseSubmissionResponse> response = studentService.getStudentSubmissions(username, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/progress")
    public ResponseEntity<ApiResponse<List<ProgressResponse>>> getProgress() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ProgressResponse> response = studentService.getProgress(username);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/confidence/{chapterId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> recordConfidence(
            @PathVariable Integer chapterId,
            @RequestParam String level) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, String> response = studentService.recordConfidence(username, chapterId, level);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/announcements")
    public ResponseEntity<ApiResponse<PagedResponse<Object>>> getAnnouncements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<Object> response = studentService.getAnnouncements(page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> dashboard = studentService.getDashboard(username);
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }
}

