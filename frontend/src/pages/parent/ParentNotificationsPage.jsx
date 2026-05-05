import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Bell, Mail, MessageSquare, Trash2, CheckCircle, AlertCircle, Calendar, Filter, Search } from 'lucide-react'
import { parentService } from '@/store/storeAndServices'
import toast from 'react-hot-toast'

export default function ParentNotificationsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all') // all, unread, announcements, messages
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()

  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ['parent-announcements'],
    queryFn: () => parentService.getAnnouncements({ page: 0, size: 50 })
  })

  // Mock delete mutation (implement on backend)
  const deleteMutation = useMutation({
    mutationFn: async (notificationId) => {
      // This would be implemented in the backend
      return new Promise(resolve => setTimeout(resolve, 300))
    },
    onSuccess: () => {
      toast.success('Notification deleted')
      queryClient.invalidateQueries(['parent-announcements'])
    }
  })

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      return new Promise(resolve => setTimeout(resolve, 200))
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['parent-announcements'])
    }
  })

  const announcements = announcementsData?.data || []

  const filteredNotifications = announcements.filter(notif => {
    const matchesFilter = filter === 'all' ||
      (filter === 'unread' && !notif.isRead) ||
      (filter === 'announcements' && notif.type === 'ANNOUNCEMENT')

    const matchesSearch = !searchTerm ||
      notif.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.content?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'border-red-200 bg-red-50'
      case 'MEDIUM':
        return 'border-amber-200 bg-amber-50'
      case 'LOW':
        return 'border-green-200 bg-green-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <AlertCircle size={16} className="text-red-600" />
      case 'MEDIUM':
        return <Bell size={16} className="text-amber-600" />
      case 'LOW':
        return <Mail size={16} className="text-green-600" />
      default:
        return <MessageSquare size={16} className="text-gray-600" />
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return <Bell size={18} className="text-indigo-600" />
      case 'MESSAGE':
        return <Mail size={18} className="text-blue-600" />
      case 'ALERT':
        return <AlertCircle size={18} className="text-red-600" />
      default:
        return <MessageSquare size={18} className="text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications & Announcements</h1>
        <p className="text-gray-500 mt-1">Stay updated with important announcements and messages</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Search notifications"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'unread', 'announcements'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-indigo-400'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
        </div>
      )}

      {!isLoading && filteredNotifications.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-200">
          <Bell size={40} className="mx-auto mb-3 opacity-30" />
          <p>No notifications found</p>
          <p className="text-sm mt-1">You're all caught up!</p>
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && filteredNotifications.length > 0 && (
        <div className="space-y-3">
          {filteredNotifications.map((notif, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-5 transition-all hover:shadow-md ${getPriorityColor(notif.priority || 'LOW')}`}
            >
              {/* Notification Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-1">
                    {getTypeIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{notif.title}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">{notif.senderName || 'System'}</p>
                  </div>
                </div>

                {/* Status Badge */}
                {!notif.isRead && (
                  <div className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold shrink-0">
                    New
                  </div>
                )}
              </div>

              {/* Content */}
              <p className="text-sm text-gray-700 mb-3 line-clamp-3">{notif.content}</p>

              {/* Date and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={14} />
                  {new Date(notif.createdAt || Date.now()).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>

                <div className="flex gap-2">
                  {!notif.isRead && (
                    <button
                      onClick={() => markAsReadMutation.mutate(notif.id)}
                      disabled={markAsReadMutation.isPending}
                      aria-label="Mark as read"
                      className="p-1.5 rounded-lg text-green-600 hover:bg-green-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                      title="Mark as read"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate(notif.id)}
                    disabled={deleteMutation.isPending}
                    aria-label="Delete notification"
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Tags if available */}
              {notif.tags && notif.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {notif.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="px-2 py-1 rounded-full bg-white bg-opacity-50 text-xs font-medium text-gray-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {!isLoading && announcements.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{announcements.length}</p>
            <p className="text-sm text-blue-700 mt-1">Total Notifications</p>
          </div>
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{announcements.filter(a => !a.isRead).length}</p>
            <p className="text-sm text-amber-700 mt-1">Unread</p>
          </div>
          <div className="bg-red-50 rounded-2xl border border-red-200 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{announcements.filter(a => a.priority === 'HIGH').length}</p>
            <p className="text-sm text-red-700 mt-1">Important</p>
          </div>
        </div>
      )}
    </div>
  )
}

