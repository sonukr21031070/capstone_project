import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherService } from '@/store/storeAndServices';
import toast from 'react-hot-toast';
import { Brain, Plus, Edit2, Trash2, Users, BarChart3, Search } from 'lucide-react';

export default function TeacherQuizzesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL');

  const { data: quizzesData, isLoading } = useQuery({
    queryKey: ['teacher-quizzes', page, filter],
    queryFn: () => teacherService.getMyQuizzes({ page, size: 12, status: filter !== 'ALL' ? filter : undefined })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => teacherService.deleteQuiz(id),
    onSuccess: () => {
      toast.success('Quiz deleted');
      queryClient.invalidateQueries(['teacher-quizzes']);
    },
    onError: () => toast.error('Failed to delete quiz')
  });

  const quizzes = quizzesData?.data?.content || [];
  const totalPages = quizzesData?.data?.totalPages || 0;

  const filteredQuizzes = quizzes.filter(quiz =>
    !searchTerm || quiz.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HARD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Quizzes</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage interactive quizzes</p>
        </div>
        <button
          onClick={() => navigate('/teacher/quizzes/new')}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
        >
          <Plus size={18} />
          Create Quiz
        </button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-2">
          {['ALL', 'PUBLISHED', 'DRAFT'].map(status => (
            <button
              key={status}
              onClick={() => { setFilter(status); setPage(0); }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === status
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-green-400'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredQuizzes.length === 0 && !isLoading ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <Brain size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-lg">No quizzes yet. Create your first quiz!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-3">
                <Brain size={24} className="text-green-600" />
                <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  quiz.status === 'PUBLISHED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {quiz.status}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{quiz.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">{quiz.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-600 text-xs">Difficulty</p>
                  <p className={`font-semibold text-xs ${getDifficultyColor(quiz.difficulty)}`}>{quiz.difficulty}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-600 text-xs">Questions</p>
                  <p className="font-semibold">{quiz.questionCount || 0}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-600 text-xs">Type</p>
                  <p className="font-semibold text-xs">{quiz.quizType}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-600 text-xs">Time</p>
                  <p className="font-semibold">{quiz.timeLimitMins || '-'} m</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/teacher/quizzes/${quiz.id}/responses`)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                >
                  <BarChart3 size={16} /> Results
                </button>
                <button
                  onClick={() => navigate(`/teacher/quizzes/${quiz.id}/edit`)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this quiz?')) {
                      deleteMutation.mutate(quiz.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition text-sm font-medium disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50">← Prev</button>
          <span className="px-4 py-2">{page + 1} / {totalPages}</span>
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50">Next →</button>
        </div>
      )}
    </div>
  );
}

