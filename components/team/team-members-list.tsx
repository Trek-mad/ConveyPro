'use client'

import { TenantMembership, Profile } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { MemberActions } from './member-actions'

interface TeamMembersListProps {
  members: Array<TenantMembership & { profile?: Profile }>
  currentUserId: string
  currentUserRole: 'owner' | 'admin' | 'manager' | 'member' | 'viewer'
  tenantId: string
}

export function TeamMembersList({
  members,
  currentUserId,
  currentUserRole,
  tenantId,
}: TeamMembersListProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800'
      case 'admin':
        return 'bg-blue-100 text-blue-800'
      case 'manager':
        return 'bg-green-100 text-green-800'
      case 'member':
        return 'bg-gray-100 text-gray-800'
      case 'viewer':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'invited':
        return 'bg-yellow-100 text-yellow-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Sort members: active first, then by role importance, then by name
  const roleOrder = { owner: 0, admin: 1, manager: 2, member: 3, viewer: 4 }
  const sortedMembers = [...members].sort((a, b) => {
    // Active members first
    if (a.status === 'active' && b.status !== 'active') return -1
    if (a.status !== 'active' && b.status === 'active') return 1

    // Then by role
    const roleA = roleOrder[a.role as keyof typeof roleOrder] ?? 99
    const roleB = roleOrder[b.role as keyof typeof roleOrder] ?? 99
    if (roleA !== roleB) return roleA - roleB

    // Then by name
    const nameA = a.profile?.full_name || ''
    const nameB = b.profile?.full_name || ''
    return nameA.localeCompare(nameB)
  })

  return (
    <div className="divide-y divide-gray-200">
      {sortedMembers.map((member) => {
        const isCurrentUser = member.user_id === currentUserId
        const profile = member.profile

        return (
          <div
            key={member.id}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            {/* Member Info */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                <span className="text-lg font-semibold">
                  {profile?.full_name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>

              {/* Details */}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">
                    {profile?.full_name || 'Unknown User'}
                    {isCurrentUser && (
                      <span className="ml-2 text-sm text-gray-500">(You)</span>
                    )}
                  </p>
                </div>
                <p className="text-sm text-gray-500">{profile?.email || '—'}</p>
                {member.status === 'invited' && member.invitation_expires_at && (
                  <p className="text-xs text-yellow-600">
                    Invitation expires{' '}
                    {formatDistanceToNow(
                      new Date(member.invitation_expires_at),
                      { addSuffix: true }
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Role, Status, and Actions */}
            <div className="flex items-center gap-3">
              {/* Role Badge */}
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getRoleBadgeColor(member.role)}`}
              >
                {member.role}
              </span>

              {/* Status Badge */}
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(member.status)}`}
              >
                {member.status}
              </span>

              {/* Actions */}
              {!isCurrentUser && (
                <MemberActions
                  member={member}
                  currentUserRole={currentUserRole}
                  tenantId={tenantId}
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
