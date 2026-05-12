import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { BookOpen, Video, Brain, TrendingUp, Bell, Download, FileText, File, Dumbbell, UserCheck, Users, CheckCircle, XCircle, AlertCircle, Clock, MessageSquare } from 'lucide-react'
import { studentService, teacherService, adminService, parentService, useAuthStore } from '@/store/storeAndServices'
import { TTSButton } from '@/components/ComponentLibrary'
import clsx from 'clsx'
import toast from 'react-hot-toast'

export function StudentDashboard() {
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => studentService.getDashboard()
  })

  const d = dashboard?.data

  const statCards = [
    { label: 'Notes Read',          value: d?.notesRead      ?? '—', icon: BookOpen, color: 'bg-blue-50 text-blue-700' },
    { label: 'Videos Watched',      value: d?.videosWatched  ?? '—', icon: Video,    color: 'bg-purple-50 text-purple-700' },
    { label: 'Quizzes Completed',   value: d?.quizzesTaken   ?? '—', icon: Brain,    color: 'bg-green-50 text-green-700' },
    { label: 'Avg Score',           value: d?.avgScore ? `${d.avgScore}%` : '—', icon: TrendingUp, color: 'bg-amber-50 text-amber-700' }
  ]

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            नमस्ते, {user?.fullName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">{t('student.mySubjects')} — Class {d?.className}</p>
        </div>
        {d && <TTSButton text={`Welcome ${user?.fullName}. You have read ${d.notesRead} notes and watched ${d.videosWatched} videos.`} />}
      </div>

      {/* Difficulty badge */}
      {d?.difficultyLevel && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
          role="status" aria-label={`Current difficulty: ${d.difficultyLevel}`}>
          <span>🎯</span>
          <span>Your level: </span>
          <span className={clsx(
            'font-bold',
            d.difficultyLevel === 'EASY'   && 'text-green-600',
            d.difficultyLevel === 'MEDIUM' && 'text-amber-600',
            d.difficultyLevel === 'HARD'   && 'text-red-600'
          )}>{d.difficultyLevel}</span>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent announcements */}
      {d?.announcements?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-indigo-600" aria-hidden="true" />
            <h2 className="font-semibold text-gray-900">{t('nav.announcements')}</h2>
          </div>
          <ul className="space-y-3">
            {d.announcements.slice(0, 3).map(a => (
              <li key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50">
                <span className={clsx(
                  'w-2 h-2 rounded-full mt-2 shrink-0',
                  a.priority === 'HIGH' ? 'bg-red-500' : a.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-green-500'
                )} aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.content?.slice(0, 100)}...</p>
                </div>
                <TTSButton text={`${a.title}. ${a.content}`} className="shrink-0" />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Performance Analytics */}
      {d?.performanceMetrics && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">📊 Your Performance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600">Exercises Completed</p>
              <p className="text-2xl font-bold text-blue-600">{d.performanceMetrics?.exercisesCompleted || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600">Avg Exercise Score</p>
              <p className="text-2xl font-bold text-green-600">{d.performanceMetrics?.avgExerciseScore || 0}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress by subject */}
      {d?.subjectProgress?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">{t('nav.progress')}</h2>
          <div className="space-y-4">
            {d.subjectProgress.map(sp => (
              <div key={sp.subjectId}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{sp.subjectName}</span>
                  <span className="text-gray-500">{sp.avgScore?.toFixed(0) || 0}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2" role="progressbar"
                  aria-valuenow={sp.avgScore || 0} aria-valuemax={100} aria-label={`${sp.subjectName} progress`}>
                  <div
                    className={clsx(
                      'h-2 rounded-full transition-all',
                      sp.avgScore >= 70 ? 'bg-green-500' : sp.avgScore >= 40 ? 'bg-amber-500' : 'bg-red-400'
                    )}
                    style={{ width: `${sp.avgScore || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-xl w-1/2" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
      <div className="h-48 bg-gray-200 rounded-2xl" />
    </div>
  )
}

export function NotesPage() {
  const { t } = useTranslation()
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [page, setPage] = useState(0)

  const { data: subjectsData } = useQuery({
    queryKey: ['student-subjects'],
    queryFn: () => studentService.getSubjects()
  })

   const { data: chaptersData } = useQuery({
     queryKey: ['student-chapters', selectedSubject],
     queryFn: () => studentService.getChapters({ subjectId: selectedSubject }),
     enabled: !!selectedSubject
   })

  const { data: notesData, isLoading } = useQuery({
    queryKey: ['student-notes', selectedSubject, selectedChapter, page],
    queryFn: () => studentService.getNotes({ subjectId: selectedSubject, chapterId: selectedChapter, page, size: 10 }),
    enabled: !!selectedSubject
  })

  const subjects = subjectsData?.data || []
  const chapters = chaptersData?.data || []
  const notes    = notesData?.data?.content || []

  const downloadForOffline = async (note) => {
    if (!note.pdfPath) return
    try {
      const response = await fetch(note.pdfPath)
      const blob = await response.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `${note.title}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Download failed')
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">{t('nav.notes')}</h1>

      {/* Subject filter */}
      <div className="flex flex-wrap gap-2">
        {subjects.map(s => (
          <button key={s.id} onClick={() => { setSelectedSubject(s.id); setSelectedChapter(null) }}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              selectedSubject === s.id
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
            }`}
            aria-pressed={selectedSubject === s.id}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Chapter filter - only show if subject selected and chapters exist */}
      {selectedSubject && chapters.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Filter by Chapter:</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedChapter(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedChapter === null
                  ? 'bg-gray-600 text-white border-gray-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}>
              All Chapters
            </button>
            {chapters.map(c => (
              <button key={c.id} onClick={() => setSelectedChapter(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedChapter === c.id
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                }`}
                aria-pressed={selectedChapter === c.id}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!selectedSubject && (
        <div className="text-center py-12 text-gray-500">
          <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
          <p>Select a subject to see notes</p>
        </div>
      )}

      {isLoading && <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}</div>}

      {/* Notes list */}
      <div className="space-y-3">
        {notes.map(note => (
          <article key={note.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                {note.noteType === 'PDF' ? <File size={20} className="text-indigo-600" /> : <FileText size={20} className="text-indigo-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">{note.title}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{note.chapterTitle} • {note.subjectName}</p>
                {note.contentText && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{note.contentText}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {note.isVoiceEnabled && note.contentText && (
                  <TTSButton text={`${note.title}. ${note.contentText}`} aria-label={`Listen to ${note.title}`} />
                )}
                {note.isDownloadable && (
                  <button onClick={() => downloadForOffline(note)}
                    aria-label={`Download ${note.title} for offline use`}
                    className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500">
                    <Download size={18} />
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
        {notes.length === 0 && selectedSubject && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>{t('common.noData')}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {notesData?.data?.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
            className="px-4 py-2 rounded-lg border disabled:opacity-40">← Prev</button>
          <span className="px-4 py-2">{page + 1} / {notesData.data.totalPages}</span>
          <button onClick={() => setPage(p => p+1)} disabled={page >= notesData.data.totalPages - 1}
            className="px-4 py-2 rounded-lg border disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  )
}

export function TeacherDashboard() {
  const { t } = useTranslation()
  const { data } = useQuery({ queryKey: ['teacher-dashboard'], queryFn: teacherService.getDashboard })
  const d = data?.data

  const quickActions = [
    { label: t('teacher.uploadNote'),    icon: BookOpen, href: '/teacher/notes/new',     color: 'bg-blue-600' },
    { label: t('teacher.uploadVideo'),   icon: Video,    href: '/teacher/videos/new',    color: 'bg-purple-600' },
    { label: t('teacher.createQuiz'),    icon: Brain,    href: '/teacher/quizzes/new',   color: 'bg-green-600' },
    { label: t('teacher.createExercise'),icon: Dumbbell, href: '/teacher/exercises/new', color: 'bg-amber-600' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your content and track student engagement</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Notes Published', value: d?.notesCount ?? 0 },
          { label: 'Videos Uploaded', value: d?.videosCount ?? 0 },
          { label: 'Quizzes Created', value: d?.quizzesCount ?? 0 },
          { label: 'Students Taught', value: d?.studentsCount ?? 0 }
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ label, icon: Icon, href, color }) => (
            <a key={label} href={href}
              className={`${color} text-white rounded-2xl p-5 flex flex-col items-center gap-3 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              <Icon size={28} aria-hidden="true" />
              <span className="text-sm font-medium text-center">{label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Recent content */}
      {d?.recentNotes && d.recentNotes.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Notes</h2>
          <ul className="divide-y divide-gray-100">
            {d.recentNotes.map(n => (
              <li key={n.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-500">{n.chapterTitle} • Class {n.className}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  n.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>{n.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function AdminDashboard() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getDashboardStats
  })
  const { data: pendingData } = useQuery({
    queryKey: ['pending-users'],
    queryFn: () => adminService.getPendingUsers({ page: 0, size: 10 })
  })

  const approveMutation = useMutation({
    mutationFn: adminService.approveUser,
    onSuccess: () => { toast.success('User approved'); queryClient.invalidateQueries(['pending-users', 'admin-stats']) }
  })
  const rejectMutation = useMutation({
    mutationFn: (id) => adminService.rejectUser(id),
    onSuccess: () => { toast.success('User rejected'); queryClient.invalidateQueries(['pending-users', 'admin-stats']) }
  })

  const stats = statsData?.data
  const pending = pendingData?.data?.content || []

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents ?? 0, color: 'text-blue-600' },
    { label: 'Total Teachers', value: stats?.totalTeachers ?? 0, color: 'text-green-600' },
    { label: 'Total Parents',  value: stats?.totalParents  ?? 0, color: 'text-purple-600' },
    { label: 'Pending Approvals', value: stats?.pendingCount ?? 0, color: 'text-red-600' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage users, content, and announcements</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending approvals */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <UserCheck size={18} className="text-indigo-600" aria-hidden="true" />
          <h2 className="font-semibold text-gray-900">{t('admin.pendingApprovals')}</h2>
          {pending.length > 0 && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
              {pending.length}
            </span>
          )}
        </div>
        {pending.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle size={40} className="mx-auto mb-3 text-green-400" />
            <p>All caught up! No pending approvals.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {pending.map(user => (
              <li key={user.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm shrink-0">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">{user.email} • {user.role}</p>
                  <p className="text-xs text-gray-400">Registered: {new Date(user.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveMutation.mutate(user.id)}
                    disabled={approveMutation.isPending}
                    aria-label={`Approve ${user.fullName}`}
                    className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                  </button>
                  <button
                    onClick={() => rejectMutation.mutate(user.id)}
                    disabled={rejectMutation.isPending}
                    aria-label={`Reject ${user.fullName}`}
                    className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}


export function ParentDashboard() {
  const { t } = useTranslation()
  const { data } = useQuery({ queryKey: ['parent-dashboard'], queryFn: parentService.getDashboard })
  const d = data?.data
  const children = d?.children || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('parent.myChildren')}</h1>
        <p className="text-gray-500 mt-1">Monitor your child's learning progress</p>
      </div>

      {children.map(child => (
        <div key={child.studentId} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Child header */}
          <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700">
                {child.name?.charAt(0)}
              </div>
              <div>
                <h2 className="font-bold text-gray-900">{child.name}</h2>
                <p className="text-sm text-gray-500">{child.className} • Roll No: {child.rollNumber}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-bold text-indigo-600">{child.avgScore?.toFixed(0) || 0}%</p>
                <p className="text-xs text-gray-500">Overall Score</p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 px-0">
            {[
              { label: t('parent.studyTime'),   value: `${child.timeSpentMins || 0}m`, icon: Clock },
              { label: 'Quizzes Done',          value: child.quizzesTaken || 0,         icon: TrendingUp },
              { label: t('parent.weakSubjects'), value: child.weakSubjectsCount || 0,   icon: AlertCircle }
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center py-4 gap-1">
                <Icon size={18} className="text-gray-400" />
                <p className="font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 text-center">{label}</p>
              </div>
            ))}
          </div>

          {/* Weak subjects */}
          {child.weakSubjects?.length > 0 && (
            <div className="px-5 pb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">{t('parent.weakSubjects')}</p>
              <div className="flex flex-wrap gap-2">
                {child.weakSubjects.map(s => (
                  <span key={s} className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Teacher remarks */}
          {child.latestRemark && (
            <div className="mx-5 mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
              <MessageSquare size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-amber-800">Teacher's Remark</p>
                <p className="text-sm text-amber-700 mt-0.5">{child.latestRemark}</p>
              </div>
            </div>
          )}
        </div>
      ))}

      {children.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-200">
          <p>No children linked to your account yet.</p>
          <p className="text-sm mt-1">Contact the admin to link your child's account.</p>
        </div>
      )}
    </div>
  )
}
