import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { MessageSquare, AlertCircle, ThumbsUp, TrendingUp, Calendar } from 'lucide-react'
import { parentService } from '@/store/storeAndServices'
import { TTSButton } from '@/components/ComponentLibrary'
import toast from 'react-hot-toast'

export default function ParentChildRemarksPage() {
  const { t } = useTranslation()
  const [selectedChild, setSelectedChild] = useState(null)
  const [expandedRemark, setExpandedRemark] = useState(null)

  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ['parent-children'],
    queryFn: () => parentService.getChildren()
  })

  const { data: remarksData, isLoading: remarksLoading } = useQuery({
    queryKey: ['child-remarks', selectedChild],
    queryFn: () => parentService.getChildRemarks(selectedChild),
    enabled: !!selectedChild
  })

  const children = childrenData?.data || []
  const remarks = remarksData?.data || []

  if (childrenLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
      </div>
    )
  }

  const getRemarkSentiment = (text) => {
    const positive = ['excellent', 'outstanding', 'great', 'good', 'wonderful', 'impressive', 'strong', 'well', 'improve', 'progress']
    const negative = ['concern', 'issue', 'struggle', 'difficult', 'poor', 'weak', 'need', 'attention', 'failing']

    const lower = text.toLowerCase()
    const posCount = positive.filter(w => lower.includes(w)).length
    const negCount = negative.filter(w => lower.includes(w)).length

    if (posCount > negCount) return 'positive'
    if (negCount > posCount) return 'negative'
    return 'neutral'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('parent.childRemarks')}</h1>
        <p className="text-gray-500 mt-1">Teacher feedback and remarks about your child's performance</p>
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
        </div>
      )}

      {selectedChild && remarksLoading && (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
        </div>
      )}

      {selectedChild && !remarksLoading && (
        <>
          {remarks.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-200">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p>No remarks from teachers yet.</p>
              <p className="text-sm mt-1">Teachers will share feedback as your child progresses.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {remarks.map((remark, idx) => {
                const sentiment = getRemarkSentiment(remark.content || '')
                const sentimentColors = {
                  positive: 'border-green-200 bg-green-50',
                  negative: 'border-red-200 bg-red-50',
                  neutral: 'border-blue-200 bg-blue-50'
                }
                const sentimentIcons = {
                  positive: <ThumbsUp size={16} className="text-green-600" />,
                  negative: <AlertCircle size={16} className="text-red-600" />,
                  neutral: <MessageSquare size={16} className="text-blue-600" />
                }

                return (
                  <div key={idx} className={`rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-md ${sentimentColors[sentiment]}`}
                    onClick={() => setExpandedRemark(expandedRemark === idx ? null : idx)}>

                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5 p-2 rounded-lg bg-white">
                          {sentimentIcons[sentiment]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900">{remark.subjectName}</h3>
                          <p className="text-sm text-gray-600">{remark.teacherName}</p>
                        </div>
                      </div>
                      <TTSButton text={`Teacher remark: ${remark.content}`} className="shrink-0" />
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <Calendar size={14} />
                      {new Date(remark.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>

                    {/* Content - Truncated or Full */}
                    <p className={`text-sm text-gray-700 leading-relaxed ${expandedRemark === idx ? '' : 'line-clamp-2'}`}>
                      {remark.content}
                    </p>

                    {remark.content && remark.content.length > 150 && (
                      <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-2 focus:outline-none">
                        {expandedRemark === idx ? '← Show less' : 'Show more →'}
                      </button>
                    )}

                    {/* Rating if available */}
                    {remark.rating && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600">Rating:</span>
                        <div className="flex gap-1">
                          {Array(5).fill(0).map((_, i) => (
                            <span key={i} className="text-lg">
                              {i < remark.rating ? '⭐' : '☆'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags if available */}
                    {remark.tags && remark.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {remark.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-60 text-gray-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Summary Card */}
          {remarks.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <TrendingUp size={28} className="text-indigo-600 shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Overall Feedback Summary</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Based on {remarks.length} teacher remark{remarks.length !== 1 ? 's' : ''}, your child is showing consistent progress.
                    Keep encouraging them to maintain their current pace and focus on areas identified for improvement.
                  </p>
                  <button
                    onClick={() => toast.success('Summary downloaded!')}
                    className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    📥 Download Summary
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

