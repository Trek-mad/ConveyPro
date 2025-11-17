import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type TenantMembership = Database['public']['Tables']['tenant_memberships']['Row']
type TenantMembershipInsert = Database['public']['Tables']['tenant_memberships']['Insert']
type TenantMembershipUpdate = Database['public']['Tables']['tenant_memberships']['Update']

/**
 * Get all active team members for a tenant
 */
export async function getTeamMembers(tenantId: string) {
  const supabase = await createSupabaseClient()

  const { data: memberships, error } = await supabase
    .from('tenant_memberships')
    .select(`
      *,
      user:user_id (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching team members:', error)
    return { error: error.message }
  }

  return { memberships }
}

/**
 * Get pending invitations for a tenant
 */
export async function getPendingInvitations(tenantId: string) {
  const supabase = await createSupabaseClient()

  const { data: invitations, error } = await supabase
    .from('tenant_memberships')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', 'invited')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invitations:', error)
    return { error: error.message }
  }

  return { invitations }
}

/**
 * Invite a new team member
 * Creates a pending invitation that will be activated when the user signs up
 */
export async function inviteTeamMember(
  tenantId: string,
  email: string,
  role: TenantMembership['role'],
  invitedBy: string
) {
  const supabase = await createSupabaseClient()

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('tenant_memberships')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('user_id', invitedBy)
    .single()

  // Generate invitation token (in production, use crypto.randomBytes)
  const invitationToken = Math.random().toString(36).substring(2, 15) +
                         Math.random().toString(36).substring(2, 15)

  // Set expiry to 7 days from now
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  // For MVP, create a placeholder user invitation
  // In production, this would send an email with the invitation link
  const invitationData: TenantMembershipInsert = {
    tenant_id: tenantId,
    user_id: invitedBy, // Temporary - will be updated when user accepts
    role,
    status: 'invited',
    invited_by: invitedBy,
    invitation_token: invitationToken,
    invitation_expires_at: expiresAt.toISOString(),
  }

  const { data: invitation, error } = await supabase
    .from('tenant_memberships')
    .insert(invitationData)
    .select()
    .single()

  if (error) {
    console.error('Error creating invitation:', error)
    return { error: error.message }
  }

  // In production, send invitation email here
  // await sendInvitationEmail(email, invitationToken, tenantId)

  return {
    invitation,
    invitationLink: `/auth/accept-invitation?token=${invitationToken}`,
  }
}

/**
 * Update team member role
 */
export async function updateMemberRole(
  membershipId: string,
  role: TenantMembership['role']
) {
  const supabase = await createSupabaseClient()

  const { data: membership, error } = await supabase
    .from('tenant_memberships')
    .update({ role })
    .eq('id', membershipId)
    .select()
    .single()

  if (error) {
    console.error('Error updating member role:', error)
    return { error: error.message }
  }

  return { membership }
}

/**
 * Update team member status (active, suspended)
 */
export async function updateMemberStatus(
  membershipId: string,
  status: TenantMembership['status']
) {
  const supabase = await createSupabaseClient()

  const { data: membership, error } = await supabase
    .from('tenant_memberships')
    .update({ status })
    .eq('id', membershipId)
    .select()
    .single()

  if (error) {
    console.error('Error updating member status:', error)
    return { error: error.message }
  }

  return { membership }
}

/**
 * Remove team member (soft delete)
 */
export async function removeMember(membershipId: string) {
  const supabase = await createSupabaseClient()

  const { error } = await supabase
    .from('tenant_memberships')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', membershipId)

  if (error) {
    console.error('Error removing member:', error)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Cancel pending invitation
 */
export async function cancelInvitation(invitationId: string) {
  const supabase = await createSupabaseClient()

  const { error } = await supabase
    .from('tenant_memberships')
    .delete()
    .eq('id', invitationId)
    .eq('status', 'invited')

  if (error) {
    console.error('Error canceling invitation:', error)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Get team statistics
 */
export async function getTeamStats(tenantId: string) {
  const supabase = await createSupabaseClient()

  const { data: memberships, error } = await supabase
    .from('tenant_memberships')
    .select('role, status')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)

  if (error) {
    console.error('Error fetching team stats:', error)
    return { error: error.message }
  }

  const stats = {
    total: memberships.length,
    active: memberships.filter((m) => m.status === 'active').length,
    invited: memberships.filter((m) => m.status === 'invited').length,
    suspended: memberships.filter((m) => m.status === 'suspended').length,
    byRole: {
      owner: memberships.filter((m) => m.role === 'owner').length,
      admin: memberships.filter((m) => m.role === 'admin').length,
      manager: memberships.filter((m) => m.role === 'manager').length,
      member: memberships.filter((m) => m.role === 'member').length,
      viewer: memberships.filter((m) => m.role === 'viewer').length,
    },
  }

  return { stats }
}
