import React, { useState, useEffect } from 'react';
import { studentService } from '../../store/storeAndServices';
import { TTSButton } from '../../components/ComponentLibrary';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [audioOnly, setAudioOnly] = useState(false);

  useEffect(() => {
    loadSubjectsAndVideos();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadChapters();
      loadVideos();
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedSubject) {
      loadVideos();
    }
  }, [selectedChapter]);

  const loadSubjectsAndVideos = async () => {
    try {
      setError(null);
      setLoading(true);
      const subjectsData = await studentService.getSubjects();
      setSubjects(subjectsData?.data || []);
      if ((subjectsData?.data || []).length > 0) {
        setSelectedSubject((subjectsData?.data || [])[0].id);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async () => {
    try {
      const chaptersData = await fetch(`/api/student/chapters?subjectId=${selectedSubject}`).then(r => r.json());
      setChapters(chaptersData?.data || []);
    } catch (error) {
      console.error('Error loading chapters:', error);
      setChapters([]);
    }
  };

  const loadVideos = async () => {
    try {
      setError(null);
      setLoading(true);
      const videosData = await studentService.getVideos({ subjectId: selectedSubject, chapterId: selectedChapter, page: 0, size: 20 });
      setVideos(videosData?.data?.content || videosData?.content || []);
    } catch (error) {
      console.error('Error loading videos:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load videos');
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
          onClick={() => selectedSubject ? loadVideos() : loadSubjectsAndVideos()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Video Tutorials</h1>

      {/* Subject Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => {
              setSelectedSubject(subject.id);
              setSelectedChapter(null);
            }}
            className={`px-4 py-2 rounded-full font-medium transition ${
              selectedSubject === subject.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {subject.name}
          </button>
        ))}
      </div>

      {/* Chapter Filter - only show if subject selected and chapters exist */}
      {selectedSubject && chapters.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Filter by Chapter:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedChapter(null)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                selectedChapter === null
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              All Chapters
            </button>
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => setSelectedChapter(chapter.id)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  selectedChapter === chapter.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {chapter.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
            {/* Thumbnail */}
            <div className="relative bg-gray-200 aspect-video flex items-center justify-center">
              {video.thumbnailPath ? (
                <img src={video.thumbnailPath} alt={video.title} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <span className="text-4xl">🎬</span>
                </div>
              )}
              <button
                onClick={() => setPlayingVideo(video.id)}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition"
              >
                <span className="text-white text-5xl">▶</span>
              </button>
              {video.durationSecs && (
                <div className="absolute bottom-2 right-2 bg-black text-white px-2 py-1 rounded text-xs">
                  {Math.floor(video.durationSecs / 60)}:{(video.durationSecs % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{video.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{video.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">{video.chapterTitle}</span>
                {video.hasSubtitles && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                    CC
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPlayingVideo(video.id)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  Play
                </button>
                {video.transcript && (
                  <TTSButton
                    text={video.transcript}
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-black rounded-lg w-full max-w-4xl mx-4">
            <div className="flex justify-between items-center p-4 border-b border-gray-600">
              <h3 className="text-white font-bold">
                {videos.find(v => v.id === playingVideo)?.title}
              </h3>
              <button
                onClick={() => setPlayingVideo(null)}
                className="text-white hover:text-gray-300 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black">
              {audioOnly ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-2xl mb-4">🔊 Audio Only Mode</p>
                    <audio controls className="w-full max-w-md" src={videos.find(v => v.id === playingVideo)?.audioPath} />
                  </div>
                </div>
              ) : (
                <video
                  controls
                  className="w-full h-full"
                  src={videos.find(v => v.id === playingVideo)?.videoPath}
                  autoPlay
                />
              )}
            </div>
            <div className="p-4 border-t border-gray-600">
              <button
                onClick={() => setAudioOnly(!audioOnly)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition mr-2"
              >
                {audioOnly ? 'Show Video' : 'Audio Only'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

