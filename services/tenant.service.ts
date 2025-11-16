/**
 * Tenant Service
 *
 * Business logic for tenant and membership management
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import type {
  Tenant,
  TenantInsert,
  TenantUpdate,
  TenantMembership,
  TenantMembershipInsert,
  TenantMembershipWithUser,
} from '@/types'
import { revalidatePath } from 'next/cache'

/**
 * Create a new tenant
 * Automatically creates the first user as owner
 */
export async function createTenant(
  data: Omit<TenantInsert, 'created_by'>
): Promise<{ tenant: Tenant; membership: TenantMembership } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Create tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        ...data,
        created_by: user.id,
      })
      .select()
      .single()

    if (tenantError || !tenant) {
      return { error: tenantError?.message || 'Failed to create tenant' }
    }

    // Create owner membership
    const { data: membership, error: membershipError } = await supabase
      .from('tenant_memberships')
      .insert({
        tenant_id: tenant.id,
        user_id: user.id,
        role: 'owner',
        status: 'active',
        created_by: user.id,
      })
      .select()
      .single()

    if (membershipError || !membership) {
      // Rollback tenant creation
      await supabase.from('tenants').delete().eq('id', tenant.id)
      return {
        error: membershipError?.message || 'Failed to create membership',
      }
    }

    revalidatePath('/')
    return { tenant, membership }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update a tenant
 */
export async function updateTenant(
  tenantId: string,
  data: TenantUpdate
): Promise<{ tenant: Tenant } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Check if user has permission (must be owner or admin)
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return { error: 'Unauthorized' }
    }

    const { data: tenant, error } = await supabase
      .from('tenants')
      .update(data)
      .eq('id', tenantId)
      .select()
      .single()

    if (error || !tenant) {
      return { error: error?.message || 'Failed to update tenant' }
    }

    revalidatePath('/')
    return { tenant }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get tenant by ID
 */
export async function getTenant(
  tenantId: string
): Promise<{ tenant: Tenant } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Verify user has access to this tenant
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership) {
      return { error: 'Unauthorized' }
    }

    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single()

    if (error || !tenant) {
      return { error: error?.message || 'Tenant not found' }
    }

    return { tenant }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get all members of a tenant
 */
export async function getTenantMembers(
  tenantId: string
): Promise<{ members: TenantMembershipWithUser[] } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Verify user has access to this tenant
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership) {
      return { error: 'Unauthorized' }
    }

    const { data: members, error } = await supabase
      .from('tenant_memberships')
      .select(
        `
        *,
        profile:profiles(*)
      `
      )
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)

    if (error) {
      return { error: error.message }
    }

    return {
      members: ((members || []) as unknown) as TenantMembershipWithUser[],
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Invite a user to a tenant
 */
export async function inviteUserToTenant(
  tenantId: string,
  email: string,
  role: 'admin' | 'manager' | 'member' | 'viewer' = 'member'
): Promise<{ membership: TenantMembership } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Check if inviter has permission (must be owner or admin)
    const { data: inviterMembership } = await supabase
      .from('tenant_memberships')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (
      !inviterMembership ||
      !['owner', 'admin'].includes(inviterMembership.role)
    ) {
      return { error: 'Unauthorized' }
    }

    // TODO: Phase 2+ - Implement actual email invitation flow
    // For now, this is a placeholder

    // Generate invitation token
    const invitationToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    // Note: In a real implementation, we'd check if user exists first
    // For Phase 2, this is simplified

    const { data: membership, error } = await supabase
      .from('tenant_memberships')
      .insert({
        tenant_id: tenantId,
        user_id: user.id, // TODO: Should be the invited user's ID
        role,
        status: 'invited',
        invited_by: user.id,
        invitation_token: invitationToken,
        invitation_expires_at: expiresAt.toISOString(),
        created_by: user.id,
      })
      .select()
      .single()

    if (error || !membership) {
      return { error: error?.message || 'Failed to create invitation' }
    }

    // TODO: Send invitation email via enqueueEmail()

    revalidatePath('/')
    return { membership }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update a member's role
 */
export async function updateMemberRole(
  membershipId: string,
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer'
): Promise<{ membership: TenantMembership } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get the membership to find tenant_id
    const { data: targetMembership } = await supabase
      .from('tenant_memberships')
      .select('tenant_id')
      .eq('id', membershipId)
      .single()

    if (!targetMembership) {
      return { error: 'Membership not found' }
    }

    // Check if user has permission (must be owner or admin)
    const { data: userMembership } = await supabase
      .from('tenant_memberships')
      .select('role')
      .eq('tenant_id', targetMembership.tenant_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      return { error: 'Unauthorized' }
    }

    const { data: membership, error } = await supabase
      .from('tenant_memberships')
      .update({ role })
      .eq('id', membershipId)
      .select()
      .single()

    if (error || !membership) {
      return { error: error?.message || 'Failed to update role' }
    }

    revalidatePath('/')
    return { membership }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Remove a member from a tenant
 */
export async function removeMember(
  membershipId: string
): Promise<{ success: true } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get the membership to find tenant_id
    const { data: targetMembership } = await supabase
      .from('tenant_memberships')
      .select('tenant_id, role')
      .eq('id', membershipId)
      .single()

    if (!targetMembership) {
      return { error: 'Membership not found' }
    }

    // Prevent removing the last owner
    if (targetMembership.role === 'owner') {
      const { count: ownerCount } = await supabase
        .from('tenant_memberships')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', targetMembership.tenant_id)
        .eq('role', 'owner')
        .eq('status', 'active')

      if ((ownerCount ?? 0) <= 1) {
        return { error: 'Cannot remove the last owner' }
      }
    }

    // Check if user has permission (must be owner)
    const { data: userMembership } = await supabase
      .from('tenant_memberships')
      .select('role')
      .eq('tenant_id', targetMembership.tenant_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!userMembership || userMembership.role !== 'owner') {
      return { error: 'Unauthorized' }
    }

    // Soft delete the membership
    const { error } = await supabase
      .from('tenant_memberships')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', membershipId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
