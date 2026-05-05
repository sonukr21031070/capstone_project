import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { teacherService } from '@/store/storeAndServices';
import toast from 'react-hot-toast';
import { Trash2, Plus, Play, CheckCircle, Clock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function TeacherVideosPage() {
  const { t } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState('ALL'); // ALL, PUBLISHED, DRAFT
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadVideos();
  }, [page, filter]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teacherService.getMyVideos({
        page,
        size: 10,
        status: filter !== 'ALL' ? filter : undefined
      });

      // Handle both direct content and paginated response
      if (response?.data?.content) {
        setVideos(response.data.content);
        setTotalPages(response.data.totalPages || 1);
      } else if (Array.isArray(response?.data)) {
        setVideos(response.data);
        setTotalPages(1);
      } else if (response?.content) {
        setVideos(response.content);
        setTotalPages(response.totalPages || 1);
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error('Error loading videos:', err);
      setError(err.response?.data?.error || 'Failed to load videos');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (videoId) => {
    try {
      await teacherService.publishVideo(videoId);
      toast.success('Video published successfully!');
      loadVideos();
    } catch (err) {
      console.error('Error publishing video:', err);
      toast.error(err.response?.data?.error || 'Error publishing video');
    }
  };

  const handleDelete = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      try {
        await teacherService.deleteVideo(videoId);
        toast.success('Video deleted successfully!');
        loadVideos();
      } catch (err) {
        console.error('Error deleting video:', err);
        toast.error(err.response?.data?.error || 'Error deleting video');
      }
    }
  };

  const filteredVideos = videos.filter(video =>
    !searchTerm ||
    video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.subjectName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && page === 0) {
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
            <h1 className="text-3xl font-bold text-gray-900">My Videos</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and publish your video content</p>
          </div>
          <button
            onClick={() => navigate('/teacher/videos/new')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition flex items-center gap-2 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <Plus size={18} />
            Upload Video
          </button>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search videos by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'PUBLISHED', 'DRAFT'].map(status => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setPage(0);
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-400'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-red-600 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={loadVideos}
              className="text-sm font-medium text-red-700 hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Videos Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map(video => (
              <div
                key={video.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-900 flex items-center justify-center group overflow-hidden">
                  {video.thumbnailPath ? (
                    <img
                      src={video.thumbnailPath}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Play size={48} className="text-gray-600" />
                  )}

                  {/* Duration Badge */}
                  {video.durationSecs && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                      {Math.floor(video.durationSecs / 60)}:{(video.durationSecs % 60).toString().padStart(2, '0')}
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      video.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {video.status === 'PUBLISHED' ? (
                        <>
                          <Eye size={12} /> Live
                        </>
                      ) : (
                        <>
                          <Clock size={12} /> Draft
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm truncate mb-1">{video.title}</h3>

                  {/* Subject and Chapter */}
                  <p className="text-xs text-gray-600 mb-3">
                    {video.subjectName} • {video.chapterTitle}
                  </p>

                  {/* Description */}
                  {video.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{video.description}</p>
                  )}

                  {/* Created Date */}
                  <p className="text-xs text-gray-400 mb-4">
                    {new Date(video.createdAt).toLocaleDateString('en-IN')}
                  </p>

                  {/* Actions */}
                  <div className="space-y-2">
                    {video.status === 'DRAFT' && (
                      <button
                        onClick={() => handlePublish(video.id)}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition text-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <CheckCircle size={16} />
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="w-full bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200 transition text-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Play size={48} className="mx-auto mb-4 text-gray-300" />
            {searchTerm ? (
              <>
                <p className="text-gray-500 text-lg font-medium">No videos found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search terms</p>
              </>
            ) : (
              <>
                <p className="text-gray-500 text-lg font-medium">No videos yet</p>
                <p className="text-gray-400 text-sm mt-1">Upload your first video to get started</p>
              </>
            )}
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



