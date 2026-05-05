package com.sih.edlearn.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "downloads")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Download {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    private ContentType contentType;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    @Column(name = "downloaded_at")
    private LocalDateTime downloadedAt = LocalDateTime.now();

    public enum ContentType { NOTE, VIDEO, EXERCISE }
}

