/**
 * Authentication Utilities
 *
 * Server-side authentication helpers for Next.js App Router
 */

import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile, TenantMembership } from '@/types'

/**
 * Get the current authenticated user
 * Cached for the duration of the request
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

/**
 * Get the current user's profile
 * Cached for the duration of the request
 */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
})

/**
 * Get the current user's tenant memberships
 * Cached for the duration of the request
 */
export const getUserMemberships = cache(
  async (): Promise<TenantMembership[]> => {
    const user = await getCurrentUser()
    if (!user) return []

    const supabase = await createClient()
    const { data: memberships } = await supabase
      .from('tenant_memberships')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .is('deleted_at', null)

    return memberships || []
  }
)

/**
 * Get the current user's active tenant membership
 * Returns the first active membership (in Phase 2, users typically have one tenant)
 * In future phases, this could be enhanced with tenant selection
 */
export const getActiveTenantMembership = cache(
  async (): Promise<TenantMembership | null> => {
    const memberships = await getUserMemberships()
    return memberships[0] || null
  }
)

/**
 * Check if the current user has a specific role in a tenant
 */
export async function hasRole(
  tenantId: string,
  roles: Array<'owner' | 'admin' | 'manager' | 'member' | 'viewer'>
): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  const supabase = await createClient()
  const { data: membership } = await supabase
    .from('tenant_memberships')
    .select('role')
    .eq('tenant_id', tenantId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .is('deleted_at', null)
    .single()

  if (!membership) return false
  return roles.includes(membership.role)
}

/**
 * Require authentication - throws if not authenticated
 * Use in Server Actions and Route Handlers
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

/**
 * Require a specific role - throws if not authenticated or doesn't have role
 */
export async function requireRole(
  tenantId: string,
  roles: Array<'owner' | 'admin' | 'manager' | 'member' | 'viewer'>
): Promise<void> {
  await requireAuth()
  const hasPermission = await hasRole(tenantId, roles)
  if (!hasPermission) {
    throw new Error('Forbidden: Insufficient permissions')
  }
}

/**
 * Check if user is authenticated (boolean helper)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}
