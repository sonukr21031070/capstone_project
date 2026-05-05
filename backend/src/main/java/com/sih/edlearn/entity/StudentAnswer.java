package com.sih.edlearn.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "student_answers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentAnswer {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(columnDefinition = "TEXT")
    private String answerText;

    @Column(name = "is_voice_answer")
    private Boolean isVoiceAnswer = false;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "marks_obtained", precision = 4, scale = 2)
    private BigDecimal marksObtained = BigDecimal.ZERO;
}

