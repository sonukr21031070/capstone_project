import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { UserCheck, CheckCircle, XCircle } from 'lucide-react'
import { adminService } from '@/store/storeAndServices'
import toast from 'react-hot-toast'

export default function AdminApprovalsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: pendingData } = useQuery({
    queryKey: ['pending-users'],
    queryFn: () => adminService.getPendingUsers({ page: 0, size: 10 })
  })

  const approveMutation = useMutation({
    mutationFn: adminService.approveUser,
    onSuccess: () => {
      toast.success('User approved')
      queryClient.invalidateQueries(['pending-users', 'admin-stats'])
    }
  })

  const rejectMutation = useMutation({
    mutationFn: (id) => adminService.rejectUser(id),
    onSuccess: () => {
      toast.success('User rejected')
      queryClient.invalidateQueries(['pending-users', 'admin-stats'])
    }
  })

  const pending = pendingData?.data?.content || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.pendingApprovals')}</h1>
        <p className="text-gray-500 mt-1">Review and approve pending user registrations</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <UserCheck size={18} className="text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Pending Approvals</h2>
          {pending.length > 0 && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
              {pending.length}
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle size={40} className="mx-auto mb-3 text-green-400" />
            <p>All caught up! No pending approvals.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {pending.map(user => (
              <li key={user.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm shrink-0">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">{user.email} • {user.role}</p>
                  <p className="text-xs text-gray-400">Registered: {new Date(user.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveMutation.mutate(user.id)}
                    disabled={approveMutation.isPending}
                    aria-label={`Approve ${user.fullName}`}
                    className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                  </button>
                  <button
                    onClick={() => rejectMutation.mutate(user.id)}
                    disabled={rejectMutation.isPending}
                    aria-label={`Reject ${user.fullName}`}
                    className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

