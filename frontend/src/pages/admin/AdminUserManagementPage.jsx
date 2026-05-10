import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Users, Trash2, Search, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { adminService } from '@/store/storeAndServices'
import toast from 'react-hot-toast'

export default function AdminUserManagementPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [roleFilter, setRoleFilter] = useState(null)
  const [statusFilter, setStatusFilter] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteWarningId, setDeleteWarningId] = useState(null)

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['all-users', page, roleFilter, statusFilter],
    queryFn: () => adminService.getAllUsers({
      page,
      size: 10,
      role: roleFilter,
      status: statusFilter
    })
  })

  const deleteMutation = useMutation({
    mutationFn: (userId) => adminService.deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted successfully')
      setDeleteWarningId(null)
      queryClient.invalidateQueries(['all-users'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete user')
    }
  })

  const users = usersData?.data?.content || []
  const totalPages = usersData?.data?.totalPages || 0

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = (userId) => {
    if (deleteWarningId === userId) {
      deleteMutation.mutate(userId)
    } else {
      setDeleteWarningId(userId)
    }
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      STUDENT: 'bg-blue-100 text-blue-700',
      TEACHER: 'bg-purple-100 text-purple-700',
      PARENT: 'bg-green-100 text-green-700',
      ADMIN: 'bg-red-100 text-red-700'
    }
    return colors[role] || 'bg-gray-100 text-gray-700'
  }

  const getStatusBadgeColor = (status) => {
    const colors = {
      APPROVED: 'bg-green-100 text-green-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      REJECTED: 'bg-red-100 text-red-700',
      SUSPENDED: 'bg-orange-100 text-orange-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">Manage all users, view details, and delete accounts</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={roleFilter || ''}
            onChange={(e) => { setRoleFilter(e.target.value || null); setPage(0) }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="TEACHER">Teachers</option>
            <option value="PARENT">Parents</option>
          </select>

          <select
            value={statusFilter || ''}
            onChange={(e) => { setStatusFilter(e.target.value || null); setPage(0) }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Users size={18} className="text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Users ({usersData?.data?.totalElements || 0})</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin inline-block w-6 h-6 border-3 border-gray-300 border-t-indigo-600 rounded-full"></div>
            <p className="mt-2">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users size={40} className="mx-auto mb-3 text-gray-300" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">Registered</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs">
                          {user.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {deleteWarningId === user.id ? (
                          <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-lg">
                            <AlertTriangle size={14} className="text-red-600" />
                            <span className="text-xs text-red-700 font-medium">Sure?</span>
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={deleteMutation.isPending}
                              className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              Yes, Delete
                            </button>
                            <button
                              onClick={() => setDeleteWarningId(null)}
                              className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteWarningId(user.id)}
                            title="Permanently delete this user and all associated data"
                            className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex gap-2 justify-center">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Warning Info Box */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-sm font-semibold text-red-900">⚠️ Permanent Deletion</p>
          <p className="text-sm text-red-700 mt-1">
            Deleting a user will permanently remove them and ALL associated data including:
            <ul className="mt-2 ml-4 space-y-1 text-xs">
              <li>• <strong>Students:</strong> Submissions, Scores, Progress, Confidence Records</li>
              <li>• <strong>Teachers:</strong> Videos, Notes, Quizzes, Exercises</li>
              <li>• <strong>Parents:</strong> Child Mappings, Notifications</li>
            </ul>
            This action cannot be undone. Please be careful!
          </p>
        </div>
      </div>
    </div>
  )
}

