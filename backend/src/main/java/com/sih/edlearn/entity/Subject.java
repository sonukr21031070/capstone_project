package com.sih.edlearn.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subjects")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Subject {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "name_hindi", length = 100)
    private String nameHindi;

    @Column(name = "name_punjabi", length = 100)
    private String namePunjabi;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(length = 50)
    private String icon;

    @Column(length = 20)
    private String color;
}

