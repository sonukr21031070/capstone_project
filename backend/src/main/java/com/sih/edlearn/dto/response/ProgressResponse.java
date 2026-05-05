package com.sih.edlearn.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProgressResponse {
    private Long       id;
    private String     subjectName;
    private String     chapterTitle;
    private Integer    notesRead;
    private Integer    videosWatched;
    private Integer    quizzesTaken;
    private BigDecimal avgScore;
    private Integer    timeSpentMins;
    private Boolean    isChapterComplete;
}

