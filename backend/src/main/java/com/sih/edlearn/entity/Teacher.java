package com.sih.edlearn.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "teachers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Teacher {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "employee_id", unique = true, length = 30)
    private String employeeId;

    @Column(length = 100)
    private String qualification;

    @Column(name = "experience_yrs")
    private Integer experienceYrs = 0;

    @Column(name = "profile_photo")
    private String profilePhoto;
}

