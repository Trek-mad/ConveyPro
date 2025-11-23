// @ts-nocheck
'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth, hasRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type {
  Matter,
  MatterInsert,
  MatterUpdate,
  MatterWithRelations,
} from '@/types'

/**
 * Generate a unique matter number for a tenant
 * Format: M00001-25 (M + 5 digits + year)
 */
async function generateMatterNumber(tenantId: string): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('generate_matter_number', {
    p_tenant_id: tenantId,
  })

  if (error) {
    console.error('Error generating matter number:', error)
    throw new Error('Failed to generate matter number')
  }

  return data as string
}

/**
 * Create a new matter
 */
export async function createMatter(
  data: Omit<MatterInsert, 'matter_number'>
): Promise<{ matter: Matter } | { error: string }> {
  try {
    const user = await requireAuth()
    const canCreate = await hasRole(data.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canCreate) {
      return { error: 'Unauthorized to create matters' }
    }

    const supabase = await createClient()

    // Generate matter number
    const matterNumber = await generateMatterNumber(data.tenant_id)

    // Create matter
    const { data: matter, error } = await supabase
      .from('matters')
      .insert({
        ...data,
        matter_number: matterNumber,
        created_by: user.id,
        current_stage: data.current_stage || 'client_entry',
        status: data.status || 'new',
        priority: data.priority || 'normal',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating matter:', error)
      return { error: error.message }
    }

    revalidatePath('/matters')
    return { matter }
  } catch (error) {
    console.error('Unexpected error in createMatter:', error)
    return { error: 'Failed to create matter' }
  }
}

/**
 * Get a matter by ID
 */
export async function getMatter(
  matterId: string
): Promise<{ matter: Matter } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: matter, error } = await supabase
      .from('matters')
      .select('*')
      .eq('id', matterId)
      .is('deleted_at', null)
      .single()

    if (error) {
      console.error('Error fetching matter:', error)
      return { error: 'Matter not found' }
    }

    // Check user has access to this matter's tenant
    const hasAccess = await hasRole(matter.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
      'viewer',
    ])

    if (!hasAccess) {
      return { error: 'Unauthorized' }
    }

    return { matter }
  } catch (error) {
    console.error('Unexpected error in getMatter:', error)
    return { error: 'Failed to fetch matter' }
  }
}

/**
 * Get a matter with all related entities
 */
export async function getMatterWithRelations(
  matterId: string
): Promise<{ matter: MatterWithRelations } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: matter, error } = await supabase
      .from('matters')
      .select(`
        *,
        primary_client:clients!primary_client_id(*),
        secondary_client:clients!secondary_client_id(*),
        property:properties(*),
        quote:quotes(*),
        assigned_fee_earner:profiles!assigned_fee_earner_id(*)
      `)
      .eq('id', matterId)
      .is('deleted_at', null)
      .single()

    if (error) {
      console.error('Error fetching matter with relations:', error)
      return { error: 'Matter not found' }
    }

    // Check user has access
    const hasAccess = await hasRole(matter.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
      'viewer',
    ])

    if (!hasAccess) {
      return { error: 'Unauthorized' }
    }

    return { matter: matter as MatterWithRelations }
  } catch (error) {
    console.error('Unexpected error in getMatterWithRelations:', error)
    return { error: 'Failed to fetch matter' }
  }
}

/**
 * List matters for a tenant with optional filtering
 */
export async function listMatters(
  tenantId: string,
  filters?: {
    status?: Matter['status']
    current_stage?: Matter['current_stage']
    assigned_fee_earner_id?: string
    priority?: Matter['priority']
    search?: string
  }
): Promise<{ matters: Matter[] } | { error: string }> {
  try {
    const user = await requireAuth()
    const hasAccess = await hasRole(tenantId, [
      'owner',
      'admin',
      'manager',
      'member',
      'viewer',
    ])

    if (!hasAccess) {
      return { error: 'Unauthorized' }
    }

    const supabase = await createClient()

    let query = supabase
      .from('matters')
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.current_stage) {
      query = query.eq('current_stage', filters.current_stage)
    }
    if (filters?.assigned_fee_earner_id) {
      query = query.eq('assigned_fee_earner_id', filters.assigned_fee_earner_id)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.search) {
      query = query.or(
        `matter_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
      )
    }

    const { data: matters, error } = await query

    if (error) {
      console.error('Error listing matters:', error)
      return { error: error.message }
    }

    return { matters: matters || [] }
  } catch (error) {
    console.error('Unexpected error in listMatters:', error)
    return { error: 'Failed to list matters' }
  }
}

/**
 * Update a matter
 */
export async function updateMatter(
  matterId: string,
  updates: MatterUpdate
): Promise<{ matter: Matter } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing matter to check tenant
    const { data: existingMatter, error: fetchError } = await supabase
      .from('matters')
      .select('tenant_id')
      .eq('id', matterId)
      .single()

    if (fetchError || !existingMatter) {
      return { error: 'Matter not found' }
    }

    const canUpdate = await hasRole(existingMatter.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canUpdate) {
      return { error: 'Unauthorized to update matters' }
    }

    const { data: matter, error } = await supabase
      .from('matters')
      .update({
        ...updates,
        updated_by: user.id,
      })
      .eq('id', matterId)
      .select()
      .single()

    if (error) {
      console.error('Error updating matter:', error)
      return { error: error.message }
    }

    revalidatePath('/matters')
    revalidatePath(`/matters/${matterId}`)
    return { matter }
  } catch (error) {
    console.error('Unexpected error in updateMatter:', error)
    return { error: 'Failed to update matter' }
  }
}

/**
 * Delete a matter (soft delete)
 */
export async function deleteMatter(
  matterId: string
): Promise<{ success: true } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing matter to check tenant
    const { data: existingMatter, error: fetchError } = await supabase
      .from('matters')
      .select('tenant_id')
      .eq('id', matterId)
      .single()

    if (fetchError || !existingMatter) {
      return { error: 'Matter not found' }
    }

    const canDelete = await hasRole(existingMatter.tenant_id, [
      'owner',
      'admin',
      'manager',
    ])

    if (!canDelete) {
      return { error: 'Unauthorized to delete matters' }
    }

    const { error } = await supabase
      .from('matters')
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', matterId)

    if (error) {
      console.error('Error deleting matter:', error)
      return { error: error.message }
    }

    revalidatePath('/matters')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in deleteMatter:', error)
    return { error: 'Failed to delete matter' }
  }
}

/**
 * Transition matter to new workflow stage
 */
export async function transitionMatterStage(
  matterId: string,
  newStage: string
): Promise<{ matter: Matter } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get current matter
    const { data: matter, error: fetchError } = await supabase
      .from('matters')
      .select('*')
      .eq('id', matterId)
      .single()

    if (fetchError || !matter) {
      return { error: 'Matter not found' }
    }

    const canUpdate = await hasRole(matter.tenant_id, [
      'owner',
      'admin',
      'manager',
      'member',
    ])

    if (!canUpdate) {
      return { error: 'Unauthorized' }
    }

    // TODO: Add validation logic to check if transition is allowed
    // (check required tasks are completed, etc.)

    // Update stage
    const { data: updatedMatter, error: updateError } = await supabase
      .from('matters')
      .update({
        current_stage: newStage,
        current_stage_started_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', matterId)
      .select()
      .single()

    if (updateError) {
      console.error('Error transitioning stage:', updateError)
      return { error: updateError.message }
    }

    // Note: Task auto-generation is handled by database trigger

    revalidatePath(`/matters/${matterId}`)
    return { matter: updatedMatter }
  } catch (error) {
    console.error('Unexpected error in transitionMatterStage:', error)
    return { error: 'Failed to transition stage' }
  }
}

/**
 * Assign matter to fee earner
 */
export async function assignMatter(
  matterId: string,
  feeEarnerId: string
): Promise<{ matter: Matter } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get matter to check tenant
    const { data: matter, error: fetchError } = await supabase
      .from('matters')
      .select('tenant_id')
      .eq('id', matterId)
      .single()

    if (fetchError || !matter) {
      return { error: 'Matter not found' }
    }

    const canAssign = await hasRole(matter.tenant_id, [
      'owner',
      'admin',
      'manager',
    ])

    if (!canAssign) {
      return { error: 'Unauthorized to assign matters' }
    }

    const { data: updatedMatter, error: updateError } = await supabase
      .from('matters')
      .update({
        assigned_fee_earner_id: feeEarnerId,
        assigned_at: new Date().toISOString(),
        assigned_by: user.id,
        updated_by: user.id,
      })
      .eq('id', matterId)
      .select()
      .single()

    if (updateError) {
      console.error('Error assigning matter:', updateError)
      return { error: updateError.message }
    }

    // Note: Activity log is handled by database trigger

    revalidatePath(`/matters/${matterId}`)
    return { matter: updatedMatter }
  } catch (error) {
    console.error('Unexpected error in assignMatter:', error)
    return { error: 'Failed to assign matter' }
  }
}
