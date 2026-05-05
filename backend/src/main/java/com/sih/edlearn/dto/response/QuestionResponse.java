package com.sih.edlearn.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionResponse {
    private Long   id;
    private String questionText;
    private String questionHindi;
    private String questionPunjabi;
    private String questionType;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private Integer marks;
    private Integer orderIndex;
    // Note: correctAnswer NOT exposed to students
}

