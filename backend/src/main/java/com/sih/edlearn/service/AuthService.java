package com.sih.edlearn.service;

import com.sih.edlearn.dto.request.*;
import com.sih.edlearn.dto.response.AuthResponse;
import com.sih.edlearn.entity.*;
import com.sih.edlearn.exception.*;
import com.sih.edlearn.repository.*;
import com.sih.edlearn.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository        userRepository;
    private final StudentRepository     studentRepository;
    private final TeacherRepository     teacherRepository;
    private final ParentRepository      parentRepository;
    private final SchoolClassRepository classRepository;
    private final AuthenticationManager authManager;
    private final PasswordEncoder       passwordEncoder;
    private final JwtUtil               jwtUtil;
    private final EmailService          emailService;
    private final EmailNotificationRepository emailNotificationRepository;

    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(request.getRole())
                .status(User.Status.PENDING)
                .language(request.getLanguage() != null ? request.getLanguage() : User.Language.HINDI)
                .build();

        user = userRepository.save(user);

        // Create role-specific profile
        switch (request.getRole()) {
            case STUDENT -> createStudentProfile(user, request);
            case TEACHER -> createTeacherProfile(user, request);
            case PARENT  -> createParentProfile(user, request);
            case ADMIN   -> {} // Admin created directly via DB
        }

        // Send welcome email
        sendWelcomeEmail(user);

        log.info("New {} registered: {} (status: PENDING)", request.getRole(), request.getUsername());
        return "Registration successful! Confirmation email sent. Please wait for admin approval.";
    }

    private void createStudentProfile(User user, RegisterRequest req) {
        SchoolClass cls = classRepository.findById(req.getClassId())
                .orElseThrow(() -> new BadRequestException("Invalid class selected"));
        Student student = Student.builder()
                .user(user)
                .schoolClass(cls)
                .rollNumber(req.getRollNumber())
                .difficultyLevel(Student.DifficultyLevel.MEDIUM)
                .build();
        studentRepository.save(student);
    }

    private void createTeacherProfile(User user, RegisterRequest req) {
        if (req.getEmployeeId() != null && teacherRepository.existsByEmployeeId(req.getEmployeeId())) {
            throw new BadRequestException("Employee ID already registered");
        }
        Teacher teacher = Teacher.builder()
                .user(user)
                .employeeId(req.getEmployeeId())
                .qualification(req.getQualification())
                .experienceYrs(req.getExperienceYrs() != null ? req.getExperienceYrs() : 0)
                .build();
        teacherRepository.save(teacher);
    }

    private void createParentProfile(User user, RegisterRequest req) {
        Parent parent = Parent.builder().user(user).build();
        parentRepository.save(parent);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", 0L));

        // Check if user is approved
        if (user.getStatus() == User.Status.PENDING) {
            throw new BadRequestException("Your account is waiting for admin approval. Please check back later.");
        }
        if (user.getStatus() == User.Status.REJECTED) {
            throw new BadRequestException("Your account registration was rejected. Please contact the administrator.");
        }
        if (user.getStatus() == User.Status.SUSPENDED) {
            throw new BadRequestException("Your account has been suspended. Please contact the administrator.");
        }

        Long profileId = switch (user.getRole()) {
            case STUDENT -> studentRepository.findByUserId(user.getId())
                    .map(Student::getId).orElse(null);
            case TEACHER -> teacherRepository.findByUserId(user.getId())
                    .map(Teacher::getId).orElse(null);
            case PARENT  -> parentRepository.findByUserId(user.getId())
                    .map(Parent::getId).orElse(null);
            case ADMIN   -> user.getId();
        };

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .language(user.getLanguage().name())
                .profileId(profileId)
                .build();
    }

    // ===== EMAIL METHODS =====

    private void sendWelcomeEmail(User user) {
        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getFullName(), user.getRole().toString());

            // Log the email notification
            EmailNotification notification = EmailNotification.builder()
                    .recipientEmail(user.getEmail())
                    .recipientName(user.getFullName())
                    .subject("Welcome to EdLearn")
                    .type(EmailNotification.NotificationType.WELCOME)
                    .status(EmailNotification.Status.SENT)
                    .relatedEntityId(user.getId())
                    .relatedEntityType("User")
                    .build();
            emailNotificationRepository.save(notification);
        } catch (Exception e) {
            log.warn("Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    // ===== EMAIL NOTIFICATION HELPERS =====

    /**
     * Send and log account approval email.
     */
    public void sendAccountApprovedEmail(User user) {
        try {
            emailService.sendAccountApprovedEmail(user.getEmail(), user.getFullName());
            EmailNotification notification = EmailNotification.builder()
                    .recipientEmail(user.getEmail())
                    .recipientName(user.getFullName())
                    .subject("Your EdLearn Account Approved")
                    .type(EmailNotification.NotificationType.ACCOUNT_APPROVED)
                    .status(EmailNotification.Status.SENT)
                    .relatedEntityId(user.getId())
                    .relatedEntityType("User")
                    .build();
            emailNotificationRepository.save(notification);
        } catch (Exception e) {
            log.warn("Failed to send account approval email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    /**
     * Send and log account rejection email.
     */
    public void sendAccountRejectedEmail(User user, String reason) {
        try {
            emailService.sendAccountRejectedEmail(user.getEmail(), user.getFullName(), reason);
            EmailNotification notification = EmailNotification.builder()
                    .recipientEmail(user.getEmail())
                    .recipientName(user.getFullName())
                    .subject("Your EdLearn Account Rejected")
                    .type(EmailNotification.NotificationType.ACCOUNT_REJECTED)
                    .status(EmailNotification.Status.SENT)
                    .relatedEntityId(user.getId())
                    .relatedEntityType("User")
                    .build();
            emailNotificationRepository.save(notification);
        } catch (Exception e) {
            log.warn("Failed to send account rejection email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    /**
     * Send and log account suspension email.
     */
    public void sendAccountSuspendedEmail(User user, String reason) {
        try {
            emailService.sendAccountSuspendedEmail(user.getEmail(), user.getFullName(), reason);
            EmailNotification notification = EmailNotification.builder()
                    .recipientEmail(user.getEmail())
                    .recipientName(user.getFullName())
                    .subject("Your EdLearn Account Suspended")
                    .type(EmailNotification.NotificationType.ACCOUNT_SUSPENDED)
                    .status(EmailNotification.Status.SENT)
                    .relatedEntityId(user.getId())
                    .relatedEntityType("User")
                    .build();
            emailNotificationRepository.save(notification);
        } catch (Exception e) {
            log.warn("Failed to send account suspension email to {}: {}", user.getEmail(), e.getMessage());
        }
    }
}
