import { useTranslation } from 'react-i18next'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Mic, MicOff, Volume2, VolumeX, Pause, Play, WifiOff, RefreshCw, LayoutDashboard, BookOpen, Video, Brain, Dumbbell, TrendingUp, Bell, Users, Settings, LogOut, UserCheck, Menu, MessageSquare, BarChart3, MessageCircle, Calendar } from 'lucide-react'
import clsx from 'clsx'
import { useTextToSpeech, useSpeechToText, useOfflineSync, useAccessibility } from '@/hooks/Hooks'
import { useAuthStore } from '@/store/storeAndServices'

// TTS Button — reads any text aloud
export function TTSButton({ text, language, className }) {
  const { speak, stop, pause, resume, isSpeaking, isPaused } = useTextToSpeech()
  const { t } = useTranslation()

  if (!('speechSynthesis' in window)) return null

  return (
    <div className={clsx('flex items-center gap-1', className)}>
      {!isSpeaking ? (
        <button
          onClick={() => speak(text, { language })}
          aria-label={t('student.listenNote')}
          className="p-2 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title={t('student.listenNote')}
        >
          <Volume2 size={18} />
        </button>
      ) : (
        <>
          <button
            onClick={isPaused ? resume : pause}
            aria-label={isPaused ? 'Resume' : 'Pause'}
            className="p-2 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
          <button
            onClick={stop}
            aria-label="Stop"
            className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            <VolumeX size={18} />
          </button>
        </>
      )}
    </div>
  )
}

// STT Button — record voice answer
export function STTButton({ onResult, onStop, language, className }) {
  const { isListening, startListening, stopListening, transcript } = useSpeechToText()
  const { t } = useTranslation()

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return null

  const handleToggle = () => {
    if (isListening) {
      stopListening()
      onStop?.(transcript)
    } else {
      startListening({ language, onResult })
    }
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={t('student.speakAnswer')}
      className={clsx(
        'flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
        isListening
          ? 'bg-red-500 text-white focus:ring-red-500 animate-pulse'
          : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
        className
      )}
    >
      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      <span>{isListening ? 'रोकें / Stop' : t('student.speakAnswer')}</span>
    </button>
  )
}

// ============================================================
// FILE: src/components/common/LanguageSwitcher.jsx
// ============================================================
const LANGS = [
  { code: 'hi', label: 'हिंदी', key: 'HINDI' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', key: 'PUNJABI' },
  { code: 'en', label: 'English', key: 'ENGLISH' }
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const setLanguage = useAuthStore(s => s.setLanguage)

  const handleChange = (code, key) => {
    i18n.changeLanguage(code)
    setLanguage(key)
  }

  return (
    <div className="flex gap-1" role="group" aria-label="Select language">
      {LANGS.map(({ code, label, key }) => (
        <button
          key={code}
          onClick={() => handleChange(code, key)}
          aria-pressed={i18n.language === code}
          className={`px-3 py-1 text-sm rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            i18n.language === code
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ============================================================
// FILE: src/components/common/OfflineBanner.jsx
// ============================================================
export function OfflineBanner() {
  const { t } = useTranslation()
  const { isOnline, isSyncing, pendingCount, syncPendingAttempts } = useOfflineSync()

  if (isOnline && !pendingCount) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 text-sm font-medium ${
        isOnline ? 'bg-amber-500 text-white' : 'bg-gray-800 text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        <WifiOff size={16} aria-hidden="true" />
        <span>
          {!isOnline
            ? t('common.offline')
            : isSyncing
              ? t('common.syncing')
              : `${pendingCount} quiz(es) pending sync`}
        </span>
      </div>
      {isOnline && pendingCount > 0 && !isSyncing && (
        <button onClick={syncPendingAttempts} className="flex items-center gap-1 underline" aria-label="Sync now">
          <RefreshCw size={14} /> Sync now
        </button>
      )}
    </div>
  )
}

// ============================================================
// FILE: src/components/common/ProtectedRoute.jsx
// ============================================================
export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuth, user } = useAuthStore()
  const location = useLocation()

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

// ============================================================
// FILE: src/components/layout/Sidebar.jsx
// ============================================================
const STUDENT_NAV = [
  { to: '/student', icon: LayoutDashboard, key: 'nav.dashboard', end: true },
  { to: '/student/subjects', icon: BookOpen,      key: 'nav.subjects' },
  { to: '/student/notes',    icon: BookOpen,      key: 'nav.notes' },
  { to: '/student/videos',   icon: Video,         key: 'nav.videos' },
  { to: '/student/quizzes',  icon: Brain,         key: 'nav.quizzes' },
  { to: '/student/exercises',icon: Dumbbell,      key: 'nav.exercises' },
  { to: '/student/progress', icon: TrendingUp,    key: 'nav.progress' },
  { to: '/student/announcements', icon: Bell,     key: 'nav.announcements' }
]

const TEACHER_NAV = [
  { to: '/teacher',           icon: LayoutDashboard, key: 'nav.dashboard', end: true },
  { to: '/teacher/notes',     icon: BookOpen,        key: 'nav.notes' },
  { to: '/teacher/videos',    icon: Video,           key: 'nav.videos' },
  { to: '/teacher/quizzes',   icon: Brain,           key: 'nav.quizzes' },
  { to: '/teacher/exercises', icon: Dumbbell,        key: 'nav.exercises' },
  { to: '/teacher/remarks',   icon: MessageSquare,   key: 'teacher.remarks' }
]

const PARENT_NAV = [
  { to: '/parent',              icon: LayoutDashboard, key: 'nav.dashboard', end: true },
  { to: '/parent/progress',     icon: TrendingUp,      key: 'parent.childProgress' },
  { to: '/parent/remarks',      icon: MessageSquare,   key: 'parent.childRemarks' },
  { to: '/parent/performance',  icon: BarChart3,       key: 'parent.performance' },
  { to: '/parent/attendance',   icon: Calendar,        key: 'parent.attendance' },
  { to: '/parent/messages',     icon: MessageCircle,   key: 'parent.messages' },
  { to: '/parent/notifications',icon: Bell,            key: 'parent.notifications' },
  { to: '/parent/announcements',icon: Bell,            key: 'nav.announcements' }
]

const ADMIN_NAV = [
   { to: '/admin',             icon: LayoutDashboard, key: 'nav.dashboard', end: true },
   { to: '/admin/approvals',   icon: UserCheck,       key: 'admin.pendingApprovals' },
   { to: '/admin/users',       icon: Users,           key: 'admin.allStudents' },
   { to: '/admin/classes',     icon: BookOpen,        key: 'admin.classOverview' },
   { to: '/admin/assign-students',icon: UserCheck,    key: 'admin.assignStudents' },
   { to: '/admin/announcements',icon: Bell,           key: 'nav.announcements' },
   { to: '/admin/mappings',    icon: Settings,        key: 'admin.mappings' },
   { to: '/admin/reports',     icon: BarChart3,       key: 'admin.reports' }
]

const NAV_MAP = { STUDENT: STUDENT_NAV, TEACHER: TEACHER_NAV, PARENT: PARENT_NAV, ADMIN: ADMIN_NAV }

export function Sidebar({ onClose }) {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const navItems = NAV_MAP[user?.role] || []

  return (
    <aside
      className="flex flex-col h-full bg-gray-900 text-white w-64"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white text-sm">
          EL
        </div>
        <div>
          <p className="font-semibold text-sm">{t('app.name')}</p>
          <p className="text-xs text-gray-400">{user?.fullName}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul role="list" className="space-y-1">
          {navItems.map(({ to, icon: Icon, key, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400',
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{t(key)}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-red-900/40 hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <LogOut size={18} aria-hidden="true" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  )
}

// ============================================================
// FILE: src/components/layout/DashboardLayout.jsx
// ============================================================
import { useState } from 'react'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { highContrast, toggleContrast, largeText, toggleLargeText } = useAccessibility()

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <OfflineBanner />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — desktop always visible, mobile slide-in */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:static lg:z-auto lg:block
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <LanguageSwitcher />
            {/* Accessibility quick toggles */}
            <button
              onClick={toggleContrast}
              aria-pressed={highContrast}
              className="px-3 py-1 text-xs rounded-full border border-gray-300 hover:border-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Toggle high contrast"
            >
              {highContrast ? '🌑' : '☀️'} Contrast
            </button>
            <button
              onClick={toggleLargeText}
              aria-pressed={largeText}
              className="px-3 py-1 text-xs rounded-full border border-gray-300 hover:border-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Toggle large text"
            >
              A+
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
