import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, Mic, Plus, Trash2, Brain, Search, CheckCircle, XCircle, Ban, Clock, Star } from 'lucide-react'
import { teacherService, studentService, adminService } from '@/store/storeAndServices'
import { STTButton } from '@/components/ComponentLibrary'
import { QuizPlayer } from '@/components/quiz/QuizPlayer'
import toast from 'react-hot-toast'

export function TeacherUploadNote() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [tab, setTab] = useState('text') // 'text' | 'pdf'
  const [pdfFile, setPdfFile] = useState(null)
  const [voiceContent, setVoiceContent] = useState('')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { language: 'HINDI', isVoiceEnabled: true, isDownloadable: true }
  })
  const selectedClass = watch('classId')
  const selectedSubject = watch('subjectId')

  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => Promise.resolve({ data: [1,2,3,4,5,6,7,8].map(i => ({ id: i, name: `Class ${i}` })) })
  })

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => Promise.resolve({ data: [
      { id: 1, name: 'Mathematics' },
      { id: 2, name: 'Hindi' },
      { id: 3, name: 'English' },
      { id: 4, name: 'Science' },
      { id: 5, name: 'Social Studies' }
    ]})
  })

  const { data: chaptersData } = useQuery({
    queryKey: ['chapters', selectedSubject],
    queryFn: () => fetch(`/api/chapters?subjectId=${selectedSubject}`).then(r => r.json()).catch(() => ({ data: [] })),
    enabled: !!selectedSubject
  })

  const chapters = chaptersData?.data || []

  // ...existing code...

  const createMutation = useMutation({
    mutationFn: tab === 'text' ? teacherService.createNote : teacherService.uploadPdfNote,
    onSuccess: () => {
      toast.success('Note saved successfully!')
      navigate('/teacher')
    }
  })

  const onSubmit = (data) => {
    if (tab === 'text') {
      createMutation.mutate({ ...data, status: 'PUBLISHED' })
    } else {
      if (!pdfFile) { toast.error('Please select a PDF file'); return }
      const form = new FormData()
      form.append('file', pdfFile)
      form.append('classId', data.classId)
      form.append('subjectId', data.subjectId)
      form.append('chapterId', data.chapterId)
      form.append('title', data.title)
      createMutation.mutate(form)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5"

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{t('teacher.uploadNote')}</h1>
        <p className="text-gray-500 text-sm mt-1">Content will be visible only to students in the selected class</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        {[['text', 'Text Note'], ['pdf', 'Upload PDF']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              tab === key ? 'bg-white shadow text-indigo-700' : 'text-gray-600 hover:text-gray-800'
            }`} aria-pressed={tab === key}>
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">

        <div>
          <label htmlFor="title" className={labelClass}>Title</label>
          <input id="title" {...register('title', { required: 'Title is required' })}
            className={inputClass} placeholder="Note title" />
          {errors.title && <p role="alert" className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="classId" className={labelClass}>{t('teacher.selectClass')}</label>
            <select id="classId" {...register('classId', { required: 'Select a class' })} className={inputClass}>
              <option value="">Class</option>
              {[1,2,3,4,5,6,7,8].map(i => (
                <option key={i} value={i}>Class {i}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="subjectId" className={labelClass}>{t('teacher.selectSubject')}</label>
            <select id="subjectId" {...register('subjectId', { required: 'Select subject' })} className={inputClass}>
              <option value="">Subject</option>
              <option value="1">Mathematics</option>
              <option value="2">Hindi</option>
              <option value="3">English</option>
              <option value="4">Science</option>
              <option value="5">Social Studies</option>
            </select>
          </div>
          <div>
            <label htmlFor="chapterId" className={labelClass}>{t('teacher.selectChapter')}</label>
            <select id="chapterId" {...register('chapterId', { required: 'Select chapter' })} className={inputClass}>
              <option value="">Chapter</option>
              {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="language" className={labelClass}>Language</label>
          <select id="language" {...register('language')} className={inputClass}>
            <option value="HINDI">हिंदी</option>
            <option value="PUNJABI">ਪੰਜਾਬੀ</option>
            <option value="ENGLISH">English</option>
            <option value="MULTILINGUAL">Multilingual</option>
          </select>
        </div>

        {tab === 'text' ? (
          <>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="contentText" className={labelClass}>Content (Hindi)</label>
                <STTButton language="HINDI" onResult={(t) => setVoiceContent(prev => prev + ' ' + t)}
                  onStop={() => setValue('contentText', voiceContent)} />
              </div>
              <textarea id="contentText" {...register('contentText')}
                rows={6} className={`${inputClass} resize-none`}
                placeholder="Type or speak your note content in Hindi..." />
            </div>
            <div>
              <label htmlFor="contentHindi" className={labelClass}>Content (English)</label>
              <textarea id="contentHindi" {...register('contentHindi')}
                rows={4} className={`${inputClass} resize-none`} placeholder="English translation (optional)" />
            </div>
          </>
        ) : (
          <div>
            <label className={labelClass}>PDF File</label>
            <div className={`${inputClass} flex items-center justify-center h-32 cursor-pointer border-2 border-dashed`}
              onClick={() => document.getElementById('pdf-input').click()}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('pdf-input').click()}
              role="button" tabIndex={0} aria-label="Upload PDF file">
              <input id="pdf-input" type="file" accept=".pdf" className="sr-only"
                onChange={e => setPdfFile(e.target.files[0])} />
              <div className="text-center">
                <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">{pdfFile ? pdfFile.name : 'Click to upload PDF (max 200MB)'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Options */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('isVoiceEnabled')} className="rounded" defaultChecked />
            <span className="text-sm text-gray-700">Enable Text-to-Speech</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('isDownloadable')} className="rounded" defaultChecked />
            <span className="text-sm text-gray-700">Allow offline download</span>
          </label>
        </div>

        <button type="submit" disabled={createMutation.isPending}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
          {createMutation.isPending
            ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <FileText size={18} />
          }
          {createMutation.isPending ? 'Saving...' : t('common.save') + ' & Publish'}
        </button>
      </form>
    </div>
  )
}

export function TeacherCreateQuiz() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      quizType: 'MCQ', difficulty: 'MEDIUM', timeLimitMins: 30,
      totalMarks: 10, passMarks: 4, isVoiceEnabled: true,
      questions: [{ questionText: '', questionType: 'MCQ', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: 1 }]
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' })
  const quizType = watch('quizType')
  const selectedSubject = watch('subjectId')

  const { data: chaptersData } = useQuery({
    queryKey: ['chapters', selectedSubject],
    queryFn: () => fetch(`/api/student/chapters?subjectId=${selectedSubject}`).then(r => r.json()),
    enabled: !!selectedSubject
  })

  const chapters = chaptersData?.data || []

  // ...existing code...

  const createMutation = useMutation({
    mutationFn: teacherService.createQuiz,
    onSuccess: () => { toast.success('Quiz created and published!'); navigate('/teacher') }
  })

  const onSubmit = (data) => createMutation.mutate({ ...data, isPublished: true })

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{t('teacher.createQuiz')}</h1>
        <p className="text-gray-500 text-sm mt-1">Questions are class and chapter-specific. Difficulty auto-adapts per student.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Quiz meta */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">Quiz Details</h2>

          <input {...register('title', { required: 'Title required' })}
            className={inputClass} placeholder="Quiz title" />

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Class</label>
              <select {...register('classId', { required: true })} className={inputClass}>
                {[1,2,3,4,5,6,7,8].map(i => <option key={i} value={i}>Class {i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Subject</label>
              <select {...register('subjectId', { required: true })} className={inputClass}>
                <option value="1">Mathematics</option>
                <option value="2">Hindi</option>
                <option value="3">English</option>
                <option value="4">Science</option>
                <option value="5">Social Studies</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Chapter</label>
              <select {...register('chapterId', { required: true })} className={inputClass}>
                <option value="">Select Chapter</option>
                {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Type</label>
              <select {...register('quizType')} className={inputClass}>
                <option value="MCQ">MCQ</option>
                <option value="SUBJECTIVE">Subjective</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Difficulty</label>
              <select {...register('difficulty')} className={inputClass}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Total Marks</label>
              <input type="number" {...register('totalMarks')} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Time (min)</label>
              <input type="number" {...register('timeLimitMins')} className={inputClass} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('isVoiceEnabled')} defaultChecked className="rounded" />
            <span className="text-sm text-gray-700">Enable voice (Text-to-Speech + Speech-to-Text) for students</span>
          </label>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-900">Question {index + 1}</span>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(index)} aria-label={`Remove question ${index + 1}`}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <textarea {...register(`questions.${index}.questionText`, { required: true })}
                className={`${inputClass} resize-none mb-3`} rows={3}
                placeholder="Enter question in Hindi/English/Punjabi..." />

              <div className="grid grid-cols-2 gap-3 mb-3">
                <select {...register(`questions.${index}.questionType`)} className={inputClass}>
                  <option value="MCQ">MCQ</option>
                  <option value="SUBJECTIVE">Subjective</option>
                  <option value="TRUE_FALSE">True/False</option>
                </select>
                <input type="number" {...register(`questions.${index}.marks`)} className={inputClass} placeholder="Marks" defaultValue={1} />
              </div>

              {/* MCQ options */}
              {(quizType === 'MCQ' || quizType === 'MIXED') && (
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <div key={opt} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">{opt}</span>
                      <input {...register(`questions.${index}.option${opt}`)}
                        className={`${inputClass} flex-1`} placeholder={`Option ${opt}`} />
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-2">
                    <label className="text-sm text-gray-700 shrink-0">Correct Answer:</label>
                    <select {...register(`questions.${index}.correctAnswer`)} className={`${inputClass} w-auto`}>
                      {['A','B','C','D'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button type="button"
            onClick={() => append({ questionText: '', questionType: 'MCQ', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: 1 })}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <Plus size={18} /> Add Question
          </button>
        </div>

        <button type="submit" disabled={createMutation.isPending}
          className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 flex items-center justify-center gap-2">
          {createMutation.isPending
            ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Brain size={18} />
          }
          {createMutation.isPending ? 'Creating...' : 'Create & Publish Quiz'}
        </button>
      </form>
    </div>
  )
}

export function AdminUsersPage() {
  const { t } = useTranslation()
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', role, status, page],
    queryFn: () => adminService.getAllUsers({ page, size: 20, role: role || undefined, status: status || undefined })
  })

  const approveMutation = useMutation({
    mutationFn: adminService.approveUser,
    onSuccess: () => { toast.success('Approved'); queryClient.invalidateQueries(['admin-users']) }
  })
  const rejectMutation = useMutation({
    mutationFn: (id) => adminService.rejectUser(id),
    onSuccess: () => { toast.success('Rejected'); queryClient.invalidateQueries(['admin-users']) }
  })
  const suspendMutation = useMutation({
    mutationFn: adminService.suspendUser,
    onSuccess: () => { toast.success('Suspended'); queryClient.invalidateQueries(['admin-users']) }
  })

  const users = (data?.data?.content || []).filter(u =>
    !search || u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.includes(search)
  )

  const statusColor = { APPROVED: 'bg-green-100 text-green-700', PENDING: 'bg-amber-100 text-amber-700', REJECTED: 'bg-red-100 text-red-700', SUSPENDED: 'bg-gray-100 text-gray-600' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">User Management</h1>
        <span className="text-sm text-gray-500">{data?.data?.totalElements || 0} total users</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Search users" />
        </div>
        <select value={role} onChange={e => setRole(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Filter by role">
          <option value="">All Roles</option>
          <option value="STUDENT">Student</option>
          <option value="TEACHER">Teacher</option>
          <option value="PARENT">Parent</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Filter by status">
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td></tr>
                  ))
                : users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold shrink-0">
                            {user.fullName?.charAt(0)}
                          </div>
                          <span className="font-medium text-sm text-gray-900">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">{user.role}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[user.status] || ''}`}>{user.status}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1">
                          {user.status === 'PENDING' && (
                            <>
                              <button onClick={() => approveMutation.mutate(user.id)} aria-label={`Approve ${user.fullName}`}
                                className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500">
                                <CheckCircle size={16} />
                              </button>
                              <button onClick={() => rejectMutation.mutate(user.id)} aria-label={`Reject ${user.fullName}`}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500">
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {user.status === 'APPROVED' && (
                            <button onClick={() => suspendMutation.mutate(user.id)} aria-label={`Suspend ${user.fullName}`}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500">
                              <Ban size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              }
              {!isLoading && users.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-500 text-sm">{t('common.noData')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {data?.data?.totalPages > 1 && (
          <div className="flex justify-center gap-2 py-4 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
              className="px-4 py-1.5 rounded-lg border text-sm disabled:opacity-40">← Prev</button>
            <span className="px-4 py-1.5 text-sm">{page + 1} / {data.data.totalPages}</span>
            <button onClick={() => setPage(p => p+1)} disabled={page >= data.data.totalPages - 1}
              className="px-4 py-1.5 rounded-lg border text-sm disabled:opacity-40">Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}


export function QuizListPage() {
  const { t } = useTranslation()
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [chapters, setChapters] = useState([])
  const [activeQuiz, setActiveQuiz] = useState(null)

  const { data: subjectsData } = useQuery({ queryKey: ['student-subjects'], queryFn: studentService.getSubjects })

  const { data: chaptersData } = useQuery({
    queryKey: ['student-chapters', selectedSubject],
    queryFn: () => fetch(`/api/chapters?subjectId=${selectedSubject}`).then(r => r.json()).catch(() => ({ data: [] })),
    enabled: !!selectedSubject
  })

  const { data: quizzesData } = useQuery({
    queryKey: ['student-quizzes', selectedSubject, selectedChapter],
    queryFn: () => studentService.getQuizzes({ subjectId: selectedSubject, chapterId: selectedChapter }),
    enabled: !!selectedSubject
  })

  // Update chapters when chaptersData changes
  useEffect(() => {
    if (chaptersData?.data) {
      setChapters(chaptersData.data)
    }
  }, [chaptersData])

  if (activeQuiz) {
    return <QuizPlayer quiz={activeQuiz} onComplete={() => setActiveQuiz(null)} />
  }

  const subjects = subjectsData?.data || []
  const quizzes  = quizzesData?.data?.content || []

  const diffColor = { EASY: 'text-green-600 bg-green-50', MEDIUM: 'text-amber-600 bg-amber-50', HARD: 'text-red-600 bg-red-50' }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">{t('nav.quizzes')}</h1>

      <div className="flex flex-wrap gap-2">
        {subjects.map(s => (
          <button key={s.id} onClick={() => { setSelectedSubject(s.id); setSelectedChapter(null) }}
            aria-pressed={selectedSubject === s.id}
            className={`px-4 py-2 rounded-full text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              selectedSubject === s.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
            }`}>
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
        <div className="text-center py-16 text-gray-500">
          <Brain size={48} className="mx-auto mb-3 opacity-30" />
          <p>Select a subject to see available quizzes</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {quizzes.map(quiz => (
          <div key={quiz.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <Brain size={20} className="text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">{quiz.title}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{quiz.chapterTitle}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${diffColor[quiz.difficulty]}`}>
                    {quiz.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} /> {quiz.timeLimitMins}m
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Star size={12} /> {quiz.totalMarks} marks
                  </span>
                </div>
              </div>
            </div>
            <button onClick={() => setActiveQuiz(quiz)}
              className="w-full mt-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              {t('student.takeQuiz')} →
            </button>
          </div>
        ))}
        {quizzes.length === 0 && selectedSubject && (
          <div className="col-span-2 text-center py-12 text-gray-500">
            <p>No quizzes available for this subject yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function TeacherUploadVideo() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [videoFile, setVideoFile] = useState(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {}
  })

  const selectedSubject = watch('subjectId')

  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => Promise.resolve({ data: [1,2,3,4,5,6,7,8].map(i => ({ id: i, name: `Class ${i}` })) })
  })

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => Promise.resolve({ data: [
      { id: 1, name: 'Mathematics' },
      { id: 2, name: 'Hindi' },
      { id: 3, name: 'English' },
      { id: 4, name: 'Science' },
      { id: 5, name: 'Social Studies' }
    ]})
  })

  const { data: chaptersData } = useQuery({
    queryKey: ['chapters', selectedSubject],
    queryFn: () => fetch(`/api/chapters?subjectId=${selectedSubject}`).then(r => r.json()).catch(() => ({ data: [] })),
    enabled: !!selectedSubject
  })

  const chapters = chaptersData?.data || []

  // ...existing code...

  const createMutation = useMutation({
    mutationFn: teacherService.uploadVideo,
    onSuccess: () => {
      toast.success('Video uploaded successfully!')
      navigate('/teacher/videos')
    }
  })

  const onSubmit = (data) => {
    if (!videoFile) {
      toast.error('Please select a video file')
      return
    }

    const form = new FormData()
    form.append('video', videoFile)
    form.append('classId', data.classId)
    form.append('subjectId', data.subjectId)
    form.append('chapterId', data.chapterId)
    form.append('title', data.title)
    if (data.transcript) {
      form.append('transcript', data.transcript)
    }

    createMutation.mutate(form)
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5"

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{t('teacher.uploadVideo') || 'Upload Video'}</h1>
        <p className="text-gray-500 text-sm mt-1">Content will be visible only to students in the selected class</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">

        <div>
          <label htmlFor="title" className={labelClass}>Title</label>
          <input id="title" {...register('title', { required: 'Title is required' })}
            className={inputClass} placeholder="Video title" />
          {errors.title && <p role="alert" className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="transcript" className={labelClass}>Transcript / Description (Optional)</label>
          <textarea id="transcript" {...register('transcript')}
            rows={3} className={`${inputClass} resize-none`}
            placeholder="Brief description or transcript of the video (optional)" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="classId" className={labelClass}>{t('teacher.selectClass')}</label>
            <select id="classId" {...register('classId', { required: 'Select a class' })} className={inputClass}>
              <option value="">Class</option>
              {[1,2,3,4,5,6,7,8].map(i => (
                <option key={i} value={i}>Class {i}</option>
              ))}
            </select>
            {errors.classId && <p role="alert" className="text-xs text-red-600 mt-1">{errors.classId.message}</p>}
          </div>
          <div>
            <label htmlFor="subjectId" className={labelClass}>{t('teacher.selectSubject')}</label>
            <select id="subjectId" {...register('subjectId', { required: 'Select subject' })} className={inputClass}>
              <option value="">Subject</option>
              <option value="1">Mathematics</option>
              <option value="2">Hindi</option>
              <option value="3">English</option>
              <option value="4">Science</option>
              <option value="5">Social Studies</option>
            </select>
            {errors.subjectId && <p role="alert" className="text-xs text-red-600 mt-1">{errors.subjectId.message}</p>}
          </div>
          <div>
            <label htmlFor="chapterId" className={labelClass}>{t('teacher.selectChapter')}</label>
            <select id="chapterId" {...register('chapterId', { required: 'Select chapter' })} className={inputClass}>
              <option value="">Chapter</option>
              {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.chapterId && <p role="alert" className="text-xs text-red-600 mt-1">{errors.chapterId.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>Video File</label>
          <div className={`${inputClass} flex items-center justify-center h-40 cursor-pointer border-2 border-dashed`}
            onClick={() => document.getElementById('video-input').click()}
            onKeyDown={e => e.key === 'Enter' && document.getElementById('video-input').click()}
            role="button" tabIndex={0} aria-label="Upload video file">
            <input id="video-input" type="file" accept="video/*" className="sr-only"
              onChange={e => setVideoFile(e.target.files[0])} />
            <div className="text-center">
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">{videoFile ? videoFile.name : 'Click to upload video (mp4, mov, avi, mkv - max 500MB)'}</p>
            </div>
          </div>
        </div>

        <button type="submit" disabled={createMutation.isPending}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
          {createMutation.isPending
            ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Upload size={18} />
          }
          {createMutation.isPending ? 'Uploading...' : 'Upload & Publish Video'}
        </button>
      </form>
    </div>
  )
}
