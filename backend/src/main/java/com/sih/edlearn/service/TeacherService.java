package com.sih.edlearn.service;

import com.sih.edlearn.dto.request.*;
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

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final VideoRepository videoRepository;
    private final QuizRepository quizRepository;
    private final PracticeExerciseRepository practiceExerciseRepository;
    private final ChapterRepository chapterRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final FileStorageService fileStorageService;
    private final StudentRepository studentRepository;
    private final ExerciseSubmissionRepository exerciseSubmissionRepository;
    private final AnnouncementRepository announcementRepository;

    @Transactional
    public NoteResponse createNote(NoteRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

        Chapter chapter = chapterRepository.findById(request.getChapterId())
                .orElseThrow(() -> new ResourceNotFoundException("Chapter", request.getChapterId().longValue()));
        SchoolClass schoolClass = schoolClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class", request.getClassId().longValue()));
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", request.getSubjectId().longValue()));

        Note note = Note.builder()
                .teacher(teacher)
                .chapter(chapter)
                .schoolClass(schoolClass)
                .subject(subject)
                .title(request.getTitle())
                .titleHindi(request.getTitleHindi())
                .titlePunjabi(request.getTitlePunjabi())
                .contentText(request.getContentText())
                .contentHindi(request.getContentHindi())
                .contentPunjabi(request.getContentPunjabi())
                .noteType(Note.NoteType.TEXT)
                .language(Note.Language.valueOf(request.getLanguage()))
                .isVoiceEnabled(request.getIsVoiceEnabled())
                .isDownloadable(request.getIsDownloadable())
                .status(Note.Status.valueOf(request.getStatus() != null ? request.getStatus() : "PUBLISHED"))
                .build();

        note = noteRepository.save(note);
        return mapNoteToResponse(note);
    }

    @Transactional
    public NoteResponse uploadPdfNote(MultipartFile file, Integer classId, Integer subjectId,
                                      Integer chapterId, String title, String status, String username) throws IOException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter", chapterId.longValue()));
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", classId.longValue()));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", subjectId.longValue()));

        String pdfPath = fileStorageService.saveFile(file, "notes");

        Note note = Note.builder()
                .teacher(teacher)
                .chapter(chapter)
                .schoolClass(schoolClass)
                .subject(subject)
                .title(title)
                .pdfPath(pdfPath)
                .noteType(Note.NoteType.PDF)
                .language(Note.Language.HINDI)
                .isVoiceEnabled(false)
                .isDownloadable(true)
                .status(Note.Status.valueOf(status != null ? status : "PUBLISHED"))
                .build();

        note = noteRepository.save(note);
        return mapNoteToResponse(note);
    }

      @Transactional(readOnly = true)
      public PagedResponse<NoteResponse> getTeacherNotes(String username, int page, int size) {
         User user = userRepository.findByUsername(username)
                 .orElseThrow(() -> new ResourceNotFoundException("User", username));
         Teacher teacher = teacherRepository.findByUserId(user.getId())
                 .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

         Pageable pageable = PageRequest.of(page, size);
         Page<Note> notesPage = noteRepository.findByTeacherIdAndStatus(
                 teacher.getId(), Note.Status.PUBLISHED, pageable);

         return buildPagedResponse(notesPage.map(this::mapNoteToResponse), page);
      }

      @Transactional(readOnly = true)
      public List<ChapterResponseDto> getChaptersForTeacher(Integer subjectId, Integer classId) {
           List<Chapter> chapters;
           if (subjectId != null && classId != null) {
               chapters = chapterRepository.findBySubjectIdAndSchoolClassId(subjectId, classId);
           } else if (subjectId != null) {
               chapters = chapterRepository.findBySubjectId(subjectId);
           } else if (classId != null) {
               chapters = chapterRepository.findBySchoolClassId(classId);
           } else {
               chapters = new ArrayList<>();
           }
           return chapters.stream()
                   .map(this::mapChapterToResponseDto)
                   .collect(Collectors.toList());
       }

     @Transactional
    public void publishNote(Long noteId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", noteId));

        if (!note.getTeacher().getId().equals(teacher.getId())) {
            throw new ResourceNotFoundException("You don't have permission to publish this note");
        }

        note.setStatus(Note.Status.PUBLISHED);
        noteRepository.save(note);
    }

    @Transactional
    public VideoResponse uploadVideo(MultipartFile video, MultipartFile thumbnail, Integer classId,
                                    Integer subjectId, Integer chapterId, String title,
                                    String transcript, String username) throws IOException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter", chapterId.longValue()));
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", classId.longValue()));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", subjectId.longValue()));

        String videoPath = fileStorageService.saveFile(video, "videos");
        String thumbnailPath = thumbnail != null ?
                fileStorageService.saveFile(thumbnail, "thumbnails") : null;

        Video videoEntity = Video.builder()
                .teacher(teacher)
                .chapter(chapter)
                .schoolClass(schoolClass)
                .subject(subject)
                .title(title)
                .videoPath(videoPath)
                .thumbnailPath(thumbnailPath)
                .transcript(transcript)
                .quality(Video.Quality.MEDIUM)
                .status(Video.Status.PUBLISHED)
                .build();

        videoEntity = videoRepository.save(videoEntity);
        return mapVideoToResponse(videoEntity);
    }

    @Transactional
    public QuizResponse createQuiz(QuizRequest request, String username) {
         User user = userRepository.findByUsername(username)
                 .orElseThrow(() -> new ResourceNotFoundException("User", username));
         Teacher teacher = teacherRepository.findByUserId(user.getId())
                 .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

         Chapter chapter = chapterRepository.findById(request.getChapterId())
                 .orElseThrow(() -> new ResourceNotFoundException("Chapter", request.getChapterId().longValue()));
         SchoolClass schoolClass = schoolClassRepository.findById(request.getClassId())
                 .orElseThrow(() -> new ResourceNotFoundException("Class", request.getClassId().longValue()));
         Subject subject = subjectRepository.findById(request.getSubjectId())
                 .orElseThrow(() -> new ResourceNotFoundException("Subject", request.getSubjectId().longValue()));

         log.debug("=== QUIZ CREATE DEBUG START ===");
         log.debug("Teacher: {} (ID: {})", username, teacher.getId());
         log.debug("Class ID: {}, Subject ID: {}, Chapter ID: {}",
             request.getClassId(), request.getSubjectId(), request.getChapterId());
         log.debug("Quiz Title: {}", request.getTitle());
         log.debug("Difficulty: {}, isPublished: {}", request.getDifficulty(), request.getIsPublished());
         log.debug("Total Marks: {}, Pass Marks: {}, Duration: {}mins",
             request.getTotalMarks(), request.getPassMarks(), request.getTimeLimitMins());

         Quiz quiz = Quiz.builder()
                 .teacher(teacher)
                 .chapter(chapter)
                 .schoolClass(schoolClass)
                 .subject(subject)
                 .title(request.getTitle())
                 .description(request.getDescription())
                 .quizType(Quiz.QuizType.valueOf(request.getQuizType()))
                 .difficulty(Quiz.Difficulty.valueOf(request.getDifficulty()))
                 .totalMarks(request.getTotalMarks())
                 .passMarks(request.getPassMarks())
                 .timeLimitMins(request.getTimeLimitMins())
                 .isVoiceEnabled(request.getIsVoiceEnabled())
                 .isPublished(request.getIsPublished())
                 .build();

         quiz = quizRepository.save(quiz);

         log.debug("✓ Quiz SAVED successfully!");
         log.debug("  ID: {}", quiz.getId());
         log.debug("  Title: {}", quiz.getTitle());
         log.debug("  Published: {}", quiz.getIsPublished());
         log.debug("  Difficulty: {}", quiz.getDifficulty());
         log.debug("  Class: {} | Subject: {} | Chapter: {}",
             quiz.getSchoolClass().getId(), quiz.getSubject().getId(), quiz.getChapter().getId());

         List<Question> questions = new ArrayList<>();
         for (QuestionRequest qReq : request.getQuestions()) {
             Question question = Question.builder()
                     .quiz(quiz)
                     .questionText(qReq.getQuestionText())
                     .questionHindi(qReq.getQuestionHindi())
                     .questionPunjabi(qReq.getQuestionPunjabi())
                     .questionType(Question.QuestionType.valueOf(qReq.getQuestionType()))
                     .optionA(qReq.getOptionA())
                     .optionB(qReq.getOptionB())
                     .optionC(qReq.getOptionC())
                     .optionD(qReq.getOptionD())
                     .correctAnswer(qReq.getCorrectAnswer())
                     .marks(qReq.getMarks())
                     .orderIndex(qReq.getOrderIndex())
                     .build();
             questions.add(question);
         }
         quiz.setQuestions(questions);

         log.debug("Added {} questions to quiz", questions.size());
         log.debug("=== QUIZ CREATE DEBUG END ===");

         return mapQuizToResponse(quiz);
     }

    @Transactional
    public void publishQuiz(Long quizId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", quizId));

        if (!quiz.getTeacher().getId().equals(teacher.getId())) {
            throw new ResourceNotFoundException("You don't have permission to publish this quiz");
        }

        quiz.setIsPublished(true);
        quizRepository.save(quiz);
    }

    @Transactional
    public Long createExercise(ExerciseRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

        Chapter chapter = chapterRepository.findById(request.getChapterId())
                .orElseThrow(() -> new ResourceNotFoundException("Chapter", request.getChapterId().longValue()));
        SchoolClass schoolClass = schoolClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class", request.getClassId().longValue()));
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", request.getSubjectId().longValue()));

        PracticeExercise exercise = PracticeExercise.builder()
                .teacher(teacher)
                .chapter(chapter)
                .schoolClass(schoolClass)
                .subject(subject)
                .title(request.getTitle())
                .description(request.getDescription())
                .exerciseContent(request.getExerciseContent())
                .isVoiceEnabled(request.getIsVoiceEnabled())
                .dueDate(request.getDueDate() != null ? LocalDate.parse(request.getDueDate()) : null)
                .status(PracticeExercise.Status.DRAFT)
                .build();

        exercise = practiceExerciseRepository.save(exercise);
        return exercise.getId();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard(String username) {
         User user = userRepository.findByUsername(username)
                 .orElseThrow(() -> new ResourceNotFoundException("User", username));
         Teacher teacher = teacherRepository.findByUserId(user.getId())
                 .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

         long notesCount = noteRepository.countByTeacherId(teacher.getId());
         long videosCount = videoRepository.countByTeacherId(teacher.getId());
         long quizzesCount = quizRepository.countByTeacherId(teacher.getId());

         // Count unique students in teacher's classes
         long studentsCount = 0; // Implementation depends on class-subject-teacher mapping

         // Get recent notes (last 5) - uses JOIN FETCH to avoid LazyInitializationException
         Pageable recentPageable = PageRequest.of(0, 5);
         Page<Note> recentNotesPage = noteRepository.findByTeacherIdAndStatus(
                 teacher.getId(), Note.Status.PUBLISHED, recentPageable);

         List<Map<String, Object>> recentNotes = recentNotesPage.stream()
                 .map(note -> {
                     Map<String, Object> noteMap = new HashMap<>();
                     noteMap.put("id", note.getId());
                     noteMap.put("title", note.getTitle());
                     noteMap.put("chapterTitle", note.getChapter().getTitle());
                     noteMap.put("className", note.getSchoolClass().getName());
                     noteMap.put("status", note.getStatus().name());
                     noteMap.put("createdAt", note.getCreatedAt());
                     return noteMap;
                 })
                 .collect(Collectors.toList());

         Map<String, Object> dashboard = new HashMap<>();
         dashboard.put("notesCount", notesCount);
         dashboard.put("videosCount", videosCount);
         dashboard.put("quizzesCount", quizzesCount);
         dashboard.put("studentsCount", studentsCount);
         dashboard.put("recentNotes", recentNotes);

         return dashboard;
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
                 .build();
     }

     private ChapterResponseDto mapChapterToResponseDto(Chapter chapter) {
         return ChapterResponseDto.builder()
                 .id(chapter.getId())
                 .title(chapter.getTitle())
                 .chapterNumber(chapter.getChapterNumber())
                 .build();
     }

    @Transactional
    public void deleteNote(Long noteId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", noteId));
        if (!note.getTeacher().getId().equals(teacher.getId())) {
            throw new ResourceNotFoundException("You don't have permission to delete this note");
        }
        noteRepository.delete(note);
        log.info("Note deleted: {}", noteId);
    }

     @Transactional(readOnly = true)
     public PagedResponse<VideoResponse> getTeacherVideos(String username, int page, int size, String status) {
         User user = userRepository.findByUsername(username)
                 .orElseThrow(() -> new ResourceNotFoundException("User", username));
         Teacher teacher = teacherRepository.findByUserId(user.getId())
                 .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));
         Pageable pageable = PageRequest.of(page, size);
         Page<Video> videosPage;

         if (status != null && !status.isEmpty() && !status.equals("ALL")) {
             try {
                 Video.Status videoStatus = Video.Status.valueOf(status.toUpperCase());
                 videosPage = videoRepository.findByTeacherIdAndStatus(teacher.getId(), videoStatus, pageable);
             } catch (IllegalArgumentException e) {
                 videosPage = videoRepository.findByTeacherIdAndStatus(teacher.getId(), Video.Status.DRAFT, pageable);
             }
         } else {
             videosPage = videoRepository.findByTeacherIdAndStatus(teacher.getId(), Video.Status.DRAFT, pageable);
             // Combine draft and published videos
             Pageable allVideosPageable = PageRequest.of(page, size * 2);
             videosPage = videoRepository.findByTeacherId(teacher.getId(), allVideosPageable)
                     .map(video -> video);
         }
         return buildPagedResponse(videosPage.map(this::mapVideoToResponse), page);
     }

    @Transactional
    public void publishVideo(Long videoId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video", videoId));
        if (!video.getTeacher().getId().equals(teacher.getId())) {
            throw new ResourceNotFoundException("You don't have permission to publish this video");
        }
        video.setStatus(Video.Status.PUBLISHED);
        videoRepository.save(video);
        log.info("Video published: {}", videoId);
    }

    @Transactional
    public void deleteVideo(Long videoId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video", videoId));
        if (!video.getTeacher().getId().equals(teacher.getId())) {
            throw new ResourceNotFoundException("You don't have permission to delete this video");
        }
        videoRepository.delete(video);
        log.info("Video deleted: {}", videoId);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ExerciseSubmissionResponse> getPendingSubmissions(Long exerciseId, String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

        PracticeExercise exercise = practiceExerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise", exerciseId));

        // Verify teacher owns this exercise
        if (!exercise.getTeacher().getId().equals(teacher.getId())) {
            throw new IllegalArgumentException("You don't have permission to grade this exercise");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<ExerciseSubmission> submissionsPage = exerciseSubmissionRepository
                .findByExerciseIdOrderBySubmittedAtDesc(exerciseId, pageable);

        return buildPagedResponse(submissionsPage.map(this::mapSubmissionToResponse), page);
    }

    @Transactional(readOnly = true)
    public long countPendingSubmissions(Long exerciseId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

        PracticeExercise exercise = practiceExerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise", exerciseId));

        // Verify teacher owns this exercise
        if (!exercise.getTeacher().getId().equals(teacher.getId())) {
            throw new IllegalArgumentException("You don't have permission to access this exercise");
        }

        long pendingCount = exerciseSubmissionRepository.countByExerciseIdAndStatus(
                exerciseId,
                ExerciseSubmission.SubmissionStatus.SUBMITTED
        );

        long lateCount = exerciseSubmissionRepository.countByExerciseIdAndStatus(
                exerciseId,
                ExerciseSubmission.SubmissionStatus.LATE
        );

        return pendingCount + lateCount;
    }

    @Transactional
    public ExerciseSubmissionResponse gradeSubmission(Long submissionId, String username, com.sih.edlearn.dto.request.GradeSubmissionRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

        ExerciseSubmission submission = exerciseSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", submissionId));

        // Verify teacher owns the exercise
        if (!submission.getExercise().getTeacher().getId().equals(teacher.getId())) {
            throw new IllegalArgumentException("You don't have permission to grade this submission");
        }

        submission.setScore(request.getScore());
        submission.setTotalMarks(request.getTotalMarks());
        submission.setTeacherFeedback(request.getFeedback());
        submission.setGraderNotes(request.getGraderNotes());
        submission.setGradedBy(teacher);
        submission.setGradedAt(LocalDateTime.now());
        submission.setStatus(ExerciseSubmission.SubmissionStatus.GRADED);

        ExerciseSubmission savedSubmission = exerciseSubmissionRepository.save(submission);

        log.info("Exercise submission graded: submissionId={}, score={}, teacher={}", submissionId, request.getScore(), username);

        return mapSubmissionToResponse(savedSubmission);
    }

    @Transactional(readOnly = true)
    public ExerciseSubmissionResponse getSubmissionDetails(Long submissionId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

        ExerciseSubmission submission = exerciseSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", submissionId));

        // Verify teacher owns the exercise
        if (!submission.getExercise().getTeacher().getId().equals(teacher.getId())) {
            throw new IllegalArgumentException("You don't have permission to view this submission");
        }

        return mapSubmissionToResponse(submission);
    }

    private ExerciseSubmissionResponse mapSubmissionToResponse(ExerciseSubmission submission) {
        List<String> files = new ArrayList<>();
        try {
            if (submission.getSubmissionFiles() != null) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                @SuppressWarnings("unchecked")
                List<String> deserializedFiles = mapper.readValue(submission.getSubmissionFiles(), List.class);
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

    public PagedResponse<Object> getAnnouncements(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Announcement> announcementsPage = announcementRepository.findActiveByRole(
                Announcement.TargetRole.TEACHER, LocalDateTime.now(), pageable);

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
    public PagedResponse<Object> getTeacherQuizzes(String username, int page, int size, String status) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

        Pageable pageable = PageRequest.of(page, size);
        Boolean isPublished = status != null && "PUBLISHED".equalsIgnoreCase(status) ? true : null;
        
        Page<Quiz> quizzesPage;
        if (isPublished != null) {
            quizzesPage = quizRepository.findByTeacherIdAndIsPublished(teacher.getId(), isPublished, pageable);
        } else {
            quizzesPage = quizRepository.findByTeacherIdAndIsPublished(teacher.getId(), true, pageable);
        }

        List<Object> content = quizzesPage.getContent().stream()
                .map(q -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", q.getId());
                    map.put("title", q.getTitle());
                    map.put("description", q.getDescription());
                    map.put("difficulty", q.getDifficulty());
                    map.put("quizType", q.getQuizType());
                    map.put("timeLimitMins", q.getTimeLimitMins());
                    map.put("questionCount", q.getQuestions() != null ? q.getQuestions().size() : 0);
                    map.put("status", q.getIsPublished() ? "PUBLISHED" : "DRAFT");
                    map.put("createdAt", q.getCreatedAt());
                    return (Object) map;
                })
                .collect(Collectors.toList());

        return PagedResponse.builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(quizzesPage.getTotalElements())
                .totalPages(quizzesPage.getTotalPages())
                .last(quizzesPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<Object> getTeacherExercises(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

        Pageable pageable = PageRequest.of(page, size);
        Page<PracticeExercise> exercisesPage = practiceExerciseRepository.findByTeacherIdAndStatus(
                teacher.getId(), PracticeExercise.Status.PUBLISHED, pageable);

        List<Object> content = exercisesPage.getContent().stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", e.getId());
                    map.put("title", e.getTitle());
                    map.put("description", e.getDescription());
                    map.put("status", e.getStatus().name());
                    map.put("dueDate", e.getDueDate());
                    map.put("createdAt", e.getCreatedAt());
                    return (Object) map;
                })
                .collect(Collectors.toList());

        return PagedResponse.builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(exercisesPage.getTotalElements())
                .totalPages(exercisesPage.getTotalPages())
                .last(exercisesPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<Object> getStudentsInTeacherClasses(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

        // Get all students from teacher's classes
        List<Student> students = studentRepository.findAll().stream()
                .filter(s -> s.getSchoolClass() != null)
                .limit((long) page * size + size)
                .skip((long) page * size)
                .collect(Collectors.toList());

        List<Object> content = students.stream()
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", s.getId());
                    map.put("name", s.getUser() != null ? s.getUser().getFullName() : "Unknown");
                    map.put("email", s.getUser() != null ? s.getUser().getEmail() : "");
                    map.put("rollNumber", s.getRollNumber());
                    map.put("className", s.getSchoolClass() != null ? s.getSchoolClass().getName() : "");
                    map.put("difficultyLevel", s.getDifficultyLevel());
                    return (Object) map;
                })
                .collect(Collectors.toList());

        return PagedResponse.builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(students.size())
                .totalPages((int) Math.ceil((double) students.size() / size))
                .last(students.size() <= (long) (page + 1) * size)
                .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<Object> getStudentRemarks(String username, int page, int size, String filter) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

        // Return empty remarks list for now - can be extended with actual remarks entity later
        return PagedResponse.builder()
                .content(new ArrayList<>())
                .page(page)
                .size(size)
                .totalElements(0)
                .totalPages(0)
                .last(true)
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

