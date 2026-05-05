import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { teacherService } from '@/store/storeAndServices';
import toast from 'react-hot-toast';
import { Dumbbell, Plus, Edit2, Trash2, Users, Calendar, Eye, Search } from 'lucide-react';

export default function TeacherExercisesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: exercisesData, isLoading } = useQuery({
    queryKey: ['teacher-exercises', page],
    queryFn: () => teacherService.getMyExercises({ page, size: 15 })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => teacherService.deleteExercise(id),
    onSuccess: () => {
      toast.success('Exercise deleted');
      queryClient.invalidateQueries(['teacher-exercises']);
    },
    onError: () => toast.error('Failed to delete exercise')
  });

  const exercises = exercisesData?.data?.content || [];
  const totalPages = exercisesData?.data?.totalPages || 0;

  const filteredExercises = exercises.filter(ex =>
    !searchTerm || ex.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Exercises</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage practice exercises</p>
        </div>
        <button
          onClick={() => navigate('/teacher/exercises/new')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={18} />
          Create New
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {filteredExercises.length === 0 && !isLoading ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <Dumbbell size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-lg">No exercises yet. Create your first exercise!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredExercises.map((exercise) => (
            <div key={exercise.id} className="bg-white rounded-lg shadow p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{exercise.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    {exercise.subject && <span>📚 {exercise.subject}</span>}
                    {exercise.dueDate && <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(exercise.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4 ${
                  exercise.status === 'PUBLISHED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {exercise.status}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate(`/teacher/exercises/${exercise.id}/submissions`)}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                >
                  <Users size={16} /> View Submissions
                </button>
                <button
                  onClick={() => navigate(`/teacher/exercises/${exercise.id}/edit`)}
                  className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this exercise?')) {
                      deleteMutation.mutate(exercise.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition text-sm font-medium disabled:opacity-50"
                >
                  <Trash2 size={16} /> Delete
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



