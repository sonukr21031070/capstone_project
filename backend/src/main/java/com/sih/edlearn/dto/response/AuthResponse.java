package com.sih.edlearn.dto.response;

import com.sih.edlearn.entity.User;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String      token;
    private String      username;
    private String      fullName;
    private User.Role   role;
    private String      language;
    private Long        profileId;
}

