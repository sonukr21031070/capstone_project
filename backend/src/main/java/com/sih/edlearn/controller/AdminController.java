package com.sih.edlearn.controller;

import com.sih.edlearn.dto.request.AnnouncementRequest;
import com.sih.edlearn.dto.response.UserSummaryResponse;
import com.sih.edlearn.entity.User;
import com.sih.edlearn.service.AdminService;
import com.sih.edlearn.util.ApiResponse;
import com.sih.edlearn.util.PagedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/pending-users")
    public ResponseEntity<ApiResponse<PagedResponse<UserSummaryResponse>>> getPendingUsers(
            @RequestParam(required = false) User.Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<UserSummaryResponse> response = adminService.getPendingUsers(page, size, role);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<ApiResponse<String>> approveUser(@PathVariable Long id) {
        adminService.approveUser(id);
        return ResponseEntity.ok(ApiResponse.success("User approved successfully"));
    }

    @PutMapping("/users/{id}/reject")
    public ResponseEntity<ApiResponse<String>> rejectUser(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        adminService.rejectUser(id, reason);
        return ResponseEntity.ok(ApiResponse.success("User rejected successfully"));
    }

    @PutMapping("/users/{id}/suspend")
    public ResponseEntity<ApiResponse<String>> suspendUser(@PathVariable Long id) {
        adminService.suspendUser(id);
        return ResponseEntity.ok(ApiResponse.success("User suspended successfully"));
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PostMapping("/announcements")
    public ResponseEntity<ApiResponse<String>> createAnnouncement(@Valid @RequestBody AnnouncementRequest request) {
        adminService.createAnnouncement(request);
        return ResponseEntity.ok(ApiResponse.success("Announcement created successfully"));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PagedResponse<UserSummaryResponse>>> getAllUsers(
            @RequestParam(required = false) User.Role role,
            @RequestParam(required = false) User.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<UserSummaryResponse> response = adminService.getAllUsers(page, size, role, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/class-teacher-mapping")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getClassTeacherMapping() {
        List<Map<String, Object>> mappings = adminService.getClassTeacherMapping();
        return ResponseEntity.ok(ApiResponse.success(mappings));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUserPermanently(@PathVariable Long id) {
        adminService.deleteUserPermanently(id);
        return ResponseEntity.ok(ApiResponse.success("User and all associated data deleted permanently"));
    }

    @GetMapping("/teachers")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllTeachers() {
        List<Map<String, Object>> teachers = adminService.getAllTeachers();
        return ResponseEntity.ok(ApiResponse.success(teachers));
    }

    @PostMapping("/class-teacher-mapping")
    public ResponseEntity<ApiResponse<String>> createClassTeacherMapping(@RequestBody Map<String, Object> request) {
        adminService.createClassTeacherMapping(request);
        return ResponseEntity.ok(ApiResponse.success("Mapping created successfully"));
    }

    @PutMapping("/class-teacher-mapping/{id}")
    public ResponseEntity<ApiResponse<String>> updateClassTeacherMapping(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> request) {
        adminService.updateClassTeacherMapping(id, request);
        return ResponseEntity.ok(ApiResponse.success("Mapping updated successfully"));
    }

    @DeleteMapping("/class-teacher-mapping/{id}")
    public ResponseEntity<ApiResponse<String>> deleteClassTeacherMapping(@PathVariable Integer id) {
        adminService.deleteClassTeacherMapping(id);
        return ResponseEntity.ok(ApiResponse.success("Mapping deleted successfully"));
    }

    @GetMapping("/classes/overview")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getClassesOverview() {
        List<Map<String, Object>> overview = adminService.getClassesOverview();
        return ResponseEntity.ok(ApiResponse.success(overview));
    }

    @GetMapping("/classes/{classId}/students")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStudentsByClass(@PathVariable Integer classId) {
        List<Map<String, Object>> students = adminService.getStudentsByClass(classId);
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @GetMapping("/classes/{classId}/teachers")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTeachersByClass(@PathVariable Integer classId) {
        List<Map<String, Object>> teachers = adminService.getTeachersByClass(classId);
        return ResponseEntity.ok(ApiResponse.success(teachers));
    }

    @GetMapping("/classes/all")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllClasses() {
        List<Map<String, Object>> classes = adminService.getAllClasses();
        return ResponseEntity.ok(ApiResponse.success(classes));
    }

    @GetMapping("/students/unassigned")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllStudentsWithoutClass() {
        List<Map<String, Object>> students = adminService.getAllStudentsWithoutClass();
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @PostMapping("/students/{studentId}/assign-class/{classId}")
    public ResponseEntity<ApiResponse<String>> assignStudentToClass(
            @PathVariable Long studentId,
            @PathVariable Integer classId) {
        adminService.assignStudentToClass(studentId, classId);
        return ResponseEntity.ok(ApiResponse.success("Student assigned to class successfully"));
    }
}
