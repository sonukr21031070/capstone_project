package com.sih.edlearn.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Entity to track student exercise submissions
 */
@Entity
@Table(name = "exercise_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private PracticeExercise exercise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "submission_files", columnDefinition = "JSON")
    private String submissionFiles;  // JSON array of file paths

    @Column(name = "student_notes", columnDefinition = "TEXT")
    private String studentNotes;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    private LocalDateTime resubmittedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status;  // DRAFT, SUBMITTED, GRADED, LATE

    private Double score;

    private Integer totalMarks;

    @Column(columnDefinition = "TEXT")
    private String teacherFeedback;

    @Column(columnDefinition = "TEXT")
    private String graderNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by")
    private Teacher gradedBy;

    private LocalDateTime gradedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /**
     * Submission status enumeration
     */
    public enum SubmissionStatus {
        DRAFT,       // Saved but not submitted
        SUBMITTED,   // Submitted on time
        GRADED,      // Graded by teacher
        LATE         // Submitted after due date
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = SubmissionStatus.DRAFT;
        }
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Check if submission is late
     */
    public boolean isLate() {
        return status == SubmissionStatus.LATE;
    }

    /**
     * Get files as list (deserialize from JSON)
     */
    public List<String> getSubmissionFilesList() {
        // TODO: Implement JSON deserialization
        return new ArrayList<>();
    }
}

