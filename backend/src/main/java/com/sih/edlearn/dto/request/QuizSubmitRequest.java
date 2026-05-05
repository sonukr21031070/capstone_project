package com.sih.edlearn.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizSubmitRequest {

    @NotEmpty(message = "At least one answer is required")
    @Valid
    private List<AnswerRequest> answers;

    private Boolean isOffline = false;
}

