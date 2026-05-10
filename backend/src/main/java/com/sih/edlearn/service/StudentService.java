package com.sih.edlearn.service;

import com.sih.edlearn.dto.request.AnswerRequest;
import com.sih.edlearn.dto.request.QuizSubmitRequest;
import com.sih.edlearn.dto.response.*;
import com.sih.edlearn.entity.*;
import com.sih.edlearn.exception.ResourceNotFoundException;
import com.sih.edlearn.repository.*;
import com.sih.edlearn.util.PagedResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final VideoRepository videoRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final ProgressRepository progressRepository;
    private final ConfidenceTrackingRepository confidenceTrackingRepository;
    private final AnnouncementRepository announcementRepository;
    private final AdaptiveLearningService adaptiveLearningService;
    private final ChapterRepository chapterRepository;
    private final PracticeExerciseRepository practiceExerciseRepository;
    private final ExerciseSubmissionRepository exerciseSubmissionRepository;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;
    private final TeacherRepository teacherRepository;

    @Transactional(readOnly = true)
    public List<Subject> getSubjectsForStudent(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", user.getId()));

        // Get all subjects for student's class via chapters
        return chapterRepository.findBySchoolClassId(student.getSchoolClass().getId()).stream()
                .map(Chapter::getSubject)
                .distinct()
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Chapter> getChaptersForStudent(String username, Integer subjectId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", user.getId()));

        if (subjectId != null) {
            // Get chapters for specific subject and student's class
            return chapterRepository.findBySubjectIdAndSchoolClassId(subjectId, student.getSchoolClass().getId());
        } else {
            // Get all chapters for student's class
            return chapterRepository.findBySchoolClassId(student.getSchoolClass().getId());
        }
    }

    @Transactional(readOnly = true)
    public PagedResponse<NoteResponse> getNotes(String username, Integer subjectId, Integer chapterId, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", user.getId()));

        Pageable pageable = PageRequest.of(page, size);
        Page<Note> notesPage = noteRepository.findBySchoolClassIdAndSubjectIdAndStatus(
                student.getSchoolClass().getId(), subjectId, Note.Status.PUBLISHED, pageable);

        return buildPagedResponse(notesPage.map(this::mapNoteToResponse), page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<VideoResponse> getVideos(String username, Integer subjectId, Integer chapterId, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", user.getId()));

        Pageable pageable = PageRequest.of(page, size);
        Page<Video> videosPage = videoRepository.findBySchoolClassIdAndSubjectIdAndStatus(
                student.getSchoolClass().getId(), subjectId, Video.Status.PUBLISHED, pageable);

        return buildPagedResponse(videosPage.map(this::mapVideoToResponse), page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<QuizResponse> getQuizzes(String username, Integer subjectId, Integer chapterId, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", user.getId()));

        Pageable pageable = PageRequest.of(page, size);
        
        // Convert Student.DifficultyLevel to Quiz.Difficulty
        Quiz.Difficulty quizDifficulty = Quiz.Difficulty.valueOf(student.getDifficultyLevel().name());
        
        Page<Quiz> quizzesPage = quizRepository.findBySchoolClassIdAndDifficultyAndIsPublished(
                student.getSchoolClass().getId(),
                quizDifficulty,
                true, pageable);

        return buildPagedResponse(quizzesPage.map(this::mapQuizToResponse), page);
    }

    @Transactional
    public Map<String, Object> submitQuiz(String username, Long quizId, QuizSubmitRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", user.getId()));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", quizId));

        QuizAttempt attempt = QuizAttempt.builder()
                .student(student)
                .quiz(quiz)
                .totalMarks(quiz.getTotalMarks())
                .isOffline(request.getIsOffline())
                .status(QuizAttempt.Status.COMPLETED)
                .completedAt(LocalDateTime.now())
                .build();

        BigDecimal totalScore = BigDecimal.ZERO;
        for (AnswerRequest ans : request.getAnswers()) {
            Question q = quiz.getQuestions().stream()
                    .filter(qu -> qu.getId().equals(ans.getQuestionId()))
                    .findFirst()
                    .orElseThrow();

            boolean isCorrect = ans.getAnswerText().equals(q.getCorrectAnswer());
            BigDecimal marksObtained = isCorrect ? BigDecimal.valueOf(q.getMarks()) : BigDecimal.ZERO;
            totalScore = totalScore.add(marksObtained);

            StudentAnswer answer = StudentAnswer.builder()
                    .attempt(attempt)
                    .question(q)
                    .answerText(ans.getAnswerText())
                    .isVoiceAnswer(ans.getIsVoiceAnswer())
                    .isCorrect(isCorrect)
                    .marksObtained(marksObtained)
                    .build();
            studentAnswerRepository.save(answer);
        }

        BigDecimal percentage = totalScore.multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(quiz.getTotalMarks()), 2, java.math.RoundingMode.HALF_UP);

        attempt.setScore(totalScore);
        attempt.setPercentage(percentage);
        quizAttemptRepository.save(attempt);

        // Update progress
        Progress progress = progressRepository.findByStudentIdAndChapterId(student.getId(), quiz.getChapter().getId())
                .orElse(Progress.builder()
                        .student(student)
                        .subject(quiz.getSubject())
                        .chapter(quiz.getChapter())
                        .build());

        progress.setQuizzesTaken((progress.getQuizzesTaken() != null ? progress.getQuizzesTaken() : 0) + 1);
        progress.setAvgScore(percentage);
        progressRepository.save(progress);

        // Trigger adaptive learning
        adaptiveLearningService.computeAndUpdateDifficulty(student.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("score", totalScore);
        result.put("totalMarks", quiz.getTotalMarks());
        result.put("percentage", percentage);
        result.put("passed", percentage.compareTo(BigDecimal.valueOf(quiz.getPassMarks())) >= 0);
        return result;
    }

    @Transactional(readOnly = true)
    public List<ProgressResponse> getProgress(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", user.getId()));

        return progressRepository.findByStudentId(student.getId()).stream()
                .map(p -> ProgressResponse.builder()
                        .id(p.getId())
                        .subjectName(p.getSubject().getName())
                        .chapterTitle(p.getChapter().getTitle())
                        .notesRead(p.getNotesRead())
                        .videosWatched(p.getVideosWatched())
                        .quizzesTaken(p.getQuizzesTaken())
                        .avgScore(p.getAvgScore())
                        .timeSpentMins(p.getTimeSpentMins())
                        .isChapterComplete(p.getIsChapterComplete())
                        .build())
                .collect(Collectors.toList());
    }

    public Map<String, String> recordConfidence(String username, Integer chapterId, String level) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", user.getId()));

        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter", chapterId.longValue()));

        ConfidenceTracking.ConfidenceLevel confidenceLevel =
                ConfidenceTracking.ConfidenceLevel.valueOf(level.toUpperCase());

        ConfidenceTracking tracking = ConfidenceTracking.builder()
                .student(student)
                .chapter(chapter)
                .confidenceLevel(confidenceLevel)
                .build();
        confidenceTrackingRepository.save(tracking);

        // Get last quiz score for this chapter
        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentId(student.getId());
        double lastScore = attempts.stream()
                .filter(a -> a.getQuiz().getChapter().getId().equals(chapterId))
                .mapToDouble(a -> a.getPercentage().doubleValue())
                .findFirst()
                .orElse(50.0);

        String recommendation = adaptiveLearningService.getRecommendation(level, lastScore);
        Map<String, String> result = new HashMap<>();
        result.put("recommendation", recommendation);
        result.put("message", "Confidence recorded: " + recommendation);
        return result;
    }

    public PagedResponse<Object> getAnnouncements(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Announcement> announcementsPage = announcementRepository.findActiveByRole(
                Announcement.TargetRole.STUDENT, LocalDateTime.now(), pageable);

        List<Object> announcements = announcementsPage.getContent().stream()
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", a.getId());
                    map.put("title", a.getTitle());
                    map.put("content", a.getContent());
                    map.put("priority", a.getPriority());
                    map.put("publishDate", a.getPublishDate());
                    return (Object) map;
                })
                .collect(Collectors.toList());

        return PagedResponse.builder()
                .content(announcements)
                .page(page)
                .size(size)
                .totalElements(announcementsPage.getTotalElements())
                .totalPages(announcementsPage.getTotalPages())
                .last(announcementsPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard(String username) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User", username));
            Student student = studentRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student", user.getId()));

            List<Progress> progressList = progressRepository.findByStudentId(student.getId());
            double avgScore = progressList.isEmpty() ? 0 :
                    progressList.stream()
                            .mapToDouble(p -> p.getAvgScore() != null ? p.getAvgScore().doubleValue() : 0.0)
                            .average()
                            .orElse(0);

            int totalTime = progressList.stream()
                    .mapToInt(p -> p.getTimeSpentMins() != null ? p.getTimeSpentMins() : 0)
                    .sum();
            int chaptersComplete = (int) progressList.stream()
                    .filter(p -> p.getIsChapterComplete() != null && p.getIsChapterComplete())
                    .count();

            Map<String, Object> dashboard = new HashMap<>();

            // Add null-safe checks for SchoolClass
            if (student.getSchoolClass() != null) {
                dashboard.put("className", student.getSchoolClass().getName());
            } else {
                dashboard.put("className", "N/A");
            }

            dashboard.put("rollNumber", student.getRollNumber() != null ? student.getRollNumber() : "");
            dashboard.put("difficultyLevel", student.getDifficultyLevel() != null ? student.getDifficultyLevel() : "MEDIUM");
            dashboard.put("notesRead", progressList.stream()
                    .mapToInt(p -> p.getNotesRead() != null ? p.getNotesRead() : 0)
                    .sum());
            dashboard.put("videosWatched", progressList.stream()
                    .mapToInt(p -> p.getVideosWatched() != null ? p.getVideosWatched() : 0)
                    .sum());
            dashboard.put("quizzesTaken", progressList.stream()
                    .mapToInt(p -> p.getQuizzesTaken() != null ? p.getQuizzesTaken() : 0)
                    .sum());
            dashboard.put("avgScore", avgScore);
            dashboard.put("timeSpentMins", totalTime);
            dashboard.put("chaptersComplete", chaptersComplete);

            // Add announcements
            Pageable announcementPageable = PageRequest.of(0, 3);
            List<Announcement> announcements = announcementRepository.findActiveByRole(
                    Announcement.TargetRole.STUDENT, LocalDateTime.now(), announcementPageable).getContent();

            dashboard.put("announcements", announcements.stream()
                    .map(a -> {
                        Map<String, Object> ann = new HashMap<>();
                        ann.put("id", a.getId());
                        ann.put("title", a.getTitle());
                        ann.put("content", a.getContent());
                        ann.put("priority", a.getPriority());
                        return ann;
                    })
                    .collect(Collectors.toList()));

            // Add subject progress
            dashboard.put("subjectProgress", progressList.stream()
                    .filter(p -> p.getSubject() != null)
                    .map(p -> {
                        Map<String, Object> sp = new HashMap<>();
                        sp.put("subjectId", p.getSubject().getId());
                        sp.put("subjectName", p.getSubject().getName());
                        sp.put("avgScore", p.getAvgScore() != null ? p.getAvgScore().doubleValue() : 0.0);
                        return sp;
                    })
                    .collect(Collectors.toList()));

            return dashboard;
        } catch (Exception e) {
            log.error("Error in getDashboard for user: {}", username, e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public PagedResponse<ExerciseResponse> getStudentExercises(String username, int page, int size, String filter) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", user.getId()));

        Pageable pageable = PageRequest.of(page, size);

        // Get all published exercises for the student's class
        Page<PracticeExercise> exercisesPage = practiceExerciseRepository.findBySchoolClassIdAndStatus(
                student.getSchoolClass().getId(),
                PracticeExercise.Status.PUBLISHED,
                pageable);

        // Map exercises to responses with submission status
        Page<ExerciseResponse> responsePage = exercisesPage.map(exercise -> {
            ExerciseResponse response = mapExerciseToResponse(exercise);

            // Get submission status if exists
            Optional<ExerciseSubmission> submission = exerciseSubmissionRepository
                    .findByExerciseIdAndStudentId(exercise.getId(), student.getId());

            if (submission.isPresent()) {
                ExerciseSubmission sub = submission.get();
                response.setSubmissionStatus(sub.getStatus().name());
                response.setScore(sub.getScore());
                response.setTotalMarks(sub.getTotalMarks());
                response.setTeacherFeedback(sub.getTeacherFeedback());
            } else {
                response.setSubmissionStatus("PENDING");
            }

            return response;
        });

        return buildPagedResponse(responsePage, page);
    }

    @Transactional(readOnly = true)
    public ExerciseResponse getExerciseDetails(String username, Long exerciseId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", user.getId()));

        PracticeExercise exercise = practiceExerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise", exerciseId));

        ExerciseResponse response = mapExerciseToResponse(exercise);

        // Get submission status if exists
        Optional<ExerciseSubmission> submission = exerciseSubmissionRepository
                .findByExerciseIdAndStudentId(exercise.getId(), student.getId());

        if (submission.isPresent()) {
            ExerciseSubmission sub = submission.get();
            response.setSubmissionStatus(sub.getStatus().name());
            response.setScore(sub.getScore());
            response.setTotalMarks(sub.getTotalMarks());
            response.setTeacherFeedback(sub.getTeacherFeedback());
        } else {
            response.setSubmissionStatus("PENDING");
        }

        return response;
    }

    @Transactional
    public ExerciseSubmissionResponse submitExercise(String username, Long exerciseId, MultipartFile[] files, String notes) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", user.getId()));

        PracticeExercise exercise = practiceExerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise", exerciseId));

        // Check if already submitted
        Optional<ExerciseSubmission> existingSubmission = exerciseSubmissionRepository
                .findByExerciseIdAndStudentId(exerciseId, student.getId());

        if (existingSubmission.isPresent() && !existingSubmission.get().getStatus().equals(ExerciseSubmission.SubmissionStatus.DRAFT)) {
            throw new IllegalStateException("Exercise already submitted. Cannot resubmit.");
        }

        // Upload files
        List<String> uploadedFilePaths = new ArrayList<>();
        if (files != null && files.length > 0) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    try {
                        String filePath = fileStorageService.saveFile(file, "exercise-submissions/" + exerciseId);
                        uploadedFilePaths.add(filePath);
                    } catch (Exception e) {
                        log.error("Error uploading file: {}", file.getOriginalFilename(), e);
                        throw new RuntimeException("File upload failed", e);
                    }
                }
            }
        }

        // Determine submission status
        ExerciseSubmission.SubmissionStatus status = ExerciseSubmission.SubmissionStatus.SUBMITTED;
        if (exercise.getDueDate() != null && LocalDate.now().isAfter(exercise.getDueDate())) {
            status = ExerciseSubmission.SubmissionStatus.LATE;
        }

        // Create or update submission
        ExerciseSubmission submission = existingSubmission.orElse(
            ExerciseSubmission.builder()
                    .exercise(exercise)
                    .student(student)
                    .build()
        );

        try {
            submission.setSubmissionFiles(objectMapper.writeValueAsString(uploadedFilePaths));
        } catch (Exception e) {
            log.error("Error serializing file paths", e);
            submission.setSubmissionFiles("[]");
        }

        submission.setStudentNotes(notes);
        submission.setStatus(status);
        submission.setSubmittedAt(LocalDateTime.now());

        ExerciseSubmission savedSubmission = exerciseSubmissionRepository.save(submission);

        return mapSubmissionToResponse(savedSubmission);
    }

    @Transactional(readOnly = true)
    public ExerciseSubmissionResponse getStudentSubmission(String username, Long exerciseId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", user.getId()));

        ExerciseSubmission submission = exerciseSubmissionRepository
                .findByExerciseIdAndStudentId(exerciseId, student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Submission", exerciseId));

        return mapSubmissionToResponse(submission);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ExerciseSubmissionResponse> getStudentSubmissions(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", user.getId()));

        Pageable pageable = PageRequest.of(page, size);
        Page<ExerciseSubmission> submissionsPage = exerciseSubmissionRepository
                .findByStudentIdOrderBySubmittedAtDesc(student.getId(), pageable);

        return buildPagedResponse(submissionsPage.map(this::mapSubmissionToResponse), page);
    }

    private ExerciseResponse mapExerciseToResponse(PracticeExercise exercise) {
        return ExerciseResponse.builder()
                .id(exercise.getId())
                .title(exercise.getTitle())
                .description(exercise.getDescription())
                .exerciseContent(exercise.getExerciseContent())
                .isVoiceEnabled(exercise.getIsVoiceEnabled())
                .dueDate(exercise.getDueDate())
                .status(exercise.getStatus().name())
                .teacherName(exercise.getTeacher().getUser().getFullName())
                .subjectName(exercise.getSubject().getName())
                .chapterTitle(exercise.getChapter().getTitle())
                .createdAt(exercise.getCreatedAt())
                .build();
    }

    private ExerciseSubmissionResponse mapSubmissionToResponse(ExerciseSubmission submission) {
        List<String> files = new ArrayList<>();
        try {
            if (submission.getSubmissionFiles() != null) {
                @SuppressWarnings("unchecked")
                List<String> deserializedFiles = objectMapper.readValue(submission.getSubmissionFiles(), List.class);
                files = deserializedFiles;
            }
        } catch (Exception e) {
            log.error("Error deserializing submission files", e);
        }

        String gradedByTeacher = null;
        if (submission.getGradedBy() != null) {
            gradedByTeacher = submission.getGradedBy().getUser().getFullName();
        }

        return ExerciseSubmissionResponse.builder()
                .id(submission.getId())
                .exerciseId(submission.getExercise().getId())
                .exerciseTitle(submission.getExercise().getTitle())
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getUser().getFullName())
                .submissionFiles(files)
                .studentNotes(submission.getStudentNotes())
                .submissionStatus(submission.getStatus().name())
                .submittedAt(submission.getSubmittedAt())
                .resubmittedAt(submission.getResubmittedAt())
                .score(submission.getScore())
                .totalMarks(submission.getTotalMarks())
                .teacherFeedback(submission.getTeacherFeedback())
                .graderNotes(submission.getGraderNotes())
                .gradedByTeacher(gradedByTeacher)
                .gradedAt(submission.getGradedAt())
                .createdAt(submission.getCreatedAt())
                .updatedAt(submission.getUpdatedAt())
                .build();
    }

    private NoteResponse mapNoteToResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .titleHindi(note.getTitleHindi())
                .titlePunjabi(note.getTitlePunjabi())
                .contentText(note.getContentText())
                .contentHindi(note.getContentHindi())
                .contentPunjabi(note.getContentPunjabi())
                .pdfPath(note.getPdfPath())
                .noteType(note.getNoteType().name())
                .language(note.getLanguage().name())
                .isVoiceEnabled(note.getIsVoiceEnabled())
                .isDownloadable(note.getIsDownloadable())
                .status(note.getStatus().name())
                .teacherName(note.getTeacher().getUser().getFullName())
                .subjectName(note.getSubject().getName())
                .chapterTitle(note.getChapter().getTitle())
                .createdAt(note.getCreatedAt())
                .build();
    }

    private VideoResponse mapVideoToResponse(Video video) {
        return VideoResponse.builder()
                .id(video.getId())
                .title(video.getTitle())
                .description(video.getDescription())
                .videoPath(video.getVideoPath())
                .thumbnailPath(video.getThumbnailPath())
                .audioPath(video.getAudioPath())
                .transcript(video.getTranscript())
                .durationSecs(video.getDurationSecs())
                .hasSubtitles(video.getHasSubtitles())
                .subjectName(video.getSubject().getName())
                .chapterTitle(video.getChapter().getTitle())
                .createdAt(video.getCreatedAt())
                .build();
    }

    private QuizResponse mapQuizToResponse(Quiz quiz) {
        return QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .quizType(quiz.getQuizType().name())
                .difficulty(quiz.getDifficulty().name())
                .totalMarks(quiz.getTotalMarks())
                .passMarks(quiz.getPassMarks())
                .timeLimitMins(quiz.getTimeLimitMins())
                .isVoiceEnabled(quiz.getIsVoiceEnabled())
                .subjectName(quiz.getSubject().getName())
                .chapterTitle(quiz.getChapter().getTitle())
                .createdAt(quiz.getCreatedAt())
                .questions(quiz.getQuestions().stream()
                        .map(q -> QuestionResponse.builder()
                                .id(q.getId())
                                .questionText(q.getQuestionText())
                                .questionHindi(q.getQuestionHindi())
                                .questionPunjabi(q.getQuestionPunjabi())
                                .questionType(q.getQuestionType().name())
                                .optionA(q.getOptionA())
                                .optionB(q.getOptionB())
                                .optionC(q.getOptionC())
                                .optionD(q.getOptionD())
                                .marks(q.getMarks())
                                .orderIndex(q.getOrderIndex())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    private <T> PagedResponse<T> buildPagedResponse(Page<T> page, int pageNumber) {
        return PagedResponse.<T>builder()
                .content(page.getContent())
                .page(pageNumber)
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}

