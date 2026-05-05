import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { teacherService } from '@/store/storeAndServices';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  Send,
  AlertCircle,
  CheckCircle,
  Calendar,
  Clock,
  User,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function TeacherRemarksPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, SUBMITTED
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [expandedRemark, setExpandedRemark] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRemark, setEditingRemark] = useState(null);
  const [formData, setFormData] = useState({
    studentId: null,
    subject: '',
    content: '',
    rating: 5
  });

  // Fetch students
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['teacher-students'],
    queryFn: () => teacherService.getStudents()
  });

  // Fetch remarks for selected student
  const { data: remarksData, isLoading: remarksLoading } = useQuery({
    queryKey: ['teacher-remarks', page, filter],
    queryFn: () => teacherService.getStudentRemarks({ page, size: 10, filter })
  });

  // Create/Update remark mutation
  const mutation = useMutation({
    mutationFn: (data) =>
      editingRemark
        ? teacherService.updateRemark(editingRemark.id, data)
        : teacherService.createRemark(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-remarks'] });
      toast.success(
        editingRemark ? 'Remark updated successfully!' : 'Remark created successfully!'
      );
      resetForm();
      setIsModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to save remark');
    }
  });

  // Delete remark mutation
  const deleteMutation = useMutation({
    mutationFn: (remarkId) => teacherService.deleteRemark(remarkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-remarks'] });
      toast.success('Remark deleted successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to delete remark');
    }
  });

  const students = studentsData?.data || [];
  const remarks = remarksData?.data?.content || [];
  const totalPages = remarksData?.data?.totalPages || 0;

  const filteredRemarks = remarks.filter(remark =>
    !searchTerm ||
    remark.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    remark.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    remark.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (remark = null) => {
    if (remark) {
      setEditingRemark(remark);
      setFormData({
        studentId: remark.studentId,
        subject: remark.subject,
        content: remark.content,
        rating: remark.rating || 5
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      studentId: null,
      subject: '',
      content: '',
      rating: 5
    });
    setEditingRemark(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.subject.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    mutation.mutate(formData);
  };

  const handleDeleteRemark = (remarkId) => {
    if (window.confirm('Are you sure you want to delete this remark?')) {
      deleteMutation.mutate(remarkId);
    }
  };

  if (studentsLoading) {
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
            <h1 className="text-3xl font-bold text-gray-900">Student Remarks</h1>
            <p className="text-gray-500 text-sm mt-1">Add and manage feedback for your students</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Plus size={18} />
            Add Remark
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by student name, subject, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'PENDING', 'SUBMITTED'].map(status => (
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

        {/* Empty State */}
        {filteredRemarks.length === 0 && !remarksLoading && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg font-medium">No remarks yet</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Click "Add Remark" to provide feedback to your students'}
            </p>
          </div>
        )}

        {/* Remarks List */}
        {filteredRemarks.length > 0 && (
          <div className="space-y-4">
            {filteredRemarks.map((remark) => (
              <div
                key={remark.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() =>
                    setExpandedRemark(expandedRemark === remark.id ? null : remark.id)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <User size={24} className="text-indigo-600" />
                    </div>

                    {/* Student and Subject Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {remark.studentName}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{remark.subject}</p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < remark.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-gray-400 flex-shrink-0">
                      <Calendar size={14} />
                      <span className="text-xs">
                        {new Date(remark.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Icon */}
                  {expandedRemark === remark.id ? (
                    <ChevronUp size={20} className="text-gray-400 ml-2" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400 ml-2" />
                  )}
                </button>

                {/* Expanded Content */}
                {expandedRemark === remark.id && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    {/* Remark Content */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {remark.content}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>
                          {new Date(remark.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {remark.updatedAt && remark.updatedAt !== remark.createdAt && (
                        <div className="col-span-2 text-gray-400">
                          Last updated:{' '}
                          {new Date(remark.updatedAt).toLocaleDateString('en-IN')}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          handleOpenModal(remark);
                          setExpandedRemark(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRemark(remark.id)}
                        disabled={deleteMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition font-medium text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
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

      {/* Add/Edit Remark Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingRemark ? 'Edit Remark' : 'Add New Remark'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Student <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.studentId || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={!!editingRemark}
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics, English, Science"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`text-3xl transition ${
                        star <= formData.rating
                          ? 'text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Write detailed feedback and remarks for the student..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <Send size={18} />
                  {mutation.isPending
                    ? 'Saving...'
                    : editingRemark
                      ? 'Update Remark'
                      : 'Add Remark'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

