package com.sih.edlearn.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnnouncementRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String titleHindi;
    private String titlePunjabi;

    @NotBlank(message = "Content is required")
    private String content;

    private String contentHindi;
    private String contentPunjabi;

    @Pattern(regexp = "ALL|STUDENT|TEACHER|PARENT", message = "Target role must be ALL, STUDENT, TEACHER, or PARENT")
    private String targetRole = "ALL";

    private Integer targetClassId;

    @Pattern(regexp = "LOW|MEDIUM|HIGH", message = "Priority must be LOW, MEDIUM, or HIGH")
    private String priority = "MEDIUM";

    private String expireDate;
}

