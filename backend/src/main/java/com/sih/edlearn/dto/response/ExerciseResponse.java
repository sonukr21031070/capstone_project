package com.sih.edlearn.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for exercise details
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseResponse {

    private Long id;

    private String title;

    private String description;

    private String exerciseContent;

    private Boolean isVoiceEnabled;

    private LocalDate dueDate;

    private String status;  // DRAFT, PUBLISHED

    private String teacherName;

    private String subjectName;

    private String chapterTitle;

    private LocalDateTime createdAt;

    /**
     * Submission status for this student (if applicable)
     * PENDING, SUBMITTED, GRADED, LATE
     */
    private String submissionStatus;

    /**
     * Score if already submitted and graded
     */
    private Double score;

    private Integer totalMarks;

    /**
     * Teacher feedback if graded
     */
    private String teacherFeedback;

    /**
     * Grade percentage if graded
     */
    private Double percentage;

    /**
     * Calculate percentage
     */
    public Double getPercentage() {
        if (score != null && totalMarks != null && totalMarks > 0) {
            return (score / totalMarks) * 100;
        }
        return null;
    }

    /**
     * Check if deadline has passed
     */
    public Boolean getIsOverdue() {
        if (dueDate != null) {
            return LocalDate.now().isAfter(dueDate);
        }
        return false;
    }
}

