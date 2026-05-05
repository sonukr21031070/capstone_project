import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { studentService } from '@/store/storeAndServices';
import toast from 'react-hot-toast';
import {
  Dumbbell,
  Plus,
  Check,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Upload,
  ChevronRight,
  Eye
} from 'lucide-react';

export default function StudentExercisesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, SUBMITTED, GRADED
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch exercises for student
  const { data: exercisesData, isLoading: exercisesLoading } = useQuery({
    queryKey: ['student-exercises', page, filter],
    queryFn: () => studentService.getExercises({ page, size: 10, filter })
  });

  const exercises = exercisesData?.data?.content || [];
  const totalPages = exercisesData?.data?.totalPages || 0;

  const filteredExercises = exercises.filter(ex =>
    !searchTerm ||
    ex.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.subjectName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'GRADED':
        return 'bg-green-100 text-green-800';
      case 'LATE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={16} />;
      case 'SUBMITTED':
        return <Upload size={16} />;
      case 'GRADED':
        return <Check size={16} />;
      case 'LATE':
        return <AlertCircle size={16} />;
      default:
        return null;
    }
  };

  if (exercisesLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exercises</h1>
            <p className="text-gray-500 text-sm mt-1">Practice exercises assigned by your teachers</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search exercises by title, subject, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'PENDING', 'SUBMITTED', 'GRADED'].map(status => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setPage(0);
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-400'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises Grid */}
        {filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 flex-1">{exercise.title}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 inline-flex ${getStatusColor(exercise.submissionStatus)}`}>
                      {getStatusIcon(exercise.submissionStatus)}
                      {exercise.submissionStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{exercise.subjectName}</p>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Description */}
                  {exercise.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{exercise.description}</p>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>
                      📚 {exercise.chapterTitle}
                    </div>
                    {exercise.dueDate && (
                      <div className="text-right">
                        📅 {new Date(exercise.dueDate).toLocaleDateString('en-IN')}
                      </div>
                    )}
                  </div>

                  {/* Score (if graded) */}
                  {exercise.submissionStatus === 'GRADED' && exercise.score !== undefined && (
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <p className="text-sm font-semibold text-green-800">
                        Score: {exercise.score}/{exercise.totalMarks}
                        <span className="text-xs text-green-700 ml-1">
                          ({Math.round((exercise.score / exercise.totalMarks) * 100)}%)
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Teacher Feedback (if graded) */}
                  {exercise.submissionStatus === 'GRADED' && exercise.feedback && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Teacher's Feedback:</p>
                      <p className="text-xs text-blue-800 line-clamp-2">{exercise.feedback}</p>
                    </div>
                  )}
                </div>

                {/* Card Footer - Actions */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
                  {/* View Exercise Button */}
                  <button
                    onClick={() => navigate(`/student/exercises/${exercise.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <Eye size={16} />
                    View
                  </button>

                  {/* Submit/View Submission Button */}
                  {exercise.submissionStatus === 'PENDING' ? (
                    <button
                      onClick={() => navigate(`/student/exercises/${exercise.id}/submit`)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <Upload size={16} />
                      Submit
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/student/exercises/${exercise.id}/submission`)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <FileText size={16} />
                      View Submission
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Dumbbell size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg font-medium">No exercises available</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm ? 'Try adjusting your search terms' : 'Your teachers will assign exercises here'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <div className="px-4 py-2 text-sm text-gray-600">
              Page {page + 1} of {totalPages}
            </div>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

