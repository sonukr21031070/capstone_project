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
                .status(Note.Status.DRAFT)
                .build();

        note = noteRepository.save(note);
        return mapNoteToResponse(note);
    }

    @Transactional
    public NoteResponse uploadPdfNote(MultipartFile file, Integer classId, Integer subjectId,
                                      Integer chapterId, String title, String username) throws IOException {
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
                .status(Note.Status.DRAFT)
                .build();

        note = noteRepository.save(note);
        return mapNoteToResponse(note);
    }

    public PagedResponse<NoteResponse> getTeacherNotes(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", user.getId()));

        Pageable pageable = PageRequest.of(page, size);
        Page<Note> notesPage = noteRepository.findByTeacherIdAndStatus(
                teacher.getId(), Note.Status.DRAFT, pageable);

        return buildPagedResponse(notesPage.map(this::mapNoteToResponse), page);
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
                .status(Video.Status.DRAFT)
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

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("notesCount", notesCount);
        dashboard.put("videosCount", videosCount);
        dashboard.put("quizzesCount", quizzesCount);
        dashboard.put("studentsCount", studentsCount);

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

