package com.sih.edlearn.controller;

import com.sih.edlearn.dto.response.ProgressResponse;
import com.sih.edlearn.service.ParentService;
import com.sih.edlearn.util.ApiResponse;
import com.sih.edlearn.util.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/parent")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
public class ParentController {

    private final ParentService parentService;

    @GetMapping("/children")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getChildren() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Map<String, Object>> children = parentService.getChildren(username);
        return ResponseEntity.ok(ApiResponse.success(children));
    }

    @GetMapping("/child/{studentId}/progress")
    public ResponseEntity<ApiResponse<List<ProgressResponse>>> getChildProgress(@PathVariable Long studentId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ProgressResponse> progress = parentService.getChildProgress(username, studentId);
        return ResponseEntity.ok(ApiResponse.success(progress));
    }

    @GetMapping("/child/{studentId}/remarks")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getChildRemarks(@PathVariable Long studentId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Map<String, Object>> remarks = parentService.getChildRemarks(username, studentId);
        return ResponseEntity.ok(ApiResponse.success(remarks));
    }

    @GetMapping("/announcements")
    public ResponseEntity<ApiResponse<PagedResponse<Object>>> getAnnouncements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<Object> response = parentService.getAnnouncements(page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> dashboard = parentService.getDashboard(username);
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }
}

