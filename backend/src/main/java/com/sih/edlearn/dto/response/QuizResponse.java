package com.sih.edlearn.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizResponse {
    private Long              id;
    private String            title;
    private String            description;
    private String            quizType;
    private String            difficulty;
    private Integer           totalMarks;
    private Integer           passMarks;
    private Integer           timeLimitMins;
    private Boolean           isVoiceEnabled;
    private String            subjectName;
    private String            chapterTitle;
    private LocalDateTime     createdAt;
    private List<QuestionResponse> questions;
}

