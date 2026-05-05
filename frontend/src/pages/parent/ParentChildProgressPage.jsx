import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { BookOpen, Video, Brain, TrendingUp, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { parentService, useAuthStore } from '@/store/storeAndServices'
import { TTSButton } from '@/components/ComponentLibrary'

export default function ParentChildProgressPage() {
  const { t } = useTranslation()
  const [selectedChild, setSelectedChild] = useState(null)

  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ['parent-children'],
    queryFn: () => parentService.getChildren()
  })

  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['child-progress', selectedChild],
    queryFn: () => parentService.getChildProgress(selectedChild),
    enabled: !!selectedChild
  })

  const children = childrenData?.data || []
  const progress = progressData?.data || {}

  if (childrenLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
      </div>
    )
  }

  const statCards = [
    { label: 'Overall Score', value: `${progress.avgScore?.toFixed(0) || 0}%`, icon: TrendingUp, color: 'bg-blue-50 text-blue-700' },
    { label: 'Study Time', value: `${progress.timeSpentMins || 0}m`, icon: Clock, color: 'bg-purple-50 text-purple-700' },
    { label: 'Notes Read', value: progress.notesRead || 0, icon: BookOpen, color: 'bg-green-50 text-green-700' },
    { label: 'Videos Watched', value: progress.videosWatched || 0, icon: Video, color: 'bg-amber-50 text-amber-700' },
    { label: 'Quizzes Done', value: progress.quizzesTaken || 0, icon: Brain, color: 'bg-indigo-50 text-indigo-700' }
  ]

  const scoreColor = progress.avgScore >= 70 ? 'bg-green-500' : progress.avgScore >= 40 ? 'bg-amber-500' : 'bg-red-400'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('parent.childProgress')}</h1>
        <p className="text-gray-500 mt-1">Monitor your child's academic progress and performance</p>
      </div>

      {/* Child Selector */}
      <div className="flex flex-wrap gap-2">
        {children.map(child => (
          <button
            key={child.studentId}
            onClick={() => setSelectedChild(child.studentId)}
            aria-pressed={selectedChild === child.studentId}
            className={`px-4 py-2.5 rounded-xl font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              selectedChild === child.studentId
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
            }`}
          >
            {child.name}
          </button>
        ))}
      </div>

      {children.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-200">
          <AlertCircle size={40} className="mx-auto mb-3 opacity-30" />
          <p>No children linked to your account.</p>
          <p className="text-sm mt-1">Contact admin to link your child's account.</p>
        </div>
      )}

      {selectedChild && progressLoading && (
        <div className="space-y-4 animate-pulse">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl" />)}
        </div>
      )}

      {selectedChild && !progressLoading && (
        <>
          {/* Overall Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${color}`}>
                  <Icon size={18} aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Subject Progress */}
          {progress.subjectProgress && progress.subjectProgress.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress by Subject</h2>
              <div className="space-y-4">
                {progress.subjectProgress.map((sp, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{sp.subjectName}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{sp.avgScore?.toFixed(1) || 0}%</span>
                        <TTSButton text={`${sp.subjectName}, score ${sp.avgScore}`} />
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          sp.avgScore >= 70 ? 'bg-green-500' : sp.avgScore >= 40 ? 'bg-amber-500' : 'bg-red-400'
                        }`}
                        style={{ width: `${sp.avgScore || 0}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                      <div className="text-center">
                        <p className="text-gray-600">Notes</p>
                        <p className="font-bold text-gray-900">{sp.notesRead || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Videos</p>
                        <p className="font-bold text-gray-900">{sp.videosWatched || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Quizzes</p>
                        <p className="font-bold text-gray-900">{sp.quizzesTaken || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Time (m)</p>
                        <p className="font-bold text-gray-900">{sp.timeSpentMins || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chapter Progress */}
          {progress.chapterProgress && progress.chapterProgress.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Chapter-wise Progress</h2>
              <div className="space-y-3">
                {progress.chapterProgress.map((cp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{cp.chapterName}</p>
                      <p className="text-xs text-gray-500">{cp.subjectName}</p>
                    </div>
                    {cp.isComplete ? (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100">
                        <CheckCircle2 size={16} className="text-green-600" />
                        <span className="text-xs font-medium text-green-700">Complete</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{cp.progressPercent?.toFixed(0) || 0}%</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weak Areas Alert */}
          {progress.weakAreas && progress.weakAreas.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">Areas Needing Improvement</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {progress.weakAreas.map((area, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        {area}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-red-700 mt-3">Consider encouraging your child to focus more on these subjects or seeking additional support.</p>
                </div>
              </div>
            </div>
          )}

          {/* Study Streak */}
          {progress.studyStreak !== undefined && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-indigo-600">{progress.studyStreak || 0}</p>
                  <p className="text-sm text-indigo-700 font-medium">Day Streak</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">🔥 Keep it going!</p>
                  <p className="text-sm text-gray-500">Your child is doing great! Encourage them to maintain this consistency.</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

