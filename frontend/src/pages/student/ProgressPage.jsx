import React, { useState, useEffect } from 'react';
import { studentService } from '../../store/storeAndServices';
import { TTSButton } from '../../components/ComponentLibrary';

export default function ProgressPage() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState({});

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setError(null);
      setLoading(true);
      const [progressData, dashboardData] = await Promise.all([
        studentService.getProgress(),
        studentService.getDashboard()
      ]);
      setProgress(progressData?.data || []);
      setDashboard(dashboardData?.data || {});
    } catch (error) {
      console.error('Error loading progress:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load progress');
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
          onClick={loadProgress}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Progress</h1>

      {/* Overall Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Time</p>
          <p className="text-2xl font-bold text-blue-600">{dashboard.timeSpentMins || 0} min</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Overall Avg Score</p>
          <p className="text-2xl font-bold text-green-600">{(dashboard.avgScore || 0).toFixed(1)}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Chapters Complete</p>
          <p className="text-2xl font-bold text-purple-600">{dashboard.chaptersComplete || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Class</p>
          <p className="text-lg font-bold text-gray-800">{dashboard.className}</p>
        </div>
      </div>

      {/* Progress by Subject */}
      <div className="space-y-4">
        {progress.map((item) => {
          const avgScore = item.avgScore ? parseFloat(item.avgScore) : 0;
          const scoreColor = avgScore < 40 ? 'bg-red-500' : avgScore < 70 ? 'bg-yellow-500' : 'bg-green-500';
          const scoreTextColor = avgScore < 40 ? 'text-red-600' : avgScore < 70 ? 'text-yellow-600' : 'text-green-600';

          return (
            <div key={item.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{item.subjectName}</h3>
                  <p className="text-sm text-gray-600">{item.chapterTitle}</p>
                </div>
                <TTSButton
                  text={`Progress in ${item.subjectName}: Score ${avgScore}%, Notes read ${item.notesRead}, Videos watched ${item.videosWatched}, Quizzes ${item.quizzesTaken}`}
                />
              </div>

              {/* Score Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Score</span>
                  <span className={`text-lg font-bold ${scoreTextColor}`}>{avgScore.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className={`h-3 rounded-full ${scoreColor}`} style={{ width: `${avgScore}%` }}></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{item.notesRead}</p>
                  <p className="text-xs text-gray-600">Notes Read</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{item.videosWatched}</p>
                  <p className="text-xs text-gray-600">Videos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{item.quizzesTaken}</p>
                  <p className="text-xs text-gray-600">Quizzes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{item.timeSpentMins}</p>
                  <p className="text-xs text-gray-600">Minutes</p>
                </div>
              </div>

              {item.isChapterComplete && (
                <div className="bg-green-100 text-green-800 px-3 py-2 rounded text-sm font-medium">
                  ✓ Chapter Complete
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

