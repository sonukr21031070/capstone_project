package com.sih.edlearn.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "progress")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Progress {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    @Column(name = "notes_read")
    private Integer notesRead = 0;

    @Column(name = "videos_watched")
    private Integer videosWatched = 0;

    @Column(name = "quizzes_taken")
    private Integer quizzesTaken = 0;

    @Column(name = "avg_score", precision = 5, scale = 2)
    private BigDecimal avgScore = BigDecimal.ZERO;

    @Column(name = "time_spent_mins")
    private Integer timeSpentMins = 0;

    @Column(name = "is_chapter_complete")
    private Boolean isChapterComplete = false;

    @Column(name = "last_activity")
    private LocalDateTime lastActivity = LocalDateTime.now();
}

