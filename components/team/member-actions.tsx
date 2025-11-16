'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TenantMembership } from '@/types'
import { updateMemberRole, removeMember } from '@/services/tenant.service'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2 } from 'lucide-react'

interface MemberActionsProps {
  member: TenantMembership
  currentUserRole: 'owner' | 'admin' | 'manager' | 'member' | 'viewer'
  tenantId: string
}

export function MemberActions({
  member,
  currentUserRole,
  tenantId,
}: MemberActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Only owners and admins can manage members
  if (!['owner', 'admin'].includes(currentUserRole)) {
    return null
  }

  // Owners can do anything, admins cannot modify other owners
  const canModify =
    currentUserRole === 'owner' ||
    (currentUserRole === 'admin' && member.role !== 'owner')

  if (!canModify) {
    return null
  }

  const handleRoleChange = async (newRole: string) => {
    if (newRole === member.role) return

    setIsLoading(true)
    setError(null)

    const result = await updateMemberRole(member.id, newRole as any)

    if ('error' in result) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.refresh()
    setIsLoading(false)
  }

  const handleRemove = async () => {
    if (
      !confirm(
        `Are you sure you want to remove ${member.profile?.full_name || 'this member'}? They will lose access to the firm immediately.`
      )
    ) {
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await removeMember(member.id)

    if ('error' in result) {
      alert(result.error)
      setIsLoading(false)
      return
    }

    router.refresh()
    setIsLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Role Selector */}
      <Select
        defaultValue={member.role}
        onValueChange={handleRoleChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="owner">Owner</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="manager">Manager</SelectItem>
          <SelectItem value="member">Member</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        disabled={isLoading}
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  )
}
