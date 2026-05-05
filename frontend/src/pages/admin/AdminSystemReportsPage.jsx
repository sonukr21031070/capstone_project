import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/store/storeAndServices';
import { BarChart3, TrendingUp, Users, BookOpen, Calendar, Download } from 'lucide-react';

export default function AdminSystemReportsPage() {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('month');

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['system-reports', reportType, dateRange],
    queryFn: () => adminService.getSystemReports()
  });

  const reports = reportsData?.data || {};

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;

  const StatCard = ({ icon: Icon, label, value, trend }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm">{label}</span>
        <Icon size={24} className="text-blue-600" />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {trend && (
        <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </p>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">System Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Analytics and insights about your platform</p>
      </div>

      {/* Report Type & Date Selector */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="summary">Summary</option>
            <option value="user-engagement">User Engagement</option>
            <option value="content">Content Analysis</option>
            <option value="performance">Performance Metrics</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
        <button className="mt-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <Download size={18} /> Export
        </button>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Users} label="Total Users" value={reports.totalUsers || 0} trend={reports.userGrowth || 0} />
        <StatCard icon={BookOpen} label="Total Content" value={reports.totalContent || 0} trend={reports.contentGrowth || 0} />
        <StatCard icon={BarChart3} label="Avg. Student Score" value={`${reports.avgStudentScore || 0}%`} trend={reports.scoreChange || 0} />
        <StatCard icon={TrendingUp} label="Platform Activity" value={reports.activityScore || 0} trend={reports.activityTrend || 0} />
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-bold text-gray-900 mb-4">User Distribution</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-700">Students</span>
                <span className="text-sm font-medium">{reports.studentCount || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: `${(reports.studentCount / reports.totalUsers * 100) || 0}%`}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-700">Teachers</span>
                <span className="text-sm font-medium">{reports.teacherCount || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: `${(reports.teacherCount / reports.totalUsers * 100) || 0}%`}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-700">Parents</span>
                <span className="text-sm font-medium">{reports.parentCount || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: `${(reports.parentCount / reports.totalUsers * 100) || 0}%`}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-bold text-gray-900 mb-4">Content Type Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Notes</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{reports.notesCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Videos</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">{reports.videosCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Quizzes</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">{reports.quizzesCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Exercises</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">{reports.exercisesCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Subjects */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-bold text-gray-900 mb-4">Top Performing Subjects</h2>
        <div className="space-y-3">
          {(reports.topSubjects || []).map((subject, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">{subject.name}</span>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{subject.avgScore}%</p>
                  <p className="text-xs text-gray-600">{subject.studentCount} students</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

