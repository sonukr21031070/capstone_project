package com.sih.edlearn.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NoteResponse {
    private Long          id;
    private String        title;
    private String        titleHindi;
    private String        titlePunjabi;
    private String        contentText;
    private String        contentHindi;
    private String        contentPunjabi;
    private String        pdfPath;
    private String        noteType;
    private String        language;
    private Boolean       isVoiceEnabled;
    private Boolean       isDownloadable;
    private String        status;
    private String        teacherName;
    private String        subjectName;
    private String        chapterTitle;
    private LocalDateTime createdAt;
}

