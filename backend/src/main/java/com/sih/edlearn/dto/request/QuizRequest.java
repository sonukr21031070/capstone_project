package com.sih.edlearn.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Class ID is required")
    private Integer classId;

    @NotNull(message = "Subject ID is required")
    private Integer subjectId;

    @NotNull(message = "Chapter ID is required")
    private Integer chapterId;

    @Pattern(regexp = "MCQ|SUBJECTIVE|MIXED", message = "Quiz type must be MCQ, SUBJECTIVE, or MIXED")
    private String quizType = "MCQ";

    @Pattern(regexp = "EASY|MEDIUM|HARD", message = "Difficulty must be EASY, MEDIUM, or HARD")
    private String difficulty = "MEDIUM";

    @NotNull(message = "Total marks is required")
    @Min(value = 1, message = "Total marks must be at least 1")
    private Integer totalMarks;

    @NotNull(message = "Pass marks is required")
    private Integer passMarks;

    @Min(value = 1, message = "Time limit must be at least 1 minute")
    private Integer timeLimitMins = 30;

    private Boolean isVoiceEnabled = true;
    private Boolean isPublished = false;

    @NotEmpty(message = "At least one question is required")
    @Valid
    private List<QuestionRequest> questions;
}

