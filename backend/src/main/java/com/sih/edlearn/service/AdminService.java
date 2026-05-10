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
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final ExerciseSubmissionRepository exerciseSubmissionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final ConfidenceTrackingRepository confidenceTrackingRepository;
    private final ProgressRepository progressRepository;
    private final ParentStudentMappingRepository parentStudentMappingRepository;
    private final DownloadRepository downloadRepository;
    private final EmailNotificationRepository emailNotificationRepository;
    private final VideoRepository videoRepository;
    private final NoteRepository noteRepository;
    private final QuizRepository quizRepository;
    private final PracticeExerciseRepository exerciseRepository;
    private final TeacherRemarkRepository teacherRemarkRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;

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

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getClassTeacherMapping() {
        try {
            List<ClassSubjectTeacher> mappings = classSubjectTeacherRepository.findAll();
            return mappings.stream()
                    .filter(m -> m.getSchoolClass() != null && m.getSubject() != null && m.getTeacher() != null && m.getTeacher().getUser() != null)
                    .map(m -> {
                        try {
                            Map<String, Object> map = new HashMap<>();
                            map.put("id", m.getId());
                            map.put("classId", m.getSchoolClass().getId());
                            map.put("className", m.getSchoolClass().getName());
                            map.put("subjectId", m.getSubject().getId());
                            map.put("subjectName", m.getSubject().getName());
                            map.put("teacherId", m.getTeacher().getId());
                            map.put("teacherName", m.getTeacher().getUser().getFullName());
                            map.put("academicYear", m.getAcademicYear());
                            return map;
                        } catch (Exception e) {
                            log.error("Error mapping ClassSubjectTeacher: {}", e.getMessage());
                            return null;
                        }
                    })
                    .filter(m -> m != null)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching class-teacher mappings: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    public List<Map<String, Object>> getAllTeachers() {
        List<User> approvedTeachers = userRepository.findByRoleAndStatus(User.Role.TEACHER, User.Status.APPROVED, Pageable.unpaged()).getContent();
        
        return approvedTeachers.stream()
                .map(user -> {
                    Teacher teacher = teacherRepository.findByUserId(user.getId()).orElse(null);
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", teacher != null ? teacher.getId() : null);
                    map.put("teacherId", teacher != null ? teacher.getId() : null);
                    map.put("userId", user.getId());
                    map.put("name", user.getFullName());
                    map.put("email", user.getEmail());
                    map.put("phone", user.getPhone());
                    return map;
                })
                .filter(m -> m.get("id") != null)
                .collect(Collectors.toList());
    }

    @Transactional
    public void createClassTeacherMapping(Map<String, Object> request) {
        log.info("📝 Creating class-teacher mapping with request: {}", request);

        try {
            // Parse and validate input
            if (request.get("teacherId") == null) {
                throw new IllegalArgumentException("teacherId is required");
            }
            if (request.get("classId") == null) {
                throw new IllegalArgumentException("classId is required");
            }
            if (request.get("subjectId") == null) {
                throw new IllegalArgumentException("subjectId is required");
            }
            if (request.get("academicYear") == null) {
                throw new IllegalArgumentException("academicYear is required");
            }

            // Parse IDs with better error handling
            Long teacherId;
            Integer classId;
            Integer subjectId;
            try {
                teacherId = ((Number) request.get("teacherId")).longValue();
                classId = ((Number) request.get("classId")).intValue();
                subjectId = ((Number) request.get("subjectId")).intValue();
            } catch (ClassCastException | NumberFormatException e) {
                log.error("❌ Invalid ID format: {}", e.getMessage());
                throw new IllegalArgumentException("IDs must be numeric values: " + e.getMessage());
            }
            
            String academicYear = (String) request.get("academicYear");

            log.info("📌 Validating: teacherId={}, classId={}, subjectId={}, academicYear={}", 
                     teacherId, classId, subjectId, academicYear);

            // Fetch and validate Teacher
            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> {
                        log.error("❌ Teacher not found with ID: {}", teacherId);
                        return new ResourceNotFoundException("Teacher", teacherId);
                    });
            log.info("✓ Teacher found: {} ({})", teacher.getUser().getFullName(), teacherId);

            // Fetch and validate SchoolClass
            SchoolClass schoolClass = schoolClassRepository.findById(classId)
                    .orElseThrow(() -> {
                        log.error("❌ SchoolClass not found with ID: {}", classId);
                        return new ResourceNotFoundException("SchoolClass", classId.longValue());
                    });
            log.info("✓ SchoolClass found: {} ({})", schoolClass.getName(), classId);

            // Fetch and validate Subject
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> {
                        log.error("❌ Subject not found with ID: {}", subjectId);
                        return new ResourceNotFoundException("Subject", subjectId.longValue());
                    });
            log.info("✓ Subject found: {} ({})", subject.getName(), subjectId);

            // Create and save mapping
            ClassSubjectTeacher mapping = ClassSubjectTeacher.builder()
                    .teacher(teacher)
                    .schoolClass(schoolClass)
                    .subject(subject)
                    .academicYear(academicYear)
                    .build();

            classSubjectTeacherRepository.save(mapping);
            log.info("✅ Class-Teacher mapping created successfully: Teacher {} -> Class {}, Subject {}",
                     teacherId, classId, subjectId);
        } catch (IllegalArgumentException e) {
            log.error("❌ Validation error: {}", e.getMessage());
            throw new RuntimeException("Invalid request: " + e.getMessage());
        } catch (ResourceNotFoundException e) {
            log.error("❌ Resource not found: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ Unexpected error while creating mapping: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create mapping: " + e.getMessage());
        }
    }

    @Transactional
    public void updateClassTeacherMapping(Integer id, Map<String, Object> request) {
        log.info("📝 Updating class-teacher mapping: ID={}, request={}", id, request);

        try {
            ClassSubjectTeacher mapping = classSubjectTeacherRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Mapping", id.longValue()));

            Long teacherId = ((Number) request.get("teacherId")).longValue();
            Integer classId = ((Number) request.get("classId")).intValue();
            Integer subjectId = ((Number) request.get("subjectId")).intValue();
            String academicYear = (String) request.get("academicYear");

            // Fetch and validate Teacher
            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher", teacherId));

            // Fetch and validate SchoolClass
            SchoolClass schoolClass = schoolClassRepository.findById(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("SchoolClass", classId.longValue()));

            // Fetch and validate Subject
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Subject", subjectId.longValue()));

            mapping.setTeacher(teacher);
            mapping.setSchoolClass(schoolClass);
            mapping.setSubject(subject);
            mapping.setAcademicYear(academicYear);

            classSubjectTeacherRepository.save(mapping);
            log.info("✅ Class-Teacher mapping updated: ID {}", id);
        } catch (Exception e) {
            log.error("❌ Error updating mapping: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update mapping: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteClassTeacherMapping(Integer id) {
        if (!classSubjectTeacherRepository.existsById(id)) {
            throw new ResourceNotFoundException("Mapping", id.longValue());
        }
        classSubjectTeacherRepository.deleteById(id);
        log.info("Class-Teacher mapping deleted: ID {}", id);
    }

    @Transactional
    public void deleteUserPermanently(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        String username = user.getUsername();
        String role = user.getRole().toString();
        
        try {
            if (user.getRole() == User.Role.STUDENT) {
                deleteStudentData(user);
            } else if (user.getRole() == User.Role.TEACHER) {
                deleteTeacherData(user);
            } else if (user.getRole() == User.Role.PARENT) {
                deleteParentData(user);
            }
            
            userRepository.deleteById(userId);
            log.warn("⚠️ User deleted permanently: {} ({})", username, role);
        } catch (Exception e) {
            log.error("❌ Error deleting user {}: {}", username, e.getMessage());
            throw new RuntimeException("Failed to delete user: " + e.getMessage());
        }
    }

    @Transactional
    private void deleteStudentData(User user) {
        Student student = studentRepository.findByUserId(user.getId()).orElse(null);

        if (student != null) {
            Long studentId = student.getId();

            List<ExerciseSubmission> submissions = exerciseSubmissionRepository.findAll().stream()
                    .filter(s -> s.getStudent() != null && s.getStudent().getId().equals(studentId))
                    .toList();
            exerciseSubmissionRepository.deleteAll(submissions);

            List<QuizAttempt> attempts = quizAttemptRepository.findByStudentId(studentId);
            quizAttemptRepository.deleteAll(attempts);

            List<StudentAnswer> answers = studentAnswerRepository.findAll().stream()
                    .filter(a -> a.getAttempt() != null && a.getAttempt().getStudent() != null &&
                            a.getAttempt().getStudent().getId().equals(studentId))
                    .toList();
            studentAnswerRepository.deleteAll(answers);

            List<ConfidenceTracking> confidence = confidenceTrackingRepository.findByStudentIdOrderByRecordedAtDesc(studentId);
            confidenceTrackingRepository.deleteAll(confidence);

            List<Progress> progress = progressRepository.findByStudentId(studentId);
            progressRepository.deleteAll(progress);

            List<ParentStudentMapping> mappings = parentStudentMappingRepository.findByStudentId(studentId);
            parentStudentMappingRepository.deleteAll(mappings);

            List<Download> downloads = downloadRepository.findAll().stream()
                    .filter(d -> d.getStudent() != null && d.getStudent().getId().equals(studentId))
                    .toList();
            downloadRepository.deleteAll(downloads);


            studentRepository.delete(student);
            
            log.info("✓ Student data deleted for user: {}", user.getUsername());
        }
    }

    @Transactional
    private void deleteTeacherData(User user) {
        Teacher teacher = teacherRepository.findByUserId(user.getId()).orElse(null);

        if (teacher != null) {
            Long teacherId = teacher.getId();

            List<Video> videos = videoRepository.findAll().stream()
                    .filter(v -> v.getTeacher() != null && v.getTeacher().getId().equals(teacherId))
                    .toList();
            videoRepository.deleteAll(videos);
            
            List<Note> notes = noteRepository.findAll().stream()
                    .filter(n -> n.getTeacher() != null && n.getTeacher().getId().equals(teacherId))
                    .toList();
            noteRepository.deleteAll(notes);
            
            List<Quiz> quizzes = quizRepository.findAll().stream()
                    .filter(q -> q.getTeacher() != null && q.getTeacher().getId().equals(teacherId))
                    .toList();
            quizRepository.deleteAll(quizzes);
            
            List<PracticeExercise> exercises = exerciseRepository.findAll().stream()
                    .filter(e -> e.getTeacher() != null && e.getTeacher().getId().equals(teacherId))
                    .toList();
            exerciseRepository.deleteAll(exercises);
            
            List<ClassSubjectTeacher> mappings = classSubjectTeacherRepository.findByTeacherId(teacherId);
            classSubjectTeacherRepository.deleteAll(mappings);

            List<TeacherRemark> remarks = teacherRemarkRepository.findAll().stream()
                    .filter(r -> r.getTeacher() != null && r.getTeacher().getId().equals(teacherId))
                    .toList();
            teacherRemarkRepository.deleteAll(remarks);


            teacherRepository.delete(teacher);
            
            log.info("✓ Teacher data deleted for user: {}", user.getUsername());
        }
    }

    @Transactional
    private void deleteParentData(User user) {
        Parent parent = parentRepository.findByUserId(user.getId()).orElse(null);

        if (parent != null) {
            Long parentId = parent.getId();

            List<ParentStudentMapping> mappings = parentStudentMappingRepository.findByParentId(parentId);
            parentStudentMappingRepository.deleteAll(mappings);


            parentRepository.delete(parent);
            
            log.info("✓ Parent data deleted for user: {}", user.getUsername());
        }
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

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getClassesOverview() {
        log.info("📋 Fetching classes overview");
        try {
            return schoolClassRepository.findAll().stream()
                    .map(schoolClass -> {
                        Map<String, Object> classMap = new HashMap<>();
                        
                        // Class info
                        classMap.put("id", schoolClass.getId());
                        classMap.put("name", schoolClass.getName());
                        classMap.put("grade", schoolClass.getGrade());
                        classMap.put("section", schoolClass.getSection());
                        
                        // Count students
                        long studentCount = studentRepository.findAll().stream()
                                .filter(s -> s.getSchoolClass() != null && s.getSchoolClass().getId().equals(schoolClass.getId()))
                                .count();
                        classMap.put("studentCount", studentCount);
                        
                        // Get teachers for this class
                        List<String> teacherNames = classSubjectTeacherRepository.findAll().stream()
                                .filter(m -> m.getSchoolClass() != null && m.getSchoolClass().getId().equals(schoolClass.getId()))
                                .map(m -> m.getTeacher() != null && m.getTeacher().getUser() != null ? 
                                        m.getTeacher().getUser().getFullName() : "Unknown")
                                .distinct()
                                .toList();
                        classMap.put("teachers", teacherNames);
                        classMap.put("teacherCount", teacherNames.size());
                        
                        return classMap;
                    })
                    .sorted((a, b) -> ((Integer) a.get("grade")).compareTo((Integer) b.get("grade")))
                    .toList();
        } catch (Exception e) {
            log.error("❌ Error fetching classes overview: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentsByClass(Integer classId) {
        log.info("📚 Fetching students for class ID: {}", classId);
        try {
            SchoolClass schoolClass = schoolClassRepository.findById(classId)
                    .orElseThrow(() -> new RuntimeException("Class not found with ID: " + classId));
            
            return studentRepository.findAll().stream()
                    .filter(s -> s.getSchoolClass() != null && s.getSchoolClass().getId().equals(classId))
                    .map(student -> {
                        Map<String, Object> studentMap = new HashMap<>();
                        
                        if (student.getUser() != null) {
                            studentMap.put("id", student.getId());
                            studentMap.put("userId", student.getUser().getId());
                            studentMap.put("name", student.getUser().getFullName());
                            studentMap.put("email", student.getUser().getEmail());
                            studentMap.put("phone", student.getUser().getPhone());
                            studentMap.put("rollNumber", student.getRollNumber());
                            studentMap.put("gender", student.getGender() != null ? student.getGender().toString() : "N/A");
                            studentMap.put("status", student.getUser().getStatus().toString());
                            studentMap.put("difficultyLevel", student.getDifficultyLevel() != null ? 
                                    student.getDifficultyLevel().toString() : "MEDIUM");
                        }
                        
                        return studentMap;
                    })
                    .filter(m -> m.containsKey("id"))
                    .toList();
        } catch (Exception e) {
            log.error("❌ Error fetching students for class {}: {}", classId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTeachersByClass(Integer classId) {
        log.info("👨‍🏫 Fetching teachers for class ID: {}", classId);
        try {
            SchoolClass schoolClass = schoolClassRepository.findById(classId)
                    .orElseThrow(() -> new RuntimeException("Class not found with ID: " + classId));
            
            return classSubjectTeacherRepository.findAll().stream()
                    .filter(m -> m.getSchoolClass() != null && m.getSchoolClass().getId().equals(classId))
                    .map(mapping -> {
                        Map<String, Object> teacherMap = new HashMap<>();
                        
                        if (mapping.getTeacher() != null && mapping.getTeacher().getUser() != null) {
                            teacherMap.put("teacherId", mapping.getTeacher().getId());
                            teacherMap.put("userId", mapping.getTeacher().getUser().getId());
                            teacherMap.put("name", mapping.getTeacher().getUser().getFullName());
                            teacherMap.put("email", mapping.getTeacher().getUser().getEmail());
                            teacherMap.put("phone", mapping.getTeacher().getUser().getPhone());
                            teacherMap.put("employeeId", mapping.getTeacher().getEmployeeId());
                            teacherMap.put("qualification", mapping.getTeacher().getQualification());
                            teacherMap.put("experienceYears", mapping.getTeacher().getExperienceYrs());
                        }
                        
                        if (mapping.getSubject() != null) {
                            teacherMap.put("subject", mapping.getSubject().getName());
                            teacherMap.put("subjectCode", mapping.getSubject().getCode());
                        }
                        
                        teacherMap.put("academicYear", mapping.getAcademicYear());
                        teacherMap.put("mappingId", mapping.getId());
                        
                        return teacherMap;
                    })
                    .filter(m -> m.containsKey("teacherId"))
                    .distinct()
                    .toList();
        } catch (Exception e) {
            log.error("❌ Error fetching teachers for class {}: {}", classId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    public List<Map<String, Object>> getAllClasses() {
        log.info("📚 Fetching all classes");
        try {
            return schoolClassRepository.findAll().stream()
                    .map(cls -> {
                        Map<String, Object> classMap = new HashMap<>();
                        classMap.put("id", cls.getId());
                        classMap.put("name", cls.getName());
                        classMap.put("grade", cls.getGrade());
                        classMap.put("section", cls.getSection());
                        return classMap;
                    })
                    .sorted((a, b) -> ((Integer) a.get("grade")).compareTo((Integer) b.get("grade")))
                    .toList();
        } catch (Exception e) {
            log.error("❌ Error fetching classes: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllStudentsWithoutClass() {
        log.info("📝 Fetching students without class");
        try {
            return studentRepository.findAll().stream()
                    .filter(s -> s.getSchoolClass() == null)
                    .map(student -> {
                        Map<String, Object> studentMap = new HashMap<>();
                        studentMap.put("id", student.getId());
                        studentMap.put("userId", student.getUser().getId());
                        studentMap.put("name", student.getUser().getFullName());
                        studentMap.put("email", student.getUser().getEmail());
                        studentMap.put("rollNumber", student.getRollNumber() != null ? student.getRollNumber() : "");
                        return studentMap;
                    })
                    .toList();
        } catch (Exception e) {
            log.error("❌ Error fetching unassigned students: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Transactional
    public void assignStudentToClass(Long studentId, Integer classId) {
        log.info("🎓 Assigning student {} to class {}", studentId, classId);
        try {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
            
            SchoolClass schoolClass = schoolClassRepository.findById(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("Class", classId.longValue()));
            
            student.setSchoolClass(schoolClass);
            studentRepository.save(student);
            
            log.info("✅ Student {} assigned to class {} successfully", 
                    student.getUser().getFullName(), schoolClass.getName());
        } catch (Exception e) {
            log.error("❌ Error assigning student to class: {}", e.getMessage());
            throw new RuntimeException("Failed to assign student to class: " + e.getMessage());
        }
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

