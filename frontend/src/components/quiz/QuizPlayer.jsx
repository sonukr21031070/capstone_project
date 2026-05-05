// ============================================================
// FILE: src/components/quiz/QuizPlayer.jsx
// Voice-enabled quiz player with adaptive difficulty
// ============================================================
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, Clock, Mic, Volume2 } from 'lucide-react'
import { TTSButton, STTButton } from '@/components/ComponentLibrary'
import { useOfflineSync } from '@/hooks/Hooks'
import { studentService } from '@/store/storeAndServices'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export function QuizPlayer({ quiz, onComplete }) {
  const { t } = useTranslation()
  const { isOnline, saveOfflineAttempt } = useOfflineSync()
  const [currentIdx, setCurrentIdx]   = useState(0)
  const [answers, setAnswers]         = useState({})
  const [voiceAnswers, setVoiceAnswers] = useState({})
  const [submitted, setSubmitted]     = useState(false)
  const [result, setResult]           = useState(null)
  const [timeLeft, setTimeLeft]       = useState((quiz.timeLimitMins || 30) * 60)
  const [showConfidence, setShowConfidence] = useState(false)
  const timerRef = useRef(null)

  const questions = quiz.questions || []
  const currentQ  = questions[currentIdx]

  // Timer countdown
  useEffect(() => {
    if (submitted) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [submitted])

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleMCQAnswer = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }))
  }

  const handleVoiceAnswer = (questionId, transcript) => {
    setVoiceAnswers(prev => ({ ...prev, [questionId]: transcript }))
    setAnswers(prev => ({ ...prev, [questionId]: transcript }))
  }

  const handleSubmit = async () => {
    clearInterval(timerRef.current)

    const payload = {
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId: Number(questionId),
        answerText: answer,
        isVoiceAnswer: !!voiceAnswers[questionId]
      }))
    }

    try {
      if (isOnline) {
        const res = await studentService.submitQuiz(quiz.id, payload)
        setResult(res.data)
      } else {
        saveOfflineAttempt(quiz.id, payload.answers)
        setResult({ offline: true, message: 'Saved offline — will sync when connected' })
      }
      setSubmitted(true)
      setShowConfidence(true)
    } catch (err) {
      toast.error('Failed to submit quiz')
    }
  }

  const handleConfidence = async (level) => {
    try {
      await studentService.recordConfidence(quiz.chapter?.id, level)
    } catch (_) {}
    setShowConfidence(false)
    onComplete?.(result)
  }

  if (showConfidence) {
    return <ConfidenceMeter onSelect={handleConfidence} result={result} />
  }

  if (submitted && result) {
    return <QuizResult result={result} quiz={quiz} onClose={() => onComplete?.(result)} />
  }

  if (!currentQ) return null

  return (
    <div className="max-w-2xl mx-auto" role="main" aria-label="Quiz player">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-sm text-gray-500">
            {t('student.difficulty')}: <span className={clsx(
              'font-medium',
              quiz.difficulty === 'EASY'   && 'text-green-600',
              quiz.difficulty === 'MEDIUM' && 'text-amber-600',
              quiz.difficulty === 'HARD'   && 'text-red-600'
            )}>{quiz.difficulty}</span>
          </p>
        </div>
        <div className={clsx(
          'flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-lg',
          timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
        )} aria-live="polite" aria-label={`Time remaining: ${formatTime(timeLeft)}`}>
          <Clock size={18} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar"
          aria-valuenow={currentIdx + 1} aria-valuemax={questions.length}>
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-4">
        <div className="flex items-start justify-between gap-3 mb-5">
          <p className="text-lg font-medium text-gray-900 leading-relaxed flex-1" id="question-text">
            {currentQ.questionText}
          </p>
          {quiz.isVoiceEnabled && (
            <TTSButton
              text={currentQ.questionText}
              className="shrink-0 mt-1"
              aria-label="Read question aloud"
            />
          )}
        </div>

        {/* MCQ Options */}
        {currentQ.questionType === 'MCQ' || currentQ.questionType === 'TRUE_FALSE' ? (
          <div className="space-y-3" role="radiogroup" aria-labelledby="question-text">
            {['A', 'B', 'C', 'D'].filter(opt => currentQ[`option${opt}`]).map(opt => (
              <button
                key={opt}
                role="radio"
                aria-checked={answers[currentQ.id] === opt}
                onClick={() => handleMCQAnswer(currentQ.id, opt)}
                className={clsx(
                  'w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500',
                  answers[currentQ.id] === opt
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                )}
              >
                <span className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                  answers[currentQ.id] === opt
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                )}>{opt}</span>
                <span>{currentQ[`option${opt}`]}</span>
                {quiz.isVoiceEnabled && (
                  <TTSButton text={currentQ[`option${opt}`]} className="ml-auto" />
                )}
              </button>
            ))}
          </div>
        ) : (
          /* Subjective answer */
          <div>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={5}
              placeholder="Write your answer here..."
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleMCQAnswer(currentQ.id, e.target.value)}
              aria-label="Your answer"
            />
            {quiz.isVoiceEnabled && (
              <div className="mt-3">
                <STTButton
                  onResult={(t) => handleMCQAnswer(currentQ.id, (answers[currentQ.id] || '') + ' ' + t)}
                  onStop={(t) => handleMCQAnswer(currentQ.id, t)}
                />
                {voiceAnswers[currentQ.id] && (
                  <p className="text-xs text-gray-500 mt-2">
                    🎤 Voice: {voiceAnswers[currentQ.id].slice(0, 100)}...
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium disabled:opacity-40 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          ← Previous
        </button>
        {currentIdx < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIdx(i => i + 1)}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Submit Quiz ✓
          </button>
        )}
      </div>

      {/* Question dots navigation */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center" aria-label="Question navigation">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => setCurrentIdx(i)}
            aria-label={`Question ${i + 1}${answers[q.id] ? ' (answered)' : ''}`}
            className={clsx(
              'w-8 h-8 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500',
              i === currentIdx   && 'bg-indigo-600 text-white',
              answers[q.id] && i !== currentIdx && 'bg-green-500 text-white',
              !answers[q.id] && i !== currentIdx && 'bg-gray-200 text-gray-600'
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

// Confidence meter after lesson
function ConfidenceMeter({ onSelect, result }) {
  const { t } = useTranslation()
  const levels = [
    { key: 'LOW',    emoji: '😟', label: t('student.confidence.low'),    color: 'bg-red-100 text-red-800 border-red-300' },
    { key: 'MEDIUM', emoji: '😐', label: t('student.confidence.medium'), color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { key: 'HIGH',   emoji: '😊', label: t('student.confidence.high'),   color: 'bg-green-100 text-green-800 border-green-300' }
  ]

  return (
    <div className="max-w-md mx-auto text-center py-12">
      {result && !result.offline && (
        <div className="mb-8 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-3xl font-bold text-indigo-600">{result.data?.percentage?.toFixed(0)}%</p>
          <p className="text-gray-600">Score: {result.data?.score} / {result.data?.totalMarks}</p>
        </div>
      )}
      <h2 className="text-xl font-bold text-gray-900 mb-2">{t('student.confidence.how_confident')}</h2>
      <p className="text-gray-500 text-sm mb-6">Your response helps us personalise your learning</p>
      <div className="flex gap-4 justify-center">
        {levels.map(({ key, emoji, label, color }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 ${color} hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            <span className="text-4xl">{emoji}</span>
            <span className="font-medium text-sm">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Quiz result screen
function QuizResult({ result, quiz, onClose }) {
  const data = result?.data
  const pass = data && data.percentage >= quiz.passMarks / quiz.totalMarks * 100

  return (
    <div className="max-w-md mx-auto text-center py-12" role="status" aria-live="polite">
      <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
        result?.offline ? 'bg-amber-100' : pass ? 'bg-green-100' : 'bg-red-100'
      }`}>
        {result?.offline
          ? <span className="text-3xl">📡</span>
          : pass
            ? <CheckCircle size={40} className="text-green-600" />
            : <XCircle   size={40} className="text-red-600" />
        }
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {result?.offline ? 'Saved Offline' : pass ? 'Great job! 🎉' : 'Keep practising! 💪'}
      </h2>
      {data && (
        <div className="grid grid-cols-3 gap-4 my-6 p-4 bg-white rounded-2xl border border-gray-200">
          <div>
            <p className="text-2xl font-bold text-indigo-600">{data.percentage?.toFixed(0)}%</p>
            <p className="text-xs text-gray-500">{quiz.difficulty}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-700">{data.score}/{data.totalMarks}</p>
            <p className="text-xs text-gray-500">Score</p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${pass ? 'text-green-600' : 'text-red-500'}`}>
              {pass ? 'PASS' : 'FAIL'}
            </p>
            <p className="text-xs text-gray-500">Result</p>
          </div>
        </div>
      )}
      {result?.offline && (
        <p className="text-amber-700 text-sm bg-amber-50 rounded-xl p-3 mb-4">{result.message}</p>
      )}
      <button onClick={onClose} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
        Continue Learning
      </button>
    </div>
  )
}
