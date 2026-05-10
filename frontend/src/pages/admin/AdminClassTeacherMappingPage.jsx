import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/store/storeAndServices';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function AdminClassTeacherMappingPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    teacherId: '',
    academicYear: new Date().getFullYear().toString()
  });

  const { data: mappingsData, isLoading, error: mappingsError } = useQuery({
    queryKey: ['class-teacher-mappings'],
    queryFn: () => adminService.getClassTeacherMap()
  });

  const { data: teachersData, error: teachersError } = useQuery({
    queryKey: ['teachers-list'],
    queryFn: () => adminService.getTeachers()
  });

  const createMutation = useMutation({
    mutationFn: (data) => editingId
      ? adminService.updateClassTeacherMap(editingId, data)
      : adminService.createClassTeacherMap(data),
    onSuccess: () => {
      toast.success(editingId ? 'Mapping updated!' : 'Mapping created!');
      queryClient.invalidateQueries(['class-teacher-mappings']);
      resetForm();
      setIsModalOpen(false);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to save mapping';
      toast.error(errorMsg);
      console.error('Mapping error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteClassTeacherMap(id),
    onSuccess: () => {
      toast.success('Mapping deleted');
      queryClient.invalidateQueries(['class-teacher-mappings']);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to delete mapping';
      toast.error(errorMsg);
      console.error('Delete error:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      classId: '',
      subjectId: '',
      teacherId: '',
      academicYear: new Date().getFullYear().toString()
    });
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.classId || !formData.subjectId || !formData.teacherId) {
      toast.error('Please fill all fields');
      return;
    }

    // Convert string IDs to numbers for backend
    const submitData = {
      classId: parseInt(formData.classId),
      subjectId: parseInt(formData.subjectId),
      teacherId: parseInt(formData.teacherId),
      academicYear: formData.academicYear
    };

    console.log('Submitting mapping data:', submitData);
    createMutation.mutate(submitData);
  };

  const mappings = mappingsData?.data || [];

  if (isLoading && mappings.length === 0) {
    return <div className="p-6 text-center text-gray-500">Loading mappings...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Class-Teacher Mapping</h1>
          <p className="text-gray-500 text-sm mt-1">Assign teachers to classes and subjects</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={18} />
          New Mapping
        </button>
      </div>

      {mappingsError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">Error loading mappings:</p>
          <p className="text-sm">{mappingsError.message || 'Failed to load mappings'}</p>
        </div>
      )}

      {mappings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 text-lg">
            {isLoading ? 'Loading mappings...' : 'No mappings yet. Click "New Mapping" to create one.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Class</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Subject</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Teacher</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Academic Year</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((mapping) => (
                <tr key={mapping.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{mapping.className}</td>
                  <td className="px-6 py-4 text-gray-600">{mapping.subjectName}</td>
                  <td className="px-6 py-4 text-gray-600">{mapping.teacherName}</td>
                  <td className="px-6 py-4 text-gray-600">{mapping.academicYear}</td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingId(mapping.id);
                        setFormData({
                          classId: (mapping.classId || '').toString(),
                          subjectId: (mapping.subjectId || '').toString(),
                          teacherId: (mapping.teacherId || '').toString(),
                          academicYear: mapping.academicYear || new Date().getFullYear().toString()
                        });
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this mapping?')) {
                          deleteMutation.mutate(mapping.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Mapping' : 'Create Mapping'}
              </h2>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select value={formData.classId} onChange={(e) => setFormData({...formData, classId: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select Class</option>
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <option key={i} value={i}>Class {i}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select value={formData.subjectId} onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select Subject</option>
                  <option value="1">Mathematics</option>
                  <option value="2">Hindi</option>
                  <option value="3">English</option>
                  <option value="4">Science</option>
                  <option value="5">Social Studies</option>
                </select>
              </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
                 <select value={formData.teacherId} onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                   className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                   <option value="">Select Teacher</option>
                   {teachersData?.data && teachersData.data.map(teacher => (
                     <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                   ))}
                 </select>
               </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                <input type="text" value={formData.academicYear} onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
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

