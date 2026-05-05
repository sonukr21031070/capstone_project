package com.sih.edlearn.service;

import com.sih.edlearn.entity.Student;
import com.sih.edlearn.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Rule-based adaptive difficulty system (no AI required):
 * - Score < 40%  → Easy
 * - Score 40-70% → Medium
 * - Score > 70%  → Hard
 */
@Service
@RequiredArgsConstructor
public class AdaptiveLearningService {

    private final StudentRepository     studentRepository;
    private final QuizAttemptRepository attemptRepository;
    private final ProgressRepository    progressRepository;

    @Transactional
    public Student.DifficultyLevel computeAndUpdateDifficulty(Long studentId) {
        List<com.sih.edlearn.entity.Progress> progressList =
                progressRepository.findByStudentId(studentId);

        if (progressList.isEmpty()) return Student.DifficultyLevel.MEDIUM;

        double avgScore = progressList.stream()
                .map(p -> p.getAvgScore() != null ? p.getAvgScore().doubleValue() : 50.0)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(50.0);

        Student.DifficultyLevel newLevel = avgScore < 40
                ? Student.DifficultyLevel.EASY
                : avgScore <= 70
                    ? Student.DifficultyLevel.MEDIUM
                    : Student.DifficultyLevel.HARD;

        studentRepository.findById(studentId).ifPresent(student -> {
            student.setDifficultyLevel(newLevel);
            studentRepository.save(student);
        });

        return newLevel;
    }

    /**
     * Confidence meter: LOW → revision, MEDIUM → continue, HIGH → challenge
     */
    public String getRecommendation(String confidenceLevel, double lastScore) {
        return switch (confidenceLevel.toUpperCase()) {
            case "LOW"  -> "REVISION";
            case "HIGH" -> lastScore > 70 ? "CHALLENGE" : "CONTINUE";
            default     -> "CONTINUE";
        };
    }
}

