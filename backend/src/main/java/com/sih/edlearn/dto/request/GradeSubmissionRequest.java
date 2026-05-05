package com.sih.edlearn.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;

/**
 * Request DTO for grading exercise submission
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeSubmissionRequest {

    @NotNull(message = "Score is required")
    @Min(0)
    private Double score;

    @NotNull(message = "Total marks is required")
    @Min(1)
    private Integer totalMarks;

    @NotBlank(message = "Feedback is required")
    private String feedback;

    private String graderNotes;
}

