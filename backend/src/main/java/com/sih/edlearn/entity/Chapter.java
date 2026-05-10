package com.sih.edlearn.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Entity
@Table(name = "chapters")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Chapter {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "title_hindi", length = 200)
    private String titleHindi;

    @Column(name = "title_punjabi", length = 200)
    private String titlePunjabi;

    @Column(name = "chapter_number", nullable = false)
    private Integer chapterNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Transient
    @JsonProperty("name")
    public String getName() {
        return title;
    }
}

