package com.sih.edlearn.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExerciseRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Exercise content is required")
    private String exerciseContent;

    @NotNull(message = "Class ID is required")
    private Integer classId;

    @NotNull(message = "Subject ID is required")
    private Integer subjectId;

    @NotNull(message = "Chapter ID is required")
    private Integer chapterId;

    private Boolean isVoiceEnabled = true;

    private String dueDate;
}

