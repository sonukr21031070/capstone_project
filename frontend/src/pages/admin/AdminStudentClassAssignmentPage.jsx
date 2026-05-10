import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, BookOpen, Save, AlertCircle, CheckCircle } from 'lucide-react'
import { adminService } from '@/store/storeAndServices'
import toast from 'react-hot-toast'

export default function AdminStudentClassAssignmentPage() {
  const queryClient = useQueryClient()
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)
  const [assignmentSuccess, setAssignmentSuccess] = useState(false)

  // Fetch unassigned students
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['unassigned-students'],
    queryFn: () => adminService.getUnassignedStudents()
  })

  // Fetch all classes
  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['all-classes'],
    queryFn: () => adminService.getAllClasses()
  })

  // Assignment mutation
  const assignmentMutation = useMutation({
    mutationFn: ({ studentId, classId }) =>
      adminService.assignStudentToClass(studentId, classId),
    onSuccess: () => {
      toast.success('Student assigned to class successfully!')
      setAssignmentSuccess(true)
      setSelectedStudent(null)
      setSelectedClass(null)
      setTimeout(() => setAssignmentSuccess(false), 3000)
      queryClient.invalidateQueries(['unassigned-students'])
      queryClient.invalidateQueries(['classes-overview'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to assign student')
    }
  })

  const students = studentsData?.data || []
  const classes = classesData?.data || []

  const handleAssignStudent = () => {
    if (!selectedStudent || !selectedClass) {
      toast.error('Please select both a student and a class')
      return
    }

    assignmentMutation.mutate({
      studentId: selectedStudent.id,
      classId: selectedClass.id
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assign Students to Classes</h1>
        <p className="text-gray-500 mt-1">Assign students to their respective classes for better organization</p>
      </div>

      {/* Success Message */}
      {assignmentSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-semibold text-green-900">✅ Assignment Successful</p>
            <p className="text-sm text-green-700 mt-1">
              {selectedStudent?.name} has been assigned to class successfully
            </p>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">

        {/* Students Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="text-indigo-600" size={20} />
            <h2 className="font-semibold text-gray-900">Select Student</h2>
          </div>

          {isLoadingStudents ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin inline-block w-5 h-5 border-3 border-gray-300 border-t-indigo-600 rounded-full"></div>
              <p className="mt-2">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
              <AlertCircle className="text-blue-600 flex-shrink-0" size={18} />
              <p className="text-sm text-blue-700">
                No unassigned students found. All students have been assigned to classes!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {students.map(student => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedStudent?.id === student.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                    {student.rollNumber && (
                      <p className="text-xs text-gray-500">Roll: {student.rollNumber}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Classes Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-purple-600" size={20} />
            <h2 className="font-semibold text-gray-900">Select Class</h2>
          </div>

          {isLoadingClasses ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin inline-block w-5 h-5 border-3 border-gray-300 border-t-purple-600 rounded-full"></div>
              <p className="mt-2">Loading classes...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
              <p className="text-sm text-red-700">
                No classes found. Please create classes first.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {classes.map(cls => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedClass?.id === cls.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <p className="font-medium text-gray-900">
                      Grade {cls.grade} {cls.section}
                    </p>
                    <p className="text-xs text-gray-500">{cls.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selection Summary */}
        {(selectedStudent || selectedClass) && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-900">Assignment Summary</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Student</p>
                <p className="font-medium text-gray-900">
                  {selectedStudent?.name || 'Not selected'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Class</p>
                <p className="font-medium text-gray-900">
                  {selectedClass ? `Grade ${selectedClass.grade} ${selectedClass.section}` : 'Not selected'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAssignStudent}
          disabled={!selectedStudent || !selectedClass || assignmentMutation.isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Save size={18} />
          {assignmentMutation.isPending ? 'Assigning...' : 'Assign Student'}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-sm font-semibold text-blue-900">ℹ️ About Class Assignment</p>
          <p className="text-sm text-blue-700 mt-1">
            This page shows students that haven't been assigned to any class yet. Once assigned, students will appear in the Class Overview section and can be managed along with their class.
          </p>
        </div>
      </div>
    </div>
  )
}

