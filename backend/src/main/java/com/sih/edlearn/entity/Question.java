package com.sih.edlearn.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Question {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Column(name = "question_hindi", columnDefinition = "TEXT")
    private String questionHindi;

    @Column(name = "question_punjabi", columnDefinition = "TEXT")
    private String questionPunjabi;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType;

    @Column(name = "option_a", length = 500)
    private String optionA;

    @Column(name = "option_b", length = 500)
    private String optionB;

    @Column(name = "option_c", length = 500)
    private String optionC;

    @Column(name = "option_d", length = 500)
    private String optionD;

    @Column(name = "correct_answer", length = 10)
    private String correctAnswer;

    @Column(nullable = false)
    private Integer marks = 1;

    @Column(name = "order_index")
    private Integer orderIndex = 0;

    public enum QuestionType { MCQ, SUBJECTIVE, TRUE_FALSE }
}

