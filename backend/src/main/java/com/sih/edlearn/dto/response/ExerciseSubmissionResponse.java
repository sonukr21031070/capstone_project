package com.sih.edlearn.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for exercise submission
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseSubmissionResponse {

    private Long id;

    private Long exerciseId;

    private String exerciseTitle;

    private Long studentId;

    private String studentName;

    private List<String> submissionFiles;

    private String studentNotes;

    private String submissionStatus;  // DRAFT, SUBMITTED, GRADED, LATE

    private LocalDateTime submittedAt;

    private LocalDateTime resubmittedAt;

    private Double score;

    private Integer totalMarks;

    private String teacherFeedback;

    private String graderNotes;

    private String gradedByTeacher;

    private LocalDateTime gradedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /**
     * Calculate submission grade percentage
     */
    public Double getPercentage() {
        if (score != null && totalMarks != null && totalMarks > 0) {
            return (score / totalMarks) * 100;
        }
        return null;
    }

    /**
     * Check if submission is late
     */
    public Boolean getIsLate() {
        return "LATE".equals(submissionStatus);
    }
}

