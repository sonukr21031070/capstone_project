package com.sih.edlearn.service;

import com.sih.edlearn.dto.request.AnnouncementRequest;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final AnnouncementRepository announcementRepository;
    private final ClassSubjectTeacherRepository classSubjectTeacherRepository;

    public PagedResponse<UserSummaryResponse> getPendingUsers(int page, int size, User.Role role) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> usersPage = role != null
                ? userRepository.findByRoleAndStatus(role, User.Status.PENDING, pageable)
                : userRepository.findByStatus(User.Status.PENDING, pageable);

        return buildPagedResponse(usersPage.map(this::mapUserToResponse), page);
    }

    @Transactional
    public void approveUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setStatus(User.Status.APPROVED);
        userRepository.save(user);
        log.info("User approved: {} ({})", user.getUsername(), user.getRole());
    }

    @Transactional
    public void rejectUser(Long userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setStatus(User.Status.REJECTED);
        userRepository.save(user);
        log.info("User rejected: {} ({}). Reason: {}", user.getUsername(), user.getRole(), reason);
    }

    @Transactional
    public void suspendUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setStatus(User.Status.SUSPENDED);
        userRepository.save(user);
        log.info("User suspended: {} ({})", user.getUsername(), user.getRole());
    }

    public Map<String, Object> getDashboardStats() {
        long totalStudents = userRepository.countByRole(User.Role.STUDENT);
        long totalTeachers = userRepository.countByRole(User.Role.TEACHER);
        long totalParents = userRepository.countByRole(User.Role.PARENT);
        long pendingCount = userRepository.countByStatus(User.Status.PENDING);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", totalStudents);
        stats.put("totalTeachers", totalTeachers);
        stats.put("totalParents", totalParents);
        stats.put("pendingCount", pendingCount);
        return stats;
    }

    @Transactional
    public void createAnnouncement(AnnouncementRequest request) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", currentUsername));

        Announcement announcement = Announcement.builder()
                .createdBy(user)
                .title(request.getTitle())
                .titleHindi(request.getTitleHindi())
                .titlePunjabi(request.getTitlePunjabi())
                .content(request.getContent())
                .contentHindi(request.getContentHindi())
                .contentPunjabi(request.getContentPunjabi())
                .targetRole(Announcement.TargetRole.valueOf(request.getTargetRole()))
                .priority(Announcement.Priority.valueOf(request.getPriority()))
                .isActive(true)
                .publishDate(LocalDateTime.now())
                .expireDate(request.getExpireDate() != null ?
                        LocalDateTime.parse(request.getExpireDate()) : null)
                .build();

        announcementRepository.save(announcement);
        log.info("Announcement created by admin: {}", announcement.getTitle());
    }

    public PagedResponse<UserSummaryResponse> getAllUsers(int page, int size, User.Role role, User.Status status) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> usersPage;

        if (role != null && status != null) {
            usersPage = userRepository.findByRoleAndStatus(role, status, pageable);
        } else if (role != null) {
            usersPage = userRepository.findByRole(role, pageable);
        } else if (status != null) {
            usersPage = userRepository.findByStatus(status, pageable);
        } else {
            usersPage = userRepository.findAll(pageable);
        }

        return buildPagedResponse(usersPage.map(this::mapUserToResponse), page);
    }

    public List<Map<String, Object>> getClassTeacherMapping() {
        List<ClassSubjectTeacher> mappings = classSubjectTeacherRepository.findAll();
        return mappings.stream()
                .map(m -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", m.getId());
                    map.put("className", m.getSchoolClass().getName());
                    map.put("subjectName", m.getSubject().getName());
                    map.put("teacherName", m.getTeacher().getUser().getFullName());
                    map.put("academicYear", m.getAcademicYear());
                    return map;
                })
                .collect(Collectors.toList());
    }

    private UserSummaryResponse mapUserToResponse(User user) {
        return UserSummaryResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .language(user.getLanguage())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private <T> PagedResponse<T> buildPagedResponse(Page<T> page, int pageNumber) {
        return PagedResponse.<T>builder()
                .content(page.getContent())
                .page(pageNumber)
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}

