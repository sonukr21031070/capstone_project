// ============================================================
// FILE: src/hooks/useVoice.js
// Voice-first interaction: TTS + STT with Hindi/Punjabi/English support
// ============================================================
import { useState, useRef, useCallback, useEffect } from 'react'
import { useAuthStore } from '@/store/storeAndServices'

const LANGUAGE_CODES = {
  HINDI:   'hi-IN',
  PUNJABI: 'pa-IN',
  ENGLISH: 'en-IN'
}

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused,   setIsPaused]   = useState(false)
  const utteranceRef = useRef(null)
  const user = useAuthStore(s => s.user)

  const getVoice = (langCode) => {
    const voices = window.speechSynthesis.getVoices()
    return voices.find(v => v.lang === langCode || v.lang.startsWith(langCode.split('-')[0]))
  }

  const speak = useCallback((text, options = {}) => {
    if (!window.speechSynthesis) return

    window.speechSynthesis.cancel()

    const langCode = LANGUAGE_CODES[options.language || user?.language || 'HINDI']
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang  = langCode
    utterance.rate  = options.rate  ?? 0.85   // Slower for kids
    utterance.pitch = options.pitch ?? 1.0
    utterance.volume= options.volume ?? 1.0

    // Try to find matching voice
    const voice = getVoice(langCode)
    if (voice) utterance.voice = voice

    utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false) }
    utterance.onend   = () => { setIsSpeaking(false); setIsPaused(false); options.onEnd?.() }
    utterance.onerror = () => { setIsSpeaking(false) }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [user?.language])

  const pause  = useCallback(() => { window.speechSynthesis.pause();  setIsPaused(true)  }, [])
  const resume = useCallback(() => { window.speechSynthesis.resume(); setIsPaused(false) }, [])
  const stop   = useCallback(() => { window.speechSynthesis.cancel(); setIsSpeaking(false); setIsPaused(false) }, [])

  // Clean up on unmount
  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  return { speak, pause, resume, stop, isSpeaking, isPaused }
}

export function useSpeechToText() {
  const [transcript, setTranscript]   = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError]             = useState(null)
  const recognitionRef = useRef(null)
  const user = useAuthStore(s => s.user)

  const startListening = useCallback((options = {}) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang        = LANGUAGE_CODES[options.language || user?.language || 'HINDI']
    recognition.continuous  = options.continuous  ?? true
    recognition.interimResults = options.interim  ?? true
    recognition.maxAlternatives = 1

    recognition.onstart  = () => { setIsListening(true); setError(null) }
    recognition.onresult = (event) => {
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript
      }
      if (final) {
        setTranscript(prev => prev + ' ' + final)
        options.onResult?.(final)
      }
    }
    recognition.onerror = (event) => {
      setError(event.error)
      setIsListening(false)
    }
    recognition.onend = () => {
      setIsListening(false)
      options.onEnd?.()
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [user?.language])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const clearTranscript = useCallback(() => setTranscript(''), [])

  return { transcript, isListening, error, startListening, stopListening, clearTranscript }
}

const OFFLINE_QUIZ_KEY = 'edlearn_offline_quizzes'

export function useOfflineSync() {
  const [isOnline, setIsOnline]     = useState(navigator.onLine)
  const [isSyncing, setIsSyncing]   = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const goOnline  = () => { setIsOnline(true);  syncPendingAttempts() }
    const goOffline = () => setIsOnline(false)

    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  useEffect(() => {
    const pending = getOfflineAttempts()
    setPendingCount(pending.length)
  }, [isOnline])

  const getOfflineAttempts = () => {
    try { return JSON.parse(localStorage.getItem(OFFLINE_QUIZ_KEY) || '[]') }
    catch { return [] }
  }

  const saveOfflineAttempt = useCallback((quizId, answers) => {
    const attempts = getOfflineAttempts()
    attempts.push({ quizId, answers, savedAt: new Date().toISOString() })
    localStorage.setItem(OFFLINE_QUIZ_KEY, JSON.stringify(attempts))
    setPendingCount(attempts.length)
  }, [])

  const syncPendingAttempts = useCallback(async () => {
    const pending = getOfflineAttempts()
    if (!pending.length || !navigator.onLine) return

    setIsSyncing(true)
    const synced = []

    for (const attempt of pending) {
      try {
        await studentService.submitQuiz(attempt.quizId, { answers: attempt.answers, isOffline: true })
        synced.push(attempt)
      } catch (_) {
        // Keep for next sync
      }
    }

    const remaining = pending.filter(a => !synced.includes(a))
    localStorage.setItem(OFFLINE_QUIZ_KEY, JSON.stringify(remaining))
    setPendingCount(remaining.length)
    setIsSyncing(false)
  }, [])

  return { isOnline, isSyncing, pendingCount, saveOfflineAttempt, syncPendingAttempts }
}


export function useAccessibility() {
  const [highContrast, setHighContrast] = useState(
    () => localStorage.getItem('a11y-contrast') === 'true'
  )
  const [largeText, setLargeText] = useState(
    () => localStorage.getItem('a11y-large-text') === 'true'
  )

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast)
    localStorage.setItem('a11y-contrast', highContrast)
  }, [highContrast])

  useEffect(() => {
    document.documentElement.classList.toggle('large-text', largeText)
    localStorage.setItem('a11y-large-text', largeText)
  }, [largeText])

  return {
    highContrast, toggleContrast: () => setHighContrast(p => !p),
    largeText,    toggleLargeText: () => setLargeText(p => !p)
  }
}
