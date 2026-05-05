package com.sih.edlearn.dto.response;

import com.sih.edlearn.entity.User;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserSummaryResponse {
    private Long           id;
    private String         username;
    private String         email;
    private String         fullName;
    private String         phone;
    private User.Role      role;
    private User.Status    status;
    private User.Language  language;
    private LocalDateTime  createdAt;
}

