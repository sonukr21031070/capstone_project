package com.sih.edlearn.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Announcement {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "title_hindi", length = 255)
    private String titleHindi;

    @Column(name = "title_punjabi", length = 255)
    private String titlePunjabi;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "content_hindi", columnDefinition = "TEXT")
    private String contentHindi;

    @Column(name = "content_punjabi", columnDefinition = "TEXT")
    private String contentPunjabi;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_role", nullable = false)
    private TargetRole targetRole = TargetRole.ALL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_class_id")
    private SchoolClass targetClass;

    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "publish_date")
    private LocalDateTime publishDate = LocalDateTime.now();

    @Column(name = "expire_date")
    private LocalDateTime expireDate;

    public enum TargetRole { ALL, STUDENT, TEACHER, PARENT }
    public enum Priority { LOW, MEDIUM, HIGH }
}

