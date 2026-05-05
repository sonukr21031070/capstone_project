package com.sih.edlearn.dto.request;

import com.sih.edlearn.entity.User;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3-50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;

    @NotNull(message = "Role is required")
    private User.Role role;

    private User.Language language = User.Language.HINDI;

    // Student-specific
    private Integer classId;
    private String  rollNumber;

    // Teacher-specific
    private String employeeId;
    private String qualification;
    private Integer experienceYrs;

    // Parent-specific
    private Long studentId; // for linking parent to child
}

