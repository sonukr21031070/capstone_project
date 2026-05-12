import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, TrashIcon, FileText, File, Download } from 'lucide-react'
import { teacherService } from '@/store/storeAndServices'
import toast from 'react-hot-toast'

export default function TeacherNotesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: notesData, isLoading, error } = useQuery({
    queryKey: ['teacher-notes-list'],
    queryFn: () => teacherService.getMyNotes({ page: 0, size: 50 })
  })

  const deleteMutation = useMutation({
    mutationFn: teacherService.deleteNote,
    onSuccess: () => {
      toast.success('Note deleted successfully')
      queryClient.invalidateQueries(['teacher-notes-list'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete note')
    }
  })

  const notes = notesData?.data?.content || []

  const handleDelete = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate(noteId)
    }
  }

  const downloadPdf = (pdfPath, title) => {
    if (!pdfPath) return
    const a = document.createElement('a')
    a.href = pdfPath
    a.download = `${title}.pdf`
    a.click()
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('nav.notes') || 'My Notes'}</h1>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-600 font-medium">Error loading notes</p>
          <p className="text-sm text-red-500 mt-1">{error?.message || 'Please try again'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.notes') || 'My Notes'}</h1>
          <p className="text-gray-500 mt-1">Manage your uploaded notes</p>
        </div>
        <button
          onClick={() => navigate('/teacher/notes/new')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus size={18} />
          {t('teacher.uploadNote') || 'Upload Note'}
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && notes.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
          <FileText size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 font-medium">No notes yet</p>
          <p className="text-sm text-gray-500 mt-1">Start by uploading your first note</p>
          <button
            onClick={() => navigate('/teacher/notes/new')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Upload Note
          </button>
        </div>
      )}

      {/* Notes list */}
      {!isLoading && notes.length > 0 && (
        <div className="space-y-3">
          {notes.map(note => (
            <article
              key={note.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                  {note.noteType === 'PDF' ? (
                    <File size={24} className="text-indigo-600" />
                  ) : (
                    <FileText size={24} className="text-indigo-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="font-semibold text-gray-900 truncate">{note.title}</h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {note.chapterTitle} • {note.subjectName}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
                        note.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {note.status}
                    </span>
                  </div>

                  {/* Preview text for non-PDF notes */}
                  {note.contentText && note.noteType !== 'PDF' && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-2">{note.contentText}</p>
                  )}

                  {/* Metadata */}
                  <p className="text-xs text-gray-400 mt-2">
                    Created: {new Date(note.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {note.pdfPath && (
                    <button
                      onClick={() => downloadPdf(note.pdfPath, note.title)}
                      title="Download PDF"
                      className="p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Download size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={deleteMutation.isPending}
                    title="Delete note"
                    className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

