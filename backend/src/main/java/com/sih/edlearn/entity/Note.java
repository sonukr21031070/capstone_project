package com.sih.edlearn.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Note {

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

    @Column(name = "title_hindi", length = 255)
    private String titleHindi;

    @Column(name = "title_punjabi", length = 255)
    private String titlePunjabi;

    @Column(name = "content_text", columnDefinition = "LONGTEXT")
    private String contentText;

    @Column(name = "content_hindi", columnDefinition = "LONGTEXT")
    private String contentHindi;

    @Column(name = "content_punjabi", columnDefinition = "LONGTEXT")
    private String contentPunjabi;

    @Column(name = "pdf_path")
    private String pdfPath;

    @Enumerated(EnumType.STRING)
    @Column(name = "note_type", nullable = false)
    private NoteType noteType = NoteType.TEXT;

    @Enumerated(EnumType.STRING)
    private Language language = Language.HINDI;

    @Column(name = "is_voice_enabled")
    private Boolean isVoiceEnabled = true;

    @Column(name = "is_downloadable")
    private Boolean isDownloadable = true;

    @Enumerated(EnumType.STRING)
    private Status status = Status.DRAFT;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum NoteType { TEXT, PDF, BOTH }
    public enum Language { HINDI, PUNJABI, ENGLISH, MULTILINGUAL }
    public enum Status { DRAFT, PUBLISHED }
}

