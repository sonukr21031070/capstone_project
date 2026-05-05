package com.sih.edlearn.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "videos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Video {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "video_path")
    private String videoPath;

    @Column(name = "thumbnail_path")
    private String thumbnailPath;

    @Column(name = "audio_path")
    private String audioPath;

    @Column(columnDefinition = "LONGTEXT")
    private String transcript;

    @Column(name = "transcript_hindi", columnDefinition = "LONGTEXT")
    private String transcriptHindi;

    @Column(name = "duration_secs")
    private Integer durationSecs = 0;

    @Column(name = "file_size_mb", precision = 8, scale = 2)
    private java.math.BigDecimal fileSizeMb;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Quality quality = Quality.MEDIUM;

    @Column(name = "has_subtitles")
    private Boolean hasSubtitles = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.DRAFT;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Quality { LOW, MEDIUM, HIGH }
    public enum Status { DRAFT, PUBLISHED }
}

