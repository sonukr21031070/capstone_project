import React, { useState, useEffect } from 'react';
import { studentService } from '../../store/storeAndServices';
import { useTranslation } from 'react-i18next';
import { TTSButton } from '../../components/ComponentLibrary';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const { i18n } = useTranslation();

  useEffect(() => {
    loadAnnouncements();
  }, [page]);

  const loadAnnouncements = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await studentService.getAnnouncements({ page: page, size: 10 });
      setAnnouncements(data?.data?.content || data?.content || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-700 font-semibold">Error: {error}</p>
        <button
          onClick={loadAnnouncements}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocalizedText = (item, field) => {
    const lang = i18n.language;
    if (lang === 'hi' && item[field + 'Hindi']) return item[field + 'Hindi'];
    if (lang === 'pa' && item[field + 'Punjabi']) return item[field + 'Punjabi'];
    return item[field];
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Announcements</h1>

      <div className="space-y-4">
        {announcements.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-800">{getLocalizedText(item, 'title')}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(item.priority)}`}>
                {item.priority}
              </span>
            </div>

            <p className="text-gray-700 mb-4">{getLocalizedText(item, 'content')}</p>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{new Date(item.publishDate).toLocaleDateString()}</p>
              <TTSButton
                text={`${getLocalizedText(item, 'title')}. ${getLocalizedText(item, 'content')}`}
              />
            </div>
          </div>
        ))}
      </div>

      {announcements.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No announcements available</p>
        </div>
      )}
    </div>
  );
}

