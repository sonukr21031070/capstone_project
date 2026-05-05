import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '@/store/storeAndServices';
import toast from 'react-hot-toast';

export default function TeacherNotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotes();
  }, [page]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getMyNotes(page, 10);
      setNotes(data.content || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (noteId) => {
    try {
      await teacherService.publishNote(noteId);
      loadNotes();
    } catch (error) {
      console.error('Error publishing note:', error);
    }
  };

  const handleDelete = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await teacherService.deleteNote(noteId);
        loadNotes();
      } catch (error) {
        console.error('Error deleting note:', error);
        toast.error('Error deleting note');
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Notes</h1>
        <button
          onClick={() => navigate('/teacher/notes/new')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          + Add New Note
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Title</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Class</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Subject</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Created</th>
              <th className="px-6 py-3 text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => (
              <tr key={note.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{note.title}</td>
                <td className="px-6 py-4 text-gray-600">-</td>
                <td className="px-6 py-4 text-gray-600">{note.subjectName}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    note.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {note.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(note.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  {note.status === 'DRAFT' && (
                    <button
                      onClick={() => handlePublish(note.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 text-lg">No notes yet. Create your first note!</p>
        </div>
      )}
    </div>
  );
}

