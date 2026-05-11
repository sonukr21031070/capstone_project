package com.sih.edlearn.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementResponse {

    private Long id;

    private String title;
    private String titleHindi;
    private String titlePunjabi;

    private String content;
    private String contentHindi;
    private String contentPunjabi;

    private String targetRole;

    private Integer targetClassId;
    private String targetClassName;

    private String priority;

    private Boolean isActive;

    private LocalDateTime publishDate;
    private LocalDateTime expireDate;

    private Long createdById;
    private String createdByName;
}