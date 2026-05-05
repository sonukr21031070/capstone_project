package com.sih.edlearn.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionRequest {

    @NotBlank(message = "Question text is required")
    private String questionText;

    private String questionHindi;
    private String questionPunjabi;

    @Pattern(regexp = "MCQ|SUBJECTIVE|TRUE_FALSE", message = "Question type must be MCQ, SUBJECTIVE, or TRUE_FALSE")
    private String questionType = "MCQ";

    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    @NotBlank(message = "Correct answer is required")
    private String correctAnswer;

    @Min(value = 1, message = "Marks must be at least 1")
    private Integer marks = 1;

    @Min(value = 0, message = "Order index cannot be negative")
    private Integer orderIndex = 0;
}

