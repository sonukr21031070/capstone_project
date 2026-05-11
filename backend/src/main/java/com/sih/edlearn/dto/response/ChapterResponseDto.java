package com.sih.edlearn.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChapterResponseDto {
    private Integer id;

    @JsonProperty("name")
    private String title;

    private Integer chapterNumber;
}

