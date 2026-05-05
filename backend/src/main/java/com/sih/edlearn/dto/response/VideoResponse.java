package com.sih.edlearn.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VideoResponse {
    private Long          id;
    private String        title;
    private String        description;
    private String        videoPath;
    private String        thumbnailPath;
    private String        audioPath;
    private String        transcript;
    private Integer       durationSecs;
    private Boolean       hasSubtitles;
    private String        subjectName;
    private String        chapterTitle;
    private LocalDateTime createdAt;
}

