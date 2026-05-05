import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parentService } from '@/store/storeAndServices';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';

export default function ParentAttendancePage() {
  const [selectedChild, setSelectedChild] = useState(null);

  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ['parent-children'],
    queryFn: () => parentService.getChildren()
  });

  const { data: attendanceData } = useQuery({
    queryKey: ['child-attendance', selectedChild],
    queryFn: () => parentService.getChildAttendance(selectedChild),
    enabled: !!selectedChild
  });

  const children = childrenData?.data || [];
  const attendance = attendanceData?.data || {};

  if (childrenLoading) return <div className="p-6 text-center">Loading...</div>;

  if (!selectedChild && children.length > 0) {
    setSelectedChild(children[0].studentId);
  }

  const getAttendanceColor = (percentage) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 75) return 'text-amber-600';
    return 'text-red-600';
  };

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 85) return 'Excellent';
    if (percentage >= 75) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Attendance Tracking</h1>

      {/* Child Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {children.map(child => (
          <button
            key={child.studentId}
            onClick={() => setSelectedChild(child.studentId)}
            className={`px-4 py-2.5 rounded-xl font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              selectedChild === child.studentId
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            {child.name}
          </button>
        ))}
      </div>

      {selectedChild && attendance && (
        <div className="space-y-6">
          {/* Overall Attendance */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 mb-2">Overall Attendance</p>
                <p className={`text-5xl font-bold ${getAttendanceColor(attendance.percentage || 0)}`}>
                  {attendance.percentage || 0}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Status</p>
                <p className={`text-2xl font-bold ${getAttendanceColor(attendance.percentage || 0)}`}>
                  {getAttendanceStatus(attendance.percentage || 0)}
                </p>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  attendance.percentage >= 85 ? 'bg-green-600' :
                  attendance.percentage >= 75 ? 'bg-amber-600' :
                  'bg-red-600'
                }`}
                style={{width: `${attendance.percentage || 0}%`}}
              />
            </div>
          </div>

          {/* Attendance Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">Days Present</p>
              <p className="text-3xl font-bold text-green-600">{attendance.daysPresent || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Out of {attendance.totalSchoolDays || 0} school days</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">Days Absent</p>
              <p className="text-3xl font-bold text-red-600">{attendance.daysAbsent || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Unexcused absences</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">Days Leave</p>
              <p className="text-3xl font-bold text-amber-600">{attendance.daysLeave || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Approved leaves</p>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Monthly Attendance
            </h2>

            <div className="space-y-3">
              {(attendance.monthlyData || []).map((month, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <span className={`text-sm font-bold ${getAttendanceColor(month.percentage)}`}>
                      {month.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        month.percentage >= 85 ? 'bg-green-600' :
                        month.percentage >= 75 ? 'bg-amber-600' :
                        'bg-red-600'
                      }`}
                      style={{width: `${month.percentage}%`}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          {(attendance.percentage || 0) < 75 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <AlertCircle size={20} className="text-yellow-600 shrink-0" />
              <div>
                <p className="font-medium text-yellow-900">Attendance Notice</p>
                <p className="text-sm text-yellow-800 mt-1">
                  Your child's attendance is below the required 75%. Please ensure regular attendance.
                </p>
              </div>
            </div>
          )}

          {/* Trends */}
          {attendance.absenteeismTrend && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <TrendingUp size={20} className="text-blue-600 shrink-0" />
              <div>
                <p className="font-medium text-blue-900">Attendance Trend</p>
                <p className="text-sm text-blue-800 mt-1">
                  {attendance.absenteeismTrend > 0
                    ? `Absences increasing: ${attendance.absenteeismTrend}% more than last month`
                    : `Good improvement: ${Math.abs(attendance.absenteeismTrend)}% fewer absences than last month`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

