import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { TrendingUp, TrendingDown, BarChart3, AlertCircle, Target, Zap, Award, Clock, AlertTriangle, BookOpen, Brain, Globe } from 'lucide-react'
import { parentService } from '@/store/storeAndServices'

export default function ParentChildPerformancePage() {
  const { t } = useTranslation()
  const [selectedChild, setSelectedChild] = useState(null)
  const [timeRange, setTimeRange] = useState('month') // week, month, year

  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ['parent-children'],
    queryFn: () => parentService.getChildren()
  })

  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['child-progress', selectedChild],
    queryFn: () => parentService.getChildProgress(selectedChild),
    enabled: !!selectedChild
  })

  const { data: performanceData } = useQuery({
    queryKey: ['child-performance', selectedChild],
    queryFn: () => parentService.getChildPerformance(selectedChild),
    enabled: !!selectedChild
  })

  const children = childrenData?.data || []
  const progress = progressData?.data || {}
  const performance = performanceData?.data || {}

  if (childrenLoading) {
    return <div className="space-y-4 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}</div>
  }

  if (!selectedChild && children.length > 0) {
    setSelectedChild(children[0].studentId)
  }

  const scoreMetrics = [
    { label: 'Current Score', value: `${progress.avgScore?.toFixed(1) || 0}%`, change: progress.scoreChange || 0, icon: BarChart3 },
    { label: 'Best Subject', value: progress.bestSubject || '—', change: null, icon: Award },
    { label: 'Study Streak', value: `${progress.studyStreak || 0}d`, change: progress.streakChange || 0, icon: Zap },
    { label: 'Avg. Daily Time', value: `${progress.avgDailyMins || 0}m`, change: progress.timeChange || 0, icon: Clock }
  ]

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp size={16} className="text-green-600" />
    if (change < 0) return <TrendingDown size={16} className="text-red-600" />
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
        <p className="text-gray-500 mt-1">Detailed analysis of your child's academic performance</p>
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
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
            }`}
          >
            {child.name}
          </button>
        ))}
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {['week', 'month', 'year'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              timeRange === range
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-400'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {selectedChild && (progressLoading ? (
        <div className="text-center py-8">Loading analytics...</div>
      ) : (
        <>
          {/* Score Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {scoreMetrics.map(({ label, value, change, icon: Icon }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{label}</p>
                  <Icon size={20} className="text-indigo-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
                {change !== null && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${getChangeColor(change)}`}>
                    {getChangeIcon(change)}
                    {change > 0 ? '+' : ''}{change}%
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Subject-wise Performance */}
          {(performance.subjectPerformance || []).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">Subject-wise Performance</h2>
              <div className="space-y-4">
                {performance.subjectPerformance.map(subject => (
                  <div key={subject.subjectId}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{subject.name}</span>
                      <span className="text-sm font-bold text-gray-900">{subject.score}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          subject.score >= 70 ? 'bg-green-500' :
                          subject.score >= 50 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        style={{width: `${subject.score}%`}}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Style Analysis */}
          {performance.learningStyle && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={20} className="text-blue-600" />
                  <p className="font-medium text-blue-900">Notes Reading</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{performance.learningStyle.notesPercentage || 0}%</p>
                <p className="text-xs text-blue-700 mt-1">Prefers text-based</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={20} className="text-purple-600" />
                  <p className="font-medium text-purple-900">Quiz Performance</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">{performance.learningStyle.quizPercentage || 0}%</p>
                <p className="text-xs text-purple-700 mt-1">Assessment strength</p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={20} className="text-indigo-600" />
                  <p className="font-medium text-indigo-900">Video Engagement</p>
                </div>
                <p className="text-2xl font-bold text-indigo-600">{performance.learningStyle.videoPercentage || 0}%</p>
                <p className="text-xs text-indigo-700 mt-1">Visual learner tendency</p>
              </div>
            </div>
          )}

          {/* Weak Areas Alert */}
          {(performance.weakAreas || []).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Areas Needing Attention</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {performance.weakAreas.map((area, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {(performance.recommendations || []).length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
              <Target size={20} className="text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Personalized Recommendations</p>
                <ul className="mt-2 space-y-1">
                  {performance.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-green-800">• {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      ))}
    </div>
  )
}
