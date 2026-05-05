import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/store/storeAndServices';
import toast from 'react-hot-toast';
import { Bell, Plus, Edit2, Trash2, X, Calendar, Users } from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    titleHindi: '',
    titlePunjabi: '',
    content: '',
    contentHindi: '',
    contentPunjabi: '',
    targetRole: 'ALL',
    priority: 'MEDIUM',
    expireDate: ''
  });

  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ['admin-announcements', page],
    queryFn: () => adminService.getAnnouncements({ page, size: 10 })
  });

  const createMutation = useMutation({
    mutationFn: (data) => editingId
      ? adminService.updateAnnouncement(editingId, data)
      : adminService.createAnnouncement(data),
    onSuccess: () => {
      toast.success(editingId ? 'Announcement updated!' : 'Announcement created!');
      queryClient.invalidateQueries(['admin-announcements']);
      resetForm();
      setIsModalOpen(false);
    },
    onError: () => toast.error('Failed to save announcement')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteAnnouncement(id),
    onSuccess: () => {
      toast.success('Announcement deleted');
      queryClient.invalidateQueries(['admin-announcements']);
    },
    onError: () => toast.error('Failed to delete announcement')
  });

  const resetForm = () => {
    setFormData({
      title: '',
      titleHindi: '',
      titlePunjabi: '',
      content: '',
      contentHindi: '',
      contentPunjabi: '',
      targetRole: 'ALL',
      priority: 'MEDIUM',
      expireDate: ''
    });
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }
    createMutation.mutate(formData);
  };

  const announcements = announcementsData?.data?.content || [];
  const totalPages = announcementsData?.data?.totalPages || 0;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Announcements</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage system-wide announcements</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={18} />
          New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Bell size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-lg">No announcements yet</p>
          </div>
        ) : (
          announcements.map(announcement => (
            <div key={announcement.id} className="bg-white rounded-lg shadow p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{announcement.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{announcement.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Users size={14} /> {announcement.targetRole}</span>
                    {announcement.expireDate && (
                      <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(announcement.expireDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingId(announcement.id);
                      setFormData({...announcement});
                      setIsModalOpen(true);
                    }}
                    className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this announcement?')) {
                        deleteMutation.mutate(announcement.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50">← Prev</button>
          <span className="px-4 py-2">{page + 1} / {totalPages}</span>
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50">Next →</button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Announcement' : 'Create Announcement'}
              </h2>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <input type="text" placeholder="Title (English)" value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                <input type="text" placeholder="Title (Hindi)" value={formData.titleHindi}
                  onChange={(e) => setFormData({...formData, titleHindi: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Title (Punjabi)" value={formData.titlePunjabi}
                  onChange={(e) => setFormData({...formData, titlePunjabi: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <textarea placeholder="Content (English)" rows="3" value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-3" required />
                <textarea placeholder="Content (Hindi)" rows="3" value={formData.contentHindi}
                  onChange={(e) => setFormData({...formData, contentHindi: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <textarea placeholder="Content (Punjabi)" rows="3" value={formData.contentPunjabi}
                  onChange={(e) => setFormData({...formData, contentPunjabi: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <select value={formData.targetRole} onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="ALL">All Users</option>
                  <option value="STUDENT">Students</option>
                  <option value="TEACHER">Teachers</option>
                  <option value="PARENT">Parents</option>
                </select>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
                <input type="datetime-local" value={formData.expireDate} onChange={(e) => setFormData({...formData, expireDate: e.target.value})}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
                  {createMutation.isPending ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
