package com.sih.edlearn.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parent_student_mapping")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ParentStudentMapping {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", nullable = false)
    private Parent parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Relation relation = Relation.GUARDIAN;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    public enum Relation { FATHER, MOTHER, GUARDIAN }
}

