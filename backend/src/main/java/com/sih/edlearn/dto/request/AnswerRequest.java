package com.sih.edlearn.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnswerRequest {
    private Long questionId;
    private String answerText;
    private Boolean isVoiceAnswer = false;
}

