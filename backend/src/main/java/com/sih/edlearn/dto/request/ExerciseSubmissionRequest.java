package com.sih.edlearn.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;

/**
 * Request DTO for submitting exercise
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseSubmissionRequest {

    @NotNull(message = "Exercise ID is required")
    private Long exerciseId;

    // Files are uploaded via multipart/form-data
    // studentNotes is optional
    private String studentNotes;
}

