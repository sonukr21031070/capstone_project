-- ============================================================
-- MIGRATION: Add Email Notifications and Exercise Submissions Tables
-- Run this script on an existing edlearn_db to add missing tables
-- ============================================================

USE edlearn_db;

-- ─────────────────────────────────────────
-- EMAIL NOTIFICATIONS TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_notifications (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_email     VARCHAR(100) NOT NULL,
    recipient_name      VARCHAR(100) NOT NULL,
    subject             VARCHAR(255) NOT NULL,
    content             LONGTEXT,
    type                ENUM('WELCOME','ACCOUNT_APPROVED','ACCOUNT_REJECTED','ACCOUNT_SUSPENDED','PASSWORD_RESET','ANNOUNCEMENT','QUIZ_SCORE','TEACHER_FEEDBACK','VIDEO_PUBLISHED','PROGRESS_REPORT','ASSIGNMENT_SUBMISSION','CLASS_SCHEDULED','DEADLINE_REMINDER') NOT NULL,
    status              ENUM('PENDING','SENT','FAILED','BOUNCED') NOT NULL,
    failure_reason      TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at             TIMESTAMP NULL,
    read_at             TIMESTAMP NULL,
    related_entity_id   BIGINT,
    related_entity_type VARCHAR(50),
    INDEX idx_email_status (recipient_email, status),
    INDEX idx_type_status (type, status),
    INDEX idx_created_at (created_at)
);

-- ─────────────────────────────────────────
-- EXERCISE SUBMISSIONS TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exercise_submissions (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    exercise_id         BIGINT NOT NULL,
    student_id          BIGINT NOT NULL,
    submission_files    LONGTEXT,  -- JSON array of filenames/paths
    student_notes       TEXT,
    status              ENUM('DRAFT','SUBMITTED','GRADED','LATE') NOT NULL DEFAULT 'DRAFT',
    score               DECIMAL(5,2),
    total_marks         INT,
    teacher_feedback    LONGTEXT,
    grader_notes        TEXT,
    graded_by           BIGINT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at        TIMESTAMP NULL,
    resubmitted_at      TIMESTAMP NULL,
    graded_at           TIMESTAMP NULL,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exercise_id)  REFERENCES practice_exercises(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id)   REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by)    REFERENCES teachers(id) ON DELETE SET NULL,
    UNIQUE KEY unique_submission (exercise_id, student_id),
    INDEX idx_student_status (student_id, status),
    INDEX idx_exercise_status (exercise_id, status),
    INDEX idx_submitted_at (submitted_at)
);

-- ============================================================
-- Verification: Show table status
-- ============================================================
SELECT TABLE_NAME, TABLE_TYPE, ENGINE, TABLE_ROWS
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'edlearn_db'
  AND TABLE_NAME IN ('email_notifications', 'exercise_submissions')
ORDER BY TABLE_NAME;

