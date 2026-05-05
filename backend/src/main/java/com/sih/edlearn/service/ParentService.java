package com.sih.edlearn.service;

import com.sih.edlearn.dto.response.*;
import com.sih.edlearn.entity.*;
import com.sih.edlearn.exception.ResourceNotFoundException;
import com.sih.edlearn.repository.*;
import com.sih.edlearn.util.PagedResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParentService {

    private final ParentRepository parentRepository;
    private final UserRepository userRepository;
    private final ParentStudentMappingRepository parentStudentMappingRepository;
    private final TeacherRemarkRepository teacherRemarkRepository;
    private final AnnouncementRepository announcementRepository;
    private final ProgressRepository progressRepository;

    public List<Map<String, Object>> getChildren(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Parent parent = parentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent", user.getId()));

        return parentStudentMappingRepository.findByParentId(parent.getId()).stream()
                .map(m -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("studentId", m.getStudent().getId());
                    map.put("studentName", m.getStudent().getUser().getFullName());
                    map.put("className", m.getStudent().getSchoolClass().getName());
                    map.put("rollNumber", m.getStudent().getRollNumber());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public List<ProgressResponse> getChildProgress(String username, Long studentId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Parent parent = parentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent", user.getId()));

        // Verify parent owns this student
        if (!parentStudentMappingRepository.existsByParentIdAndStudentId(parent.getId(), studentId)) {
            throw new ResourceNotFoundException("You don't have permission to view this student's progress");
        }

        return progressRepository.findByStudentId(studentId).stream()
                .map(p -> ProgressResponse.builder()
                        .id(p.getId())
                        .subjectName(p.getSubject().getName())
                        .chapterTitle(p.getChapter().getTitle())
                        .notesRead(p.getNotesRead())
                        .videosWatched(p.getVideosWatched())
                        .quizzesTaken(p.getQuizzesTaken())
                        .avgScore(p.getAvgScore())
                        .timeSpentMins(p.getTimeSpentMins())
                        .isChapterComplete(p.getIsChapterComplete())
                        .build())
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getChildRemarks(String username, Long studentId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Parent parent = parentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent", user.getId()));

        // Verify parent owns this student
        if (!parentStudentMappingRepository.existsByParentIdAndStudentId(parent.getId(), studentId)) {
            throw new ResourceNotFoundException("You don't have permission to view this student's remarks");
        }

        return teacherRemarkRepository.findByStudentIdOrderByCreatedAtDesc(studentId).stream()
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId());
                    map.put("teacherName", r.getTeacher().getUser().getFullName());
                    map.put("remarkText", r.getRemarkText());
                    map.put("remarkType", r.getRemarkType().name());
                    map.put("createdAt", r.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public PagedResponse<Object> getAnnouncements(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Announcement> announcementsPage = announcementRepository.findActiveByRole(
                Announcement.TargetRole.PARENT, LocalDateTime.now(), pageable);

        List<Object> announcements = announcementsPage.getContent().stream()
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", a.getId());
                    map.put("title", a.getTitle());
                    map.put("content", a.getContent());
                    map.put("priority", a.getPriority());
                    map.put("publishDate", a.getPublishDate());
                    return (Object) map;
                })
                .collect(Collectors.toList());

        return PagedResponse.builder()
                .content(announcements)
                .page(page)
                .size(size)
                .totalElements(announcementsPage.getTotalElements())
                .totalPages(announcementsPage.getTotalPages())
                .last(announcementsPage.isLast())
                .build();
    }

    public Map<String, Object> getDashboard(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Parent parent = parentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent", user.getId()));

        List<ParentStudentMapping> childMappings = parentStudentMappingRepository.findByParentId(parent.getId());

        List<Map<String, Object>> childrenData = childMappings.stream()
                .map(m -> {
                    Student student = m.getStudent();
                    List<Progress> progressList = progressRepository.findByStudentId(student.getId());
                    double avgScore = progressList.isEmpty() ? 0 :
                            progressList.stream()
                                    .mapToDouble(p -> p.getAvgScore() != null ? p.getAvgScore().doubleValue() : 0.0)
                                    .average()
                                    .orElse(0);
                    int totalTime = progressList.stream()
                            .mapToInt(p -> p.getTimeSpentMins() != null ? p.getTimeSpentMins() : 0)
                            .sum();
                    int quizzesTaken = progressList.stream()
                            .mapToInt(p -> p.getQuizzesTaken() != null ? p.getQuizzesTaken() : 0)
                            .sum();

                    Map<String, Object> data = new HashMap<>();
                    data.put("studentName", student.getUser().getFullName());
                    data.put("className", student.getSchoolClass().getName());
                    data.put("rollNumber", student.getRollNumber());
                    data.put("avgScore", avgScore);
                    data.put("timeSpentMins", totalTime);
                    data.put("quizzesTaken", quizzesTaken);
                    return data;
                })
                .collect(Collectors.toList());

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("children", childrenData);
        dashboard.put("childrenCount", childMappings.size());
        return dashboard;
    }
}

