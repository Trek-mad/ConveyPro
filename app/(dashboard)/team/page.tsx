import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getActiveTenantMembership, getCurrentUser } from '@/lib/auth'
import { getTenantMembers, getTenant } from '@/services/tenant.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserPlus } from 'lucide-react'
import { TeamMembersList } from '@/components/team/team-members-list'
import { InviteMemberButton } from '@/components/team/invite-member-button'

export const metadata: Metadata = {
  title: 'Team | ConveyPro',
  description: 'Manage your team members and permissions',
}

export default async function TeamPage() {
  const user = await getCurrentUser()
  const membership = await getActiveTenantMembership()

  if (!user || !membership) {
    redirect('/login')
  }

  // Only owners and admins can access team management
  if (!['owner', 'admin'].includes(membership.role)) {
    redirect('/dashboard')
  }

  // Fetch tenant details
  const tenantResult = await getTenant(membership.tenant_id)
  const tenant = 'tenant' in tenantResult ? tenantResult.tenant : null

  // Fetch all team members
  const membersResult = await getTenantMembers(membership.tenant_id)
  const members = 'members' in membersResult ? membersResult.members : []

  // Calculate stats
  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === 'active').length,
    invited: members.filter((m) => m.status === 'invited').length,
    owners: members.filter((m) => m.role === 'owner' && m.status === 'active')
      .length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team</h1>
          <p className="mt-2 text-gray-600">
            Manage team members and their access to {tenant?.name || 'your firm'}
          </p>
        </div>
        <InviteMemberButton
          tenantId={membership.tenant_id}
          currentUserRole={membership.role}
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Total Members</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Active</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {stats.active}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Pending Invites</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">
            {stats.invited}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Owners</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {stats.owners}
          </p>
        </Card>
      </div>

      {/* Team Members List */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Team Members
        </h2>
        {members.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600">No team members found</p>
            <p className="mt-2 text-sm text-gray-500">
              Invite team members to collaborate on quotes and cases
            </p>
          </div>
        ) : (
          <TeamMembersList
            members={members}
            currentUserId={user.id}
            currentUserRole={membership.role}
            tenantId={membership.tenant_id}
          />
        )}
      </Card>

      {/* Role Descriptions */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Role Permissions
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <span className="inline-flex rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800">
                Owner
              </span>
            </div>
            <p className="text-gray-600">
              Full access to all features including billing, team management, and
              settings. Can delete the firm.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                Admin
              </span>
            </div>
            <p className="text-gray-600">
              Can manage team members, create and edit quotes, and modify firm
              settings. Cannot access billing or delete the firm.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                Manager
              </span>
            </div>
            <p className="text-gray-600">
              Can create and edit quotes, manage properties, and view team
              members. Cannot manage team or settings.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                Member
              </span>
            </div>
            <p className="text-gray-600">
              Can create and edit their own quotes and view shared properties.
              Limited access to team and settings.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                Viewer
              </span>
            </div>
            <p className="text-gray-600">
              Read-only access. Can view quotes and properties but cannot create
              or edit anything.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
