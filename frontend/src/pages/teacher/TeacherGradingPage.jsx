import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherService } from '@/store/storeAndServices';
import toast from 'react-hot-toast';
import { CheckCircle, Download, User, Calendar, FileText } from 'lucide-react';

export default function TeacherGradingPage() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [gradingData, setGradingData] = useState({});

  const { data: submissionsData, isLoading } = useQuery({
    queryKey: ['exercise-submissions', exerciseId, page],
    queryFn: () => teacherService.getExerciseSubmissions(exerciseId, { page, size: 10 })
  });

  const gradeMutation = useMutation({
    mutationFn: (data) => teacherService.gradeSubmission(data.submissionId, data),
    onSuccess: () => {
      toast.success('Submission graded');
      queryClient.invalidateQueries(['exercise-submissions']);
    },
    onError: () => toast.error('Failed to grade submission')
  });

  const submissions = submissionsData?.data?.content || [];
  const totalPages = submissionsData?.data?.totalPages || 0;

  const handleGrade = (submissionId) => {
    const data = gradingData[submissionId];
    if (!data || !data.marks) {
      toast.error('Please enter marks');
      return;
    }
    gradeMutation.mutate({
      submissionId,
      marks: data.marks,
      feedback: data.feedback || ''
    });
    setGradingData(prev => {
      const updated = {...prev};
      delete updated[submissionId];
      return updated;
    });
  };

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-lg">← Back</button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Grade Submissions</h1>
          <p className="text-gray-500 text-sm mt-1">Review and grade student submissions</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <FileText size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-lg">No submissions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="bg-white rounded-lg shadow p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900">{submission.studentName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      {submission.submittedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                      {submission.isLate && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">Late Submission</span>
                      )}
                    </div>
                  </div>
                </div>
                {submission.status === 'GRADED' && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {submission.marks}/{submission.totalMarks}
                  </span>
                )}
              </div>

              {submission.fileUrls && submission.fileUrls.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Submitted Files:</p>
                  <div className="flex flex-wrap gap-2">
                    {submission.fileUrls.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm">
                        <Download size={14} />
                        File {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {submission.status !== 'GRADED' ? (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <input type="number" placeholder="Marks" max="100" min="0"
                    value={gradingData[submission.id]?.marks || ''}
                    onChange={(e) => setGradingData(prev => ({
                      ...prev,
                      [submission.id]: {...(prev[submission.id] || {}), marks: e.target.value}
                    }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <textarea placeholder="Feedback (optional)" rows="3"
                    value={gradingData[submission.id]?.feedback || ''}
                    onChange={(e) => setGradingData(prev => ({
                      ...prev,
                      [submission.id]: {...(prev[submission.id] || {}), feedback: e.target.value}
                    }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  <button onClick={() => handleGrade(submission.id)}
                    disabled={gradeMutation.isPending}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 font-medium">
                    <CheckCircle size={18} /> Submit Grade
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800"><strong>Feedback:</strong> {submission.feedback || 'No feedback'}</p>
                </div>
              )}
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

