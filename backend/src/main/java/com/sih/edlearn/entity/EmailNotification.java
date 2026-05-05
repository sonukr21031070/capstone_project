package com.sih.edlearn.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity to track email notifications sent to users
 */
@Entity
@Table(name = "email_notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipientEmail;

    @Column(nullable = false)
    private String recipientName;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    private String failureReason;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime sentAt;

    private LocalDateTime readAt;

    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    @Column(name = "related_entity_type")
    private String relatedEntityType;

    /**
     * Email notification types
     */
    public enum NotificationType {
        WELCOME,
        ACCOUNT_APPROVED,
        ACCOUNT_REJECTED,
        ACCOUNT_SUSPENDED,
        PASSWORD_RESET,
        ANNOUNCEMENT,
        QUIZ_SCORE,
        TEACHER_FEEDBACK,
        VIDEO_PUBLISHED,
        PROGRESS_REPORT,
        ASSIGNMENT_SUBMISSION,
        CLASS_SCHEDULED,
        DEADLINE_REMINDER
    }

    /**
     * Email status
     */
    public enum Status {
        PENDING,
        SENT,
        FAILED,
        BOUNCED
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = Status.PENDING;
        }
    }
}

