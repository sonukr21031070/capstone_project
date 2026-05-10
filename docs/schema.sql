-- ============================================================
-- SIH25019: Digital Learning Platform for Rural Students
-- MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS edlearn_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edlearn_db;

-- ─────────────────────────────────────────
-- USERS (base table for all roles)
-- ─────────────────────────────────────────
CREATE TABLE users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(100) NOT NULL,
    phone       VARCHAR(15),
    role        ENUM('STUDENT','TEACHER','PARENT','ADMIN') NOT NULL,
    status      ENUM('PENDING','APPROVED','REJECTED','SUSPENDED') NOT NULL DEFAULT 'PENDING',
    language    ENUM('HINDI','PUNJABI','ENGLISH') NOT NULL DEFAULT 'HINDI',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- ─────────────────────────────────────────
-- CLASSES
-- ─────────────────────────────────────────
CREATE TABLE classes (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(20) NOT NULL,  -- e.g. "Class 1", "Class 8"
    grade      INT NOT NULL,          -- 1-8
    section    VARCHAR(5)             -- e.g. "A", "B"
);

INSERT INTO classes (name, grade, section) VALUES
('Class 1A', 1, 'A'), ('Class 1B', 1, 'B'),
('Class 2A', 2, 'A'), ('Class 2B', 2, 'B'),
('Class 3A', 3, 'A'), ('Class 4A', 4, 'A'),
('Class 5A', 5, 'A'), ('Class 6A', 6, 'A'),
('Class 7A', 7, 'A'), ('Class 8A', 8, 'A');

-- ─────────────────────────────────────────
-- STUDENTS
-- ─────────────────────────────────────────
CREATE TABLE students (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE,
    class_id        INT NOT NULL,
    roll_number     VARCHAR(20),
    date_of_birth   DATE,
    gender          ENUM('MALE','FEMALE','OTHER'),
    address         TEXT,
    profile_photo   VARCHAR(255),
    difficulty_level ENUM('EASY','MEDIUM','HARD') NOT NULL DEFAULT 'MEDIUM',
    FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- ─────────────────────────────────────────
-- TEACHERS
-- ─────────────────────────────────────────
CREATE TABLE teachers (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE,
    employee_id     VARCHAR(30) UNIQUE,
    qualification   VARCHAR(100),
    experience_yrs  INT DEFAULT 0,
    profile_photo   VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- PARENTS
-- ─────────────────────────────────────────
CREATE TABLE parents (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT NOT NULL UNIQUE,
    occupation   VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- PARENT-STUDENT MAPPING
-- ─────────────────────────────────────────
CREATE TABLE parent_student_mapping (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_id   BIGINT NOT NULL,
    student_id  BIGINT NOT NULL,
    relation    ENUM('FATHER','MOTHER','GUARDIAN') NOT NULL DEFAULT 'GUARDIAN',
    is_primary  BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (parent_id)  REFERENCES parents(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_mapping (parent_id, student_id)
);

-- ─────────────────────────────────────────
-- SUBJECTS
-- ─────────────────────────────────────────
CREATE TABLE subjects (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    name_hindi  VARCHAR(100),
    name_punjabi VARCHAR(100),
    code        VARCHAR(20) NOT NULL UNIQUE,
    icon        VARCHAR(50),
    color       VARCHAR(20)
);

INSERT INTO subjects (name, name_hindi, name_punjabi, code, icon) VALUES
('Mathematics', 'गणित', 'ਗਣਿਤ', 'MATH', 'calculator'),
('Hindi', 'हिंदी', 'ਹਿੰਦੀ', 'HINDI', 'book'),
('English', 'अंग्रेजी', 'ਅੰਗਰੇਜ਼ੀ', 'ENG', 'globe'),
('Science', 'विज्ञान', 'ਵਿਗਿਆਨ', 'SCI', 'flask'),
('Social Studies', 'सामाजिक विज्ञान', 'ਸਮਾਜਿਕ ਵਿਗਿਆਨ', 'SST', 'map'),
('Punjabi', 'पंजाबी', 'ਪੰਜਾਬੀ', 'PUNJ', 'book'),
('Computer', 'कंप्यूटर', 'ਕੰਪਿਊਟਰ', 'COMP', 'monitor');

-- ─────────────────────────────────────────
-- CLASS-SUBJECT-TEACHER MAPPING
-- ─────────────────────────────────────────
CREATE TABLE class_subject_teacher (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    class_id    INT    NOT NULL,
    subject_id  INT    NOT NULL,
    teacher_id  BIGINT NOT NULL,
    academic_year VARCHAR(10) NOT NULL DEFAULT '2024-25',
    FOREIGN KEY (class_id)   REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    UNIQUE KEY unique_cst (class_id, subject_id, academic_year)
);

-- ─────────────────────────────────────────
-- CHAPTERS
-- ─────────────────────────────────────────
CREATE TABLE chapters (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    subject_id      INT NOT NULL,
    class_id        INT NOT NULL,
    title           VARCHAR(200) NOT NULL,
    title_hindi     VARCHAR(200),
    title_punjabi   VARCHAR(200),
    chapter_number  INT NOT NULL,
    description     TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (class_id)   REFERENCES classes(id),
    INDEX idx_subject_class (subject_id, class_id)
);

-- Sample chapters data for all classes and subjects
-- CLASS 1: Mathematics (Subject 1)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(1, 1, 'Numbers 1 to 10', 'संख्या 1 से 10', 'ਨੰਬਰ 1 ਤੋਂ 10', 1, TRUE),
(1, 1, 'Addition Basics', 'जोड़ की मूल बातें', 'ਜੋੜ ਦੀ ਮੂਲ ਚੀਜ़ें', 2, TRUE),
(1, 1, 'Subtraction Basics', 'घटाव की मूल बातें', 'ਘਟਾਓ ਦੀ ਮੂਲ ਚੀਜ਼ਾਂ', 3, TRUE),
(1, 1, 'Shapes and Sizes', 'आकार और आकार', 'ਆਕਾਰ ਅਤੇ ਆਕਾਰ', 4, TRUE);

-- CLASS 1: Hindi (Subject 2)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(2, 1, 'वर्णमाला (Alphabet)', 'वर्णमाला', 'ਵਰਨਮਾਲਾ', 1, TRUE),
(2, 1, 'सरल शब्द (Simple Words)', 'सरल शब्द', 'ਸਧਾਰਨ ਸ਼ਬਦ', 2, TRUE),
(2, 1, 'पठन कौशल (Reading Skills)', 'पठन कौशल', 'ਪੜ੍ਹਨ ਦੀ ਮੁਹਾਰਤ', 3, TRUE);

-- CLASS 1: English (Subject 3)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(3, 1, 'Alphabet A-Z', 'वर्णमाला A-Z', 'ਅਲਫਾਬੈਟ A-Z', 1, TRUE),
(3, 1, 'Simple Sentences', 'सरल वाक्य', 'ਸਧਾਰਨ ਵਾਕ', 2, TRUE),
(3, 1, 'Colors and Objects', 'रंग और वस्तुएं', 'ਰੰਗ ਅਤੇ ਵਸਤੂਆਂ', 3, TRUE);

-- CLASS 1: Science (Subject 4)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(4, 1, 'Our Body', 'हमारा शरीर', 'ਸਾਡਾ ਸਰੀਰ', 1, TRUE),
(4, 1, 'Plants and Animals', 'पौधे और जानवर', 'ਪੌਦੇ ਅਤੇ ਜਾਨਵਰ', 2, TRUE),
(4, 1, 'Weather and Seasons', 'मौसम और ऋतुएं', 'ਮੌਸਮ ਅਤੇ ਰੁੱਤਾਂ', 3, TRUE);

-- CLASS 1: Social Studies (Subject 5)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(5, 1, 'My Family', 'मेरा परिवार', 'ਮੇਰਾ ਪਰਿਵਾਰ', 1, TRUE),
(5, 1, 'My School', 'मेरा स्कूल', 'ਮੇਰਾ ਸਕੂਲ', 2, TRUE),
(5, 1, 'Community Helpers', 'समुदाय सहायक', 'ਸਮੁਦਾਇ ਸਹਾਇਤਕ', 3, TRUE);

-- CLASS 6: Mathematics (Subject 1)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(1, 6, 'Knowing Our Numbers', 'हमारी संख्याओं को जानना', 'ਸਾਡੀਆਂ ਸੰਖਿਆਵਾਂ ਨੂੰ ਜਾਣਨਾ', 1, TRUE),
(1, 6, 'Whole Numbers', 'पूर्ण संख्याएँ', 'ਪੂਰੀ ਸੰਖਿਆਵਾਂ', 2, TRUE),
(1, 6, 'Playing with Numbers', 'संख्याओं के साथ खेलना', 'ਸੰਖਿਆਵਾਂ ਨਾਲ ਖੇਡਣਾ', 3, TRUE),
(1, 6, 'Basic Geometry', 'बुनियादी ज्यामिति', 'ਬੁਨਿਆਦੀ ਜਿਓਮੈਟਰੀ', 4, TRUE);

-- CLASS 6: Hindi (Subject 2)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(2, 6, 'पाठ 1: दो बैलों की कथा', 'दो बैलों की कथा', 'ਦੋ ਬੈਲਾਂ ਦੀ ਕਥਾ', 1, TRUE),
(2, 6, 'पाठ 2: ल्हासा की ओर', 'ल्हासा की ओर', 'ਲ੍ਹਾਸਾ ਵੱਲ', 2, TRUE),
(2, 6, 'पाठ 3: आदमी का धर्म', 'आदमी का धर्म', 'ਆਦਮੀ ਦਾ ਧਰਮ', 3, TRUE);

-- CLASS 6: English (Subject 3)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(3, 6, 'A Tale of Two Animals', 'दो जानवरों की कहानी', 'ਦੋ ਜਾਨਵਰਾਂ ਦੀ ਕਹਾਣੀ', 1, TRUE),
(3, 6, 'The Squirrel', 'गिलहरी', 'ਗਿਲਹਰੀ', 2, TRUE),
(3, 6, 'A Game of Chance', 'संयोग का खेल', 'ਮੌਕਾ ਦਾ ਖੇਲ', 3, TRUE);

-- CLASS 6: Science (Subject 4)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(4, 6, 'Food: Where Does it Come From?', 'भोजन: यह कहाँ से आता है?', 'ਭੋਜਨ: ਇਹ ਕਿੱਥੋਂ ਆਉਂਦਾ ਹੈ?', 1, TRUE),
(4, 6, 'Components of Food', 'भोजन के घटक', 'ਭੋਜਨ ਦੇ ਹਿੱਸੇ', 2, TRUE),
(4, 6, 'Fiber to Fabric', 'रेशा से वस्त्र तक', 'ਰੇਸ਼ੇ ਤੋਂ ਕੱਪੜੇ ਤਕ', 3, TRUE);

-- CLASS 6: Social Studies (Subject 5)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(5, 6, 'The Earth in the Solar System', 'सौर प्रणाली में पृथ्वी', 'ਸੌਰ ਪ੍ਰਣਾਲੀ ਵਿੱਚ ਧਰਤੀ', 1, TRUE),
(5, 6, 'Globe: Latitudes and Longitudes', 'ग्लोब: अक्षांश और देशांतर', 'ਗਲੋਬ: ਅਕਸ਼ਾਂਸ਼ ਅਤੇ ਲੰਬਕਾਰ', 2, TRUE),
(5, 6, 'Maps', 'मानचित्र', 'ਨਕਸ਼ੇ', 3, TRUE);

-- CLASS 8: Mathematics (Subject 1)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(1, 10, 'Rational Numbers', 'परिमेय संख्याएँ', 'ਤਰਕਯੁਕਤ ਸੰਖਿਆਵਾਂ', 1, TRUE),
(1, 10, 'Linear Equations in One Variable', 'एक चर में रैखिक समीकरण', 'ਇੱਕ ਵੇਰੀਏਬਲ ਵਿੱਚ ਲੀਨੀਅਰ ਸਮੀਕਰਨ', 2, TRUE),
(1, 10, 'Understanding Quadrilaterals', 'चतुर्भुजों को समझना', 'ਚਤੁਰਭੁਜਾਂ ਨੂੰ ਸਮਝਣਾ', 3, TRUE),
(1, 10, 'Practical Geometry', 'व्यावहारिक ज्यामिति', 'ਵਿਹਾਰਕ ਜਿਓਮੈਟਰੀ', 4, TRUE),
(1, 10, 'Data Handling', 'डेटा हैंडलिंग', 'ਡੇਟਾ ਹੈਂਡਲਿੰਗ', 5, TRUE);

-- CLASS 8: Hindi (Subject 2)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(2, 10, 'दीर्घचित्तु', 'दीर्घचित्तु', 'ਦੀਘਾ-ਚਿੰਤਕ', 1, TRUE),
(2, 10, 'संस्कृत पद्यांश', 'संस्कृत पद्यांश', 'ਸੰਸਕ੍ਰਿਤ ਪਦਾਂਸ਼', 2, TRUE),
(2, 10, 'गद्य भाग', 'गद्य भाग', 'ਸਦ ਭਾਗ', 3, TRUE);

-- CLASS 8: English (Subject 3)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(3, 10, 'Prose Passage', 'गद्य अंश', 'ਗਦਾ ਖੰਡ', 1, TRUE),
(3, 10, 'Poem: The Butterfly', 'कविता: तितली', 'ਕਵਿਤਾ: ਤਿਤਲੀ', 2, TRUE),
(3, 10, 'Supplementary Reader', 'पूरक पाठक', 'ਪੂਰਕ ਪਾਠਕ', 3, TRUE);

-- CLASS 8: Science (Subject 4)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(4, 10, 'Combustion and Flame', 'दहन और ज्वाला', 'ਦਹਨ ਅਤੇ ਅੱਗ', 1, TRUE),
(4, 10, 'Chemical Effects of Electric Current', 'विद्युत प्रवाह का रासायनिक प्रभाव', 'ਬਿਜਲਾਂ ਮੌਜੂਦਾ ਦਾ ਰਾਸਾਇਣਿਕ ਪ੍ਰਭਾਵ', 2, TRUE),
(4, 10, 'Sound', 'ध्वनि', 'ਆਵਾਜ', 3, TRUE);

-- CLASS 8: Social Studies (Subject 5)
INSERT INTO chapters (subject_id, class_id, title, title_hindi, title_punjabi, chapter_number, is_active) VALUES
(5, 10, 'How, When and Where', 'कैसे, कब और कहाँ', 'ਕਿਵੇਂ, ਕਦੋਂ ਅਤੇ ਕਿੱਥੇ', 1, TRUE),
(5, 10, 'From Trade to Territory', 'व्यापार से क्षेत्र तक', 'ਵਪਾਰ ਤੋਂ ਖੇਤਰ ਤਕ', 2, TRUE),
(5, 10, 'Ruling the Land', 'भूमि पर शासन करना', 'ਭੂਮੀ ਤੇ ਸ਼ਾਸਨ ਕਰਨਾ', 3, TRUE);

-- ─────────────────────────────────────────
-- NOTES (text + PDF)
-- ─────────────────────────────────────────
CREATE TABLE notes (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id      BIGINT NOT NULL,
    chapter_id      INT NOT NULL,
    class_id        INT NOT NULL,
    subject_id      INT NOT NULL,
    title           VARCHAR(255) NOT NULL,
    title_hindi     VARCHAR(255),
    title_punjabi   VARCHAR(255),
    content_text    LONGTEXT,
    content_hindi   LONGTEXT,
    content_punjabi LONGTEXT,
    pdf_path        VARCHAR(255),
    note_type       ENUM('TEXT','PDF','BOTH') NOT NULL DEFAULT 'TEXT',
    language        ENUM('HINDI','PUNJABI','ENGLISH','MULTILINGUAL') DEFAULT 'HINDI',
    is_voice_enabled BOOLEAN DEFAULT TRUE,
    is_downloadable  BOOLEAN DEFAULT TRUE,
    status          ENUM('DRAFT','PUBLISHED') DEFAULT 'DRAFT',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id)  REFERENCES teachers(id),
    FOREIGN KEY (chapter_id)  REFERENCES chapters(id),
    FOREIGN KEY (class_id)    REFERENCES classes(id),
    FOREIGN KEY (subject_id)  REFERENCES subjects(id),
    INDEX idx_class_subject (class_id, subject_id)
);

-- ─────────────────────────────────────────
-- VIDEO TUTORIALS
-- ─────────────────────────────────────────
CREATE TABLE videos (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id      BIGINT NOT NULL,
    chapter_id      INT NOT NULL,
    class_id        INT NOT NULL,
    subject_id      INT NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    video_path      VARCHAR(255),
    thumbnail_path  VARCHAR(255),
    audio_path      VARCHAR(255),
    transcript      LONGTEXT,
    transcript_hindi LONGTEXT,
    duration_secs   INT DEFAULT 0,
    file_size_mb    DECIMAL(8,2),
    quality         ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
    has_subtitles   BOOLEAN DEFAULT FALSE,
    status          ENUM('DRAFT','PUBLISHED') DEFAULT 'DRAFT',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id)  REFERENCES teachers(id),
    FOREIGN KEY (chapter_id)  REFERENCES chapters(id),
    FOREIGN KEY (class_id)    REFERENCES classes(id),
    FOREIGN KEY (subject_id)  REFERENCES subjects(id),
    INDEX idx_class_subject (class_id, subject_id)
);

-- ─────────────────────────────────────────
-- QUIZZES
-- ─────────────────────────────────────────
CREATE TABLE quizzes (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id      BIGINT NOT NULL,
    chapter_id      INT NOT NULL,
    class_id        INT NOT NULL,
    subject_id      INT NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    quiz_type       ENUM('MCQ','SUBJECTIVE','MIXED') NOT NULL DEFAULT 'MCQ',
    difficulty      ENUM('EASY','MEDIUM','HARD') NOT NULL DEFAULT 'MEDIUM',
    total_marks     INT NOT NULL DEFAULT 10,
    pass_marks      INT NOT NULL DEFAULT 4,
    time_limit_mins INT DEFAULT 30,
    is_voice_enabled BOOLEAN DEFAULT TRUE,
    is_published    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id)  REFERENCES teachers(id),
    FOREIGN KEY (chapter_id)  REFERENCES chapters(id),
    FOREIGN KEY (class_id)    REFERENCES classes(id),
    FOREIGN KEY (subject_id)  REFERENCES subjects(id)
);

-- ─────────────────────────────────────────
-- QUESTIONS
-- ─────────────────────────────────────────
CREATE TABLE questions (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id         BIGINT NOT NULL,
    question_text   TEXT NOT NULL,
    question_hindi  TEXT,
    question_punjabi TEXT,
    question_type   ENUM('MCQ','SUBJECTIVE','TRUE_FALSE') NOT NULL,
    option_a        VARCHAR(500),
    option_b        VARCHAR(500),
    option_c        VARCHAR(500),
    option_d        VARCHAR(500),
    correct_answer  VARCHAR(10),
    marks           INT NOT NULL DEFAULT 1,
    order_index     INT NOT NULL DEFAULT 0,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- PRACTICE EXERCISES
-- ─────────────────────────────────────────
CREATE TABLE practice_exercises (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id      BIGINT NOT NULL,
    chapter_id      INT NOT NULL,
    class_id        INT NOT NULL,
    subject_id      INT NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    exercise_content LONGTEXT,
    is_voice_enabled BOOLEAN DEFAULT TRUE,
    due_date        DATE,
    status          ENUM('DRAFT','PUBLISHED') DEFAULT 'DRAFT',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id),
    FOREIGN KEY (class_id)   REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- ─────────────────────────────────────────
-- QUIZ ATTEMPTS
-- ─────────────────────────────────────────
CREATE TABLE quiz_attempts (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    quiz_id         BIGINT NOT NULL,
    score           DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_marks     INT NOT NULL,
    percentage      DECIMAL(5,2),
    status          ENUM('IN_PROGRESS','COMPLETED','SYNCED_OFFLINE') DEFAULT 'IN_PROGRESS',
    started_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at    TIMESTAMP NULL,
    is_offline      BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (quiz_id)    REFERENCES quizzes(id)
);

-- ─────────────────────────────────────────
-- STUDENT ANSWERS
-- ─────────────────────────────────────────
CREATE TABLE student_answers (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id      BIGINT NOT NULL,
    question_id     BIGINT NOT NULL,
    answer_text     TEXT,
    is_voice_answer BOOLEAN DEFAULT FALSE,
    is_correct      BOOLEAN,
    marks_obtained  DECIMAL(4,2) DEFAULT 0,
    FOREIGN KEY (attempt_id)  REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- ─────────────────────────────────────────
-- PROGRESS TRACKING
-- ─────────────────────────────────────────
CREATE TABLE progress (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    subject_id      INT NOT NULL,
    chapter_id      INT NOT NULL,
    notes_read      INT DEFAULT 0,
    videos_watched  INT DEFAULT 0,
    quizzes_taken   INT DEFAULT 0,
    avg_score       DECIMAL(5,2) DEFAULT 0,
    time_spent_mins INT DEFAULT 0,
    is_chapter_complete BOOLEAN DEFAULT FALSE,
    last_activity   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id),
    UNIQUE KEY unique_progress (student_id, chapter_id)
);

-- ─────────────────────────────────────────
-- CONFIDENCE TRACKING
-- ─────────────────────────────────────────
CREATE TABLE confidence_tracking (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    chapter_id      INT NOT NULL,
    confidence_level ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
    recorded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

-- ─────────────────────────────────────────
-- ANNOUNCEMENTS
-- ─────────────────────────────────────────
CREATE TABLE announcements (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_by      BIGINT NOT NULL,
    title           VARCHAR(255) NOT NULL,
    title_hindi     VARCHAR(255),
    title_punjabi   VARCHAR(255),
    content         TEXT NOT NULL,
    content_hindi   TEXT,
    content_punjabi TEXT,
    target_role     ENUM('ALL','STUDENT','TEACHER','PARENT') NOT NULL DEFAULT 'ALL',
    target_class_id INT NULL,
    priority        ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
    is_active       BOOLEAN DEFAULT TRUE,
    publish_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expire_date     TIMESTAMP NULL,
    FOREIGN KEY (created_by)       REFERENCES users(id),
    FOREIGN KEY (target_class_id)  REFERENCES classes(id),
    INDEX idx_target (target_role, is_active)
);

-- ─────────────────────────────────────────
-- EMAIL NOTIFICATIONS
-- ─────────────────────────────────────────
CREATE TABLE email_notifications (
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
-- TEACHER REMARKS
-- ─────────────────────────────────────────
CREATE TABLE teacher_remarks (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id      BIGINT NOT NULL,
    student_id      BIGINT NOT NULL,
    remark_text     TEXT NOT NULL,
    remark_type     ENUM('ACADEMIC','BEHAVIOR','ATTENDANCE','GENERAL') DEFAULT 'GENERAL',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- ─────────────────────────────────────────
-- EXERCISE SUBMISSIONS
-- ─────────────────────────────────────────
CREATE TABLE exercise_submissions (
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

-- ─────────────────────────────────────────
-- DOWNLOADS (offline cache tracking)
-- ─────────────────────────────────────────

CREATE TABLE downloads (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    content_type    ENUM('NOTE','VIDEO','EXERCISE') NOT NULL,
    content_id      BIGINT NOT NULL,
    downloaded_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    INDEX idx_student_content (student_id, content_type)
);
