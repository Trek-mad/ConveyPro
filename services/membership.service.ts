'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

export interface ActiveTenantMembership {
  tenantId: string
  role: string
  userId: string
}

/**
 * Get the active tenant membership for the current user
 */
export async function getActiveTenantMembership(): Promise<ActiveTenantMembership | null> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get the user's active tenant membership
    const { data: membership, error } = await supabase
      .from('tenant_memberships')
      .select('tenant_id, role')
      .eq('user_id', user.id)
      .single()

    if (error || !membership) {
      console.error('Error fetching tenant membership:', error)
      return null
    }

    return {
      tenantId: membership.tenant_id,
      role: membership.role,
      userId: user.id,
    }
  } catch (error) {
    console.error('Error in getActiveTenantMembership:', error)
    return null
  }
}
