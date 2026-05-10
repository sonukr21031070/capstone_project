import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import '@/i18n'
import { DashboardLayout, LanguageSwitcher, ProtectedRoute } from '@/components/ComponentLibrary'
import { AdminDashboard, NotesPage, ParentDashboard, StudentDashboard, TeacherDashboard } from '@/pages/Dashboards'
import { AdminUsersPage, QuizListPage, TeacherCreateQuiz, TeacherUploadNote, TeacherUploadVideo } from '@/pages/AllPages'
import AnnouncementsPage from '@/pages/student/AnnouncementsPage'
import ProgressPage from '@/pages/student/ProgressPage'
import VideosPage from '@/pages/student/VideosPage'
import StudentExercisesPage from '@/pages/student/StudentExercisesPage'
import StudentExerciseSubmissionPage from '@/pages/student/StudentExerciseSubmissionPage'
import AdminApprovalsPage from '@/pages/admin/AdminApprovalsPage'
import AdminAnnouncementsPage from '@/pages/admin/AdminAnnouncementsPage'
import AdminSystemReportsPage from '@/pages/admin/AdminSystemReportsPage'
import AdminClassTeacherMappingPage from '@/pages/admin/AdminClassTeacherMappingPage'
import AdminUserManagementPage from '@/pages/admin/AdminUserManagementPage'
import AdminClassOverviewPage from '@/pages/admin/AdminClassOverviewPage'
import AdminStudentClassAssignmentPage from '@/pages/admin/AdminStudentClassAssignmentPage'
import TeacherNotesPage from '@/pages/teacher/TeacherNotesPage'
import TeacherQuizzesPage from '@/pages/teacher/TeacherQuizzesPage'
import TeacherVideosPage from '@/pages/teacher/TeacherVideosPage'
import TeacherExercisesPage from '@/pages/teacher/TeacherExercisesPage'
import TeacherRemarksPage from '@/pages/teacher/TeacherRemarksPage'
import TeacherGradingPage from '@/pages/teacher/TeacherGradingPage'
import ParentChildProgressPage from '@/pages/parent/ParentChildProgressPage'
import ParentChildRemarksPage from '@/pages/parent/ParentChildRemarksPage'
import ParentChildPerformancePage from '@/pages/parent/ParentChildPerformancePage'
import ParentNotificationsPage from '@/pages/parent/ParentNotificationsPage'
import ParentCommunicationPage from '@/pages/parent/ParentCommunicationPage'
import ParentAttendancePage from '@/pages/parent/ParentAttendancePage'
import { authService, useAuthStore } from '@/store/storeAndServices'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 }
  }
})

function RoleRedirect() {
  const user = useAuthStore(s => s.user)

  if (!user) return <Navigate to="/login" replace />

  return (
    <Navigate
      to={{ STUDENT: '/student', TEACHER: '/teacher', PARENT: '/parent', ADMIN: '/admin' }[user.role] || '/login'}
      replace
    />
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<RoleRedirect />} />
            <Route
              path="/unauthorized"
              element={(
                <div className="flex min-h-screen items-center justify-center text-red-600">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                  </div>
                </div>
              )}
            />

            <Route path="/student" element={<ProtectedRoute allowedRoles={['STUDENT']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<StudentDashboard />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="quizzes" element={<QuizListPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="videos" element={<VideosPage />} />
              <Route path="exercises" element={<StudentExercisesPage />} />
              <Route path="exercises/:exerciseId/submit" element={<StudentExerciseSubmissionPage />} />
            </Route>

            <Route path="/teacher" element={<ProtectedRoute allowedRoles={['TEACHER']}><DashboardLayout /></ProtectedRoute>}>
               <Route index element={<TeacherDashboard />} />
               <Route path="notes" element={<TeacherNotesPage />} />
               <Route path="notes/new" element={<TeacherUploadNote />} />
               <Route path="videos" element={<TeacherVideosPage />} />
               <Route path="videos/new" element={<TeacherUploadVideo />} />
               <Route path="quizzes" element={<TeacherQuizzesPage />} />
               <Route path="quizzes/new" element={<TeacherCreateQuiz />} />
               <Route path="quizzes/:quizId/responses" element={<TeacherGradingPage />} />
               <Route path="exercises" element={<TeacherExercisesPage />} />
               <Route path="exercises/new" element={<TeacherUploadNote />} />
               <Route path="exercises/:exerciseId/submissions" element={<TeacherGradingPage />} />
               <Route path="remarks" element={<TeacherRemarksPage />} />
             </Route>

            <Route path="/parent" element={<ProtectedRoute allowedRoles={['PARENT']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<ParentDashboard />} />
              <Route path="progress" element={<ParentChildProgressPage />} />
              <Route path="remarks" element={<ParentChildRemarksPage />} />
              <Route path="performance" element={<ParentChildPerformancePage />} />
              <Route path="attendance" element={<ParentAttendancePage />} />
              <Route path="notifications" element={<ParentNotificationsPage />} />
              <Route path="messages" element={<ParentCommunicationPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
            </Route>

            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><DashboardLayout /></ProtectedRoute>}>
               <Route index element={<AdminDashboard />} />
               <Route path="approvals" element={<AdminApprovalsPage />} />
               <Route path="users" element={<AdminUserManagementPage />} />
               <Route path="announcements" element={<AdminAnnouncementsPage />} />
               <Route path="reports" element={<AdminSystemReportsPage />} />
               <Route path="mappings" element={<AdminClassTeacherMappingPage />} />
               <Route path="classes" element={<AdminClassOverviewPage />} />
               <Route path="assign-students" element={<AdminStudentClassAssignmentPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '12px', fontSize: '14px' } }} />
    </QueryClientProvider>
  )
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
          <span className="text-lg font-bold text-white">EL</span>
        </div>
        <p className="text-sm text-gray-500 animate-pulse">Loading EdLearn...</p>
      </div>
    </div>
  )
}


export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState(null)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setLoginError(null)
    try {
      const res = await authService.login(data)
      if (res.success) {
        login(res.data)
        toast.success(`Welcome back, ${res.data.fullName}!`)
        navigate({ STUDENT: '/student', TEACHER: '/teacher', PARENT: '/parent', ADMIN: '/admin' }[res.data.role] || '/', { replace: true })
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Login failed'
      setLoginError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg">
            <span className="text-2xl font-bold text-white">EL</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('app.name')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('app.tagline')}</p>
          <div className="mt-3 flex justify-center"><LanguageSwitcher /></div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-xl font-bold text-gray-900">{t('auth.login')}</h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-gray-700">{t('auth.username')}</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                {...register('username', { required: 'Username is required' })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your username"
              />
              {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">{t('auth.password')}</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password', { required: 'Password is required' })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <LogIn size={18} />}
              {loading ? t('common.loading') : t('auth.loginBtn')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700">{t('auth.registerBtn')}</Link>
          </p>

          {loginError?.includes('waiting for admin approval') && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-center text-xs text-amber-800">⏳ {loginError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const CLASSES = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: `Class ${i + 1}` }))

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { role: 'STUDENT', language: 'HINDI' } })
  const role = watch('role')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await authService.register({
        ...data,
        classId: data.classId ? Number(data.classId) : undefined,
        experienceYrs: data.experienceYrs ? Number(data.experienceYrs) : undefined
      })
      if (res.success !== false) {
        toast.success('Registration successful! Awaiting admin approval.')
        navigate('/login', { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg">
            <span className="text-xl font-bold text-white">EL</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('auth.register')}</h1>
          <div className="mt-2 flex justify-center"><LanguageSwitcher /></div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label className={labelClass}>{t('auth.role')}</label>
              <div className="grid grid-cols-3 gap-2">
                {['STUDENT', 'TEACHER', 'PARENT'].map(r => (
                  <label
                    key={r}
                    className={`flex cursor-pointer items-center justify-center rounded-xl border-2 p-3 transition-colors ${role === r ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    <input type="radio" value={r} {...register('role')} className="sr-only" />
                    <span className="text-sm font-medium">{t(`auth.${r.toLowerCase()}`)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fullName" className={labelClass}>{t('auth.fullName')}</label>
                <input id="fullName" {...register('fullName', { required: 'Required' })} className={inputClass} placeholder="Your full name" />
                {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
              </div>
              <div>
                <label htmlFor="username" className={labelClass}>{t('auth.username')}</label>
                <input id="username" {...register('username', { required: 'Required', minLength: { value: 3, message: 'Min 3 chars' } })} className={inputClass} placeholder="username" />
                {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>{t('auth.email')}</label>
              <input id="email" type="email" {...register('email', { required: 'Required' })} className={inputClass} placeholder="email@example.com" />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className={labelClass}>{t('auth.password')}</label>
                <input id="password" type="password" {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} className={inputClass} placeholder="••••••" />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>{t('auth.phone')}</label>
                <input id="phone" {...register('phone')} className={inputClass} placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>

            <div>
              <label htmlFor="language" className={labelClass}>Preferred Language</label>
              <select id="language" {...register('language')} className={inputClass}>
                <option value="HINDI">हिंदी</option>
                <option value="PUNJABI">ਪੰਜਾਬੀ</option>
                <option value="ENGLISH">English</option>
              </select>
            </div>

            {role === 'STUDENT' && (
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div>
                  <label htmlFor="classId" className={labelClass}>{t('auth.class')}</label>
                  <select id="classId" {...register('classId', { required: role === 'STUDENT' })} className={inputClass}>
                    <option value="">Select class</option>
                    {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.classId && <p className="mt-1 text-xs text-red-600">Required</p>}
                </div>
                <div>
                  <label htmlFor="rollNumber" className={labelClass}>Roll Number</label>
                  <input id="rollNumber" {...register('rollNumber')} className={inputClass} placeholder="e.g. 23" />
                </div>
              </div>
            )}

            {role === 'TEACHER' && (
              <div className="space-y-3 rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="employeeId" className={labelClass}>Employee ID</label>
                    <input id="employeeId" {...register('employeeId')} className={inputClass} placeholder="EMP001" />
                  </div>
                  <div>
                    <label htmlFor="experienceYrs" className={labelClass}>Experience (yrs)</label>
                    <input id="experienceYrs" type="number" {...register('experienceYrs')} className={inputClass} placeholder="0" />
                  </div>
                </div>
                <div>
                  <label htmlFor="qualification" className={labelClass}>Qualification</label>
                  <input id="qualification" {...register('qualification')} className={inputClass} placeholder="B.Ed, M.A, etc." />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <UserPlus size={18} />}
              {loading ? t('common.loading') : t('auth.registerBtn')}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">{t('auth.loginBtn')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
