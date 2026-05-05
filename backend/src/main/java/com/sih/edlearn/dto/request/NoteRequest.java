package com.sih.edlearn.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NoteRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String titleHindi;
    private String titlePunjabi;

    @NotBlank(message = "Content is required")
    private String contentText;

    private String contentHindi;
    private String contentPunjabi;

    @NotNull(message = "Class ID is required")
    private Integer classId;

    @NotNull(message = "Subject ID is required")
    private Integer subjectId;

    @NotNull(message = "Chapter ID is required")
    private Integer chapterId;

    private String language = "HINDI";
    private Boolean isVoiceEnabled = true;
    private Boolean isDownloadable = true;

    @Pattern(regexp = "DRAFT|PUBLISHED", message = "Status must be DRAFT or PUBLISHED")
    private String status = "DRAFT";
}

