// ============================================================
// FILE: src/store/authStore.js - Zustand auth state
// ============================================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token:     null,
      user:      null,
      profileId: null,
      isAuth:    false,

      login: (data) => set({
        token:     data.token,
        user:      { username: data.username, fullName: data.fullName, role: data.role, language: data.language },
        profileId: data.profileId,
        isAuth:    true
      }),

      logout: () => set({ token: null, user: null, profileId: null, isAuth: false }),

      setLanguage: (lang) => set((state) => ({
        user: { ...state.user, language: lang }
      }))
    }),
    { name: 'edlearn-auth', partialize: (s) => ({ token: s.token, user: s.user, profileId: s.profileId, isAuth: s.isAuth }) }
  )
)

// ============================================================
// FILE: src/services/api.js - Axios instance
// ============================================================
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const raw = localStorage.getItem('edlearn-auth')
    if (raw) {
      try {
        const { state } = JSON.parse(raw)
        if (state?.token) config.headers.Authorization = `Bearer ${state.token}`
      } catch (_) {}
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!navigator.onLine) {
      // Offline: don't show error toast, handled by offline store
      return Promise.reject(error)
    }
    const msg = error.response?.data?.error || 'Something went wrong'
    if (error.response?.status === 401) {
      localStorage.removeItem('edlearn-auth')
      window.location.href = '/login'
    } else if (error.response?.status !== 404) {
      toast.error(msg)
    }
    return Promise.reject(error)
  }
)

export default api

// ============================================================
// FILE: src/services/authService.js
// ============================================================
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data)
}

// ============================================================
// FILE: src/services/studentService.js
// ============================================================
export const studentService = {
  getSubjects:       ()              => api.get('/student/subjects'),
  getNotes:          (p)             => api.get('/student/notes', { params: p }),
  getVideos:         (p)             => api.get('/student/videos', { params: p }),
  getVideoTranscript:(id)            => api.get(`/student/videos/${id}/transcript`),
  getQuizzes:        (p)             => api.get('/student/quizzes', { params: p }),
  submitQuiz:        (id, data)      => api.post(`/student/quizzes/${id}/submit`, data),
  getProgress:       ()              => api.get('/student/progress'),
  recordConfidence:  (chapterId, l)  => api.post('/student/confidence', null, { params: { chapterId, level: l } }),
  getAnnouncements:  (p)             => api.get('/student/announcements', { params: p }),
  getDashboard:      ()              => api.get('/student/dashboard'),
  getExercises:      (p)             => api.get('/student/exercises', { params: p }),
  getExerciseDetails:(id)            => api.get(`/student/exercises/${id}`),
  submitExercise:    (id, form)      => api.post(`/student/exercises/${id}/submit`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getStudentSubmission:(id)          => api.get(`/student/exercises/${id}/submission`),
  getSubmissions:    (p)             => api.get('/student/submissions', { params: p }),
  getPerformanceAnalytics: () => api.get('/student/performance-analytics')
}

// ============================================================
// FILE: src/services/teacherService.js
// ============================================================
export const teacherService = {
  createNote:    (data)      => api.post('/teacher/notes', data),
  uploadPdfNote: (form)      => api.post('/teacher/notes/pdf', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyNotes:    (p)         => api.get('/teacher/notes', { params: p }),
  publishNote:   (id)        => api.put(`/teacher/notes/${id}/publish`),
  deleteNote:    (id)        => api.delete(`/teacher/notes/${id}`),
  uploadVideo:   (form)      => api.post('/teacher/videos/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyVideos:   (p)         => api.get('/teacher/videos', { params: p }),
  updateVideo:   (id, data)  => api.put(`/teacher/videos/${id}`, data),
  deleteVideo:   (id)        => api.delete(`/teacher/videos/${id}`),
  createQuiz:    (data)      => api.post('/teacher/quizzes', data),
  getMyQuizzes:  (p)         => api.get('/teacher/quizzes', { params: p }),
  updateQuiz:    (id, data)  => api.put(`/teacher/quizzes/${id}`, data),
  deleteQuiz:    (id)        => api.delete(`/teacher/quizzes/${id}`),
  createExercise:(data)      => api.post('/teacher/exercises', data),
  getMyExercises:(p)         => api.get('/teacher/exercises', { params: p }),
  updateExercise:(id, data)  => api.put(`/teacher/exercises/${id}`, data),
  deleteExercise:(id)        => api.delete(`/teacher/exercises/${id}`),
  getExerciseSubmissions:(id, p) => api.get(`/teacher/exercises/${id}/submissions`, { params: p }),
  gradeSubmission: (id, data) => api.put(`/teacher/exercises/submissions/${id}/grade`, data),
  getDashboard:  ()          => api.get('/teacher/dashboard'),
  getStudents:   ()          => api.get('/teacher/students'),
  getStudentRemarks: (p)     => api.get('/teacher/remarks', { params: p }),
  createRemark:  (data)      => api.post('/teacher/remarks', data),
  updateRemark:  (id, data)  => api.put(`/teacher/remarks/${id}`, data),
  deleteRemark:  (id)        => api.delete(`/teacher/remarks/${id}`),
  getTeacherAnalytics: () => api.get('/teacher/analytics')
}

// ============================================================
// FILE: src/services/adminService.js
// ============================================================
export const adminService = {
   getPendingUsers:    (p)    => api.get('/admin/pending-users', { params: p }),
   approveUser:        (id)   => api.put(`/admin/users/${id}/approve`),
   rejectUser:         (id, r)=> api.put(`/admin/users/${id}/reject`, null, { params: { reason: r } }),
   suspendUser:        (id)   => api.put(`/admin/users/${id}/suspend`),
   deleteUser:         (id)   => api.delete(`/admin/users/${id}`),
   getDashboardStats:  ()     => api.get('/admin/dashboard-stats'),
   createAnnouncement: (data) => api.post('/admin/announcements', data),
   getAnnouncements:   (p)    => api.get('/admin/announcements', { params: p }),
   updateAnnouncement: (id, data) => api.put(`/admin/announcements/${id}`, data),
   deleteAnnouncement: (id)   => api.delete(`/admin/announcements/${id}`),
   getAllUsers:        (p)    => api.get('/admin/users', { params: p }),
   getClassTeacherMap: ()     => api.get('/admin/class-teacher-mapping'),
   getTeachers:        ()     => api.get('/admin/teachers'),
   createClassTeacherMap: (data) => api.post('/admin/class-teacher-mapping', data),
   updateClassTeacherMap: (id, data) => api.put(`/admin/class-teacher-mapping/${id}`, data),
   deleteClassTeacherMap: (id) => api.delete(`/admin/class-teacher-mapping/${id}`),
   getClassesOverview: () => api.get('/admin/classes/overview'),
   getStudentsByClass: (classId) => api.get(`/admin/classes/${classId}/students`),
   getTeachersByClass: (classId) => api.get(`/admin/classes/${classId}/teachers`),
   getAllClasses:      () => api.get('/admin/classes/all'),
   getUnassignedStudents: () => api.get('/admin/students/unassigned'),
   assignStudentToClass: (studentId, classId) => api.post(`/admin/students/${studentId}/assign-class/${classId}`),
   getSystemReports: () => api.get('/admin/system-reports'),
   getContentModeration: (p) => api.get('/admin/content-moderation', { params: p })
}

// ============================================================
// FILE: src/services/parentService.js
// ============================================================

export const parentService = {
  getChildren:      ()     => api.get('/parent/children'),
  getChildProgress: (id)   => api.get(`/parent/children/${id}/progress`),
  getChildRemarks:  (id)   => api.get(`/parent/children/${id}/remarks`),
  getChildAttendance: (id) => api.get(`/parent/children/${id}/attendance`),
  getChildPerformance: (id) => api.get(`/parent/children/${id}/performance`),
  getAnnouncements: (p)    => api.get('/parent/announcements', { params: p }),
  getDashboard:     ()     => api.get('/parent/dashboard'),
  getMessages:      (p)    => api.get('/parent/messages', { params: p }),
  sendMessage:      (data) => api.post('/parent/messages', data),
  getConversations: () => api.get('/parent/conversations'),
  getConversation:  (id) => api.get(`/parent/conversations/${id}`),
  getNotifications: (p) => api.get('/parent/notifications', { params: p })
}
