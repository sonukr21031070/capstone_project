import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/store/storeAndServices';
import { ChevronDown, ChevronUp, Users, BookOpen } from 'lucide-react';

export default function AdminClassOverviewPage() {
  const [expandedClassId, setExpandedClassId] = useState(null);
  const [selectedTab, setSelectedTab] = useState('students');

  const { data: classesData, isLoading, error } = useQuery({
    queryKey: ['classes-overview'],
    queryFn: () => adminService.getClassesOverview()
  });

  const { data: studentsData } = useQuery({
    queryKey: ['class-students', expandedClassId],
    queryFn: () => expandedClassId ? adminService.getStudentsByClass(expandedClassId) : null,
    enabled: !!expandedClassId && selectedTab === 'students'
  });

  const { data: teachersData } = useQuery({
    queryKey: ['class-teachers', expandedClassId],
    queryFn: () => expandedClassId ? adminService.getTeachersByClass(expandedClassId) : null,
    enabled: !!expandedClassId && selectedTab === 'teachers'
  });

  const classes = classesData?.data || [];

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Loading classes...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">Error loading classes</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const toggleClassExpand = (classId) => {
    setExpandedClassId(expandedClassId === classId ? null : classId);
    setSelectedTab('students');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📚 Class Overview</h1>
        <p className="text-gray-500 text-sm mt-1">View students and teachers for each class</p>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No classes found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((classItem) => (
            <div key={classItem.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Class Header */}
              <button
                onClick={() => toggleClassExpand(classItem.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                    classItem.grade <= 3 ? 'bg-blue-500' :
                    classItem.grade <= 5 ? 'bg-green-500' : 'bg-purple-500'
                  }`}>
                    {classItem.grade}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900">{classItem.name}</h3>
                    <p className="text-sm text-gray-500">
                      {classItem.studentCount} students • {classItem.teacherCount} teachers
                    </p>
                  </div>
                </div>
                {expandedClassId === classItem.id ? (
                  <ChevronUp className="text-blue-600" size={24} />
                ) : (
                  <ChevronDown className="text-gray-400" size={24} />
                )}
              </button>

              {/* Expanded Content */}
              {expandedClassId === classItem.id && (
                <div className="border-t bg-gray-50 py-6">
                  {/* Tabs */}
                  <div className="flex gap-2 px-6 mb-6 border-b border-gray-200">
                    <button
                      onClick={() => setSelectedTab('students')}
                      className={`pb-3 px-4 font-medium transition ${
                        selectedTab === 'students'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Users size={18} className="inline mr-2" />
                      Students ({classItem.studentCount})
                    </button>
                    <button
                      onClick={() => setSelectedTab('teachers')}
                      className={`pb-3 px-4 font-medium transition ${
                        selectedTab === 'teachers'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      👨‍🏫 Teachers ({classItem.teacherCount})
                    </button>
                  </div>

                  {/* Students Tab */}
                  {selectedTab === 'students' && (
                    <div className="px-6">
                      {studentsData?.data && studentsData.data.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-gray-100">
                                <th className="px-4 py-2 text-left font-semibold text-gray-700">Roll No</th>
                                <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                                <th className="px-4 py-2 text-left font-semibold text-gray-700">Email</th>
                                <th className="px-4 py-2 text-left font-semibold text-gray-700">Phone</th>
                                <th className="px-4 py-2 text-left font-semibold text-gray-700">Gender</th>
                                <th className="px-4 py-2 text-left font-semibold text-gray-700">Level</th>
                                <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentsData.data.map((student, idx) => (
                                <tr key={student.id} className="border-b hover:bg-gray-100">
                                  <td className="px-4 py-2 text-gray-600">{student.rollNumber || idx + 1}</td>
                                  <td className="px-4 py-2 font-medium text-gray-900">{student.name}</td>
                                  <td className="px-4 py-2 text-gray-600 text-xs">{student.email}</td>
                                  <td className="px-4 py-2 text-gray-600 text-xs">{student.phone || 'N/A'}</td>
                                  <td className="px-4 py-2 text-gray-600">{student.gender}</td>
                                  <td className="px-4 py-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      student.difficultyLevel === 'EASY' ? 'bg-green-100 text-green-700' :
                                      student.difficultyLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {student.difficultyLevel}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      student.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                      student.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {student.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No students enrolled in this class</p>
                      )}
                    </div>
                  )}

                  {/* Teachers Tab */}
                  {selectedTab === 'teachers' && (
                    <div className="px-6">
                      {teachersData?.data && teachersData.data.length > 0 ? (
                        <div className="space-y-3">
                          {teachersData.data.map((teacher) => (
                            <div key={`${teacher.teacherId}-${teacher.subject}`} className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900">{teacher.name}</h4>
                                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                                    <div>
                                      <span className="font-medium">📖 Subject:</span> {teacher.subject}
                                    </div>
                                    <div>
                                      <span className="font-medium">🆔 Employee ID:</span> {teacher.employeeId || 'N/A'}
                                    </div>
                                    <div>
                                      <span className="font-medium">📧 Email:</span> {teacher.email || 'N/A'}
                                    </div>
                                    <div>
                                      <span className="font-medium">📱 Phone:</span> {teacher.phone || 'N/A'}
                                    </div>
                                    <div>
                                      <span className="font-medium">🎓 Qualification:</span> {teacher.qualification || 'N/A'}
                                    </div>
                                    <div>
                                      <span className="font-medium">📅 Experience:</span> {teacher.experienceYears || 0} years
                                    </div>
                                  </div>
                                  <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                                    Academic Year: {teacher.academicYear}
                                  </div>
                                </div>
                                <div className="text-right text-sm">
                                  <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                    {teacher.subject}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No teachers assigned to this class</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="text-3xl font-bold text-blue-600">{classes.length}</div>
          <div className="text-gray-600 mt-1">Total Classes</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="text-3xl font-bold text-green-600">
            {classes.reduce((sum, c) => sum + (c.studentCount || 0), 0)}
          </div>
          <div className="text-gray-600 mt-1">Total Students</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="text-3xl font-bold text-purple-600">
            {classes.reduce((sum, c) => sum + (c.teacherCount || 0), 0)}
          </div>
          <div className="text-gray-600 mt-1">Total Teachers</div>
        </div>
      </div>
    </div>
  );
}

