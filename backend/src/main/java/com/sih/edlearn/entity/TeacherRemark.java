package com.sih.edlearn.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "teacher_remarks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TeacherRemark {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String remarkText;

    @Enumerated(EnumType.STRING)
    @Column(name = "remark_type")
    private RemarkType remarkType = RemarkType.GENERAL;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum RemarkType { ACADEMIC, BEHAVIOR, ATTENDANCE, GENERAL }
}

