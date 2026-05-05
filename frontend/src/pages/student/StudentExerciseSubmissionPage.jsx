import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { studentService } from '@/store/storeAndServices';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Upload,
  FileText,
  X,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

export default function StudentExerciseSubmissionPage() {
  const { t } = useTranslation();
  const { exerciseId } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Fetch exercise details
  const { data: exerciseData, isLoading: exerciseLoading } = useQuery({
    queryKey: ['student-exercise', exerciseId],
    queryFn: () => studentService.getExerciseDetails(exerciseId)
  });

  const exercise = exerciseData?.data || {};

  // Check if submission already exists
  const { data: submissionData } = useQuery({
    queryKey: ['student-submission', exerciseId],
    queryFn: () => studentService.getStudentSubmission(exerciseId)
  });

  const existingSubmission = submissionData?.data;

  // Submission mutation
  const submitMutation = useMutation({
    mutationFn: (formData) => studentService.submitExercise(exerciseId, formData),
    onSuccess: () => {
      toast.success('Exercise submitted successfully!');
      setTimeout(() => navigate('/student/exercises'), 1500);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to submit exercise');
    }
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(f => f.size <= 10 * 1024 * 1024); // 10MB limit

    if (validFiles.length < droppedFiles.length) {
      toast.error('Some files exceed 10MB limit');
    }

    setFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(f => f.size <= 10 * 1024 * 1024);

    if (validFiles.length < selectedFiles.length) {
      toast.error('Some files exceed 10MB limit');
    }

    setFiles(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error('Please select at least one file to submit');
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('notes', notes);

    submitMutation.mutate(formData);
  };

  if (exerciseLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg" />)}
        </div>
      </div>
    );
  }

  // If already submitted
  if (existingSubmission && existingSubmission.status !== 'DRAFT') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/student/exercises')}
            className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <ArrowLeft size={18} />
            Back to Exercises
          </button>

          {/* Already Submitted Message */}
          <div className={`rounded-lg border-l-4 p-6 mb-6 ${
            existingSubmission.status === 'GRADED'
              ? 'bg-green-50 border-green-500'
              : 'bg-blue-50 border-blue-500'
          }`}>
            <div className="flex gap-4">
              {existingSubmission.status === 'GRADED' ? (
                <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
              ) : (
                <FileText className="text-blue-600 flex-shrink-0" size={24} />
              )}
              <div className="flex-1">
                <h3 className={`font-bold mb-2 ${
                  existingSubmission.status === 'GRADED'
                    ? 'text-green-900'
                    : 'text-blue-900'
                }`}>
                  {existingSubmission.status === 'GRADED' ? 'Exercise Graded' : 'Exercise Submitted'}
                </h3>
                <p className={`text-sm mb-4 ${
                  existingSubmission.status === 'GRADED'
                    ? 'text-green-700'
                    : 'text-blue-700'
                }`}>
                  {existingSubmission.status === 'GRADED'
                    ? `Your exercise has been graded. Score: ${existingSubmission.score}/${existingSubmission.totalMarks}`
                    : 'Your exercise has been submitted successfully.'}
                </p>
                {existingSubmission.feedback && (
                  <div className="bg-white/50 rounded p-3 mb-3">
                    <p className="text-xs font-semibold mb-1">Teacher Feedback:</p>
                    <p className="text-sm">{existingSubmission.feedback}</p>
                  </div>
                )}
                <button
                  onClick={() => navigate('/student/exercises')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium"
                >
                  Back to All Exercises
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/student/exercises')}
          className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <ArrowLeft size={18} />
          Back to Exercises
        </button>

        {/* Exercise Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{exercise.title}</h1>
          <p className="text-gray-600 mb-4">{exercise.description}</p>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Subject</p>
              <p className="font-medium text-gray-900">{exercise.subjectName}</p>
            </div>
            <div>
              <p className="text-gray-500">Chapter</p>
              <p className="font-medium text-gray-900">{exercise.chapterTitle}</p>
            </div>
            {exercise.dueDate && (
              <div>
                <p className="text-gray-500">Due Date</p>
                <p className="font-medium text-gray-900">{new Date(exercise.dueDate).toLocaleDateString('en-IN')}</p>
              </div>
            )}
          </div>

          {/* Exercise Content */}
          {exercise.exerciseContent && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Exercise Instructions:</h3>
              <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 whitespace-pre-wrap">
                {exercise.exerciseContent}
              </div>
            </div>
          )}
        </div>

        {/* Submission Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Your Work</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Upload Files (Max 5 files, 10MB each)
              </label>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 bg-gray-50 hover:border-indigo-400'
                }`}
              >
                <Upload className="mx-auto mb-3 text-gray-400" size={32} />
                <p className="text-sm font-medium text-gray-900">
                  Drag and drop files here or <label className="cursor-pointer text-indigo-600 hover:text-indigo-700">browse</label>
                </p>
                <p className="text-xs text-gray-500 mt-1">Supported: PDF, DOC, DOCX, JPG, PNG, TXT (Max 10MB each)</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes/Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or comments about your submission..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Optional: Share your thoughts or ask for help</p>
            </div>

            {/* Due Date Warning */}
            {exercise.dueDate && new Date(exercise.dueDate) < new Date() && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-semibold text-red-900">Late Submission</p>
                  <p className="text-sm text-red-700">This exercise's due date has passed. Late submissions may affect your grade.</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/student/exercises')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitMutation.isPending || files.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Submit Exercise
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

