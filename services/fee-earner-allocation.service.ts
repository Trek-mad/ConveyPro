'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth, hasRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type {
  FeeEarnerSettings,
  FeeEarnerSettingsInsert,
  FeeEarnerSettingsUpdate,
  FeeEarnerAvailability,
  FeeEarnerAvailabilityInsert,
  FeeEarnerAvailabilityUpdate,
  FeeEarnerWorkload,
} from '@/types'

/**
 * Get or create fee earner settings
 */
export async function getFeeEarnerSettings(
  feeEarnerId: string
): Promise<{ settings: FeeEarnerSettings | null } | { error: string }> {
  try {
    await requireAuth()
    const supabase = await createClient()

    const { data: settings, error } = await supabase
      .from('fee_earner_settings')
      .select('*')
      .eq('fee_earner_id', feeEarnerId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching fee earner settings:', error)
      return { error: error.message }
    }

    return { settings: settings || null }
  } catch (error) {
    console.error('Unexpected error in getFeeEarnerSettings:', error)
    return { error: 'Failed to fetch fee earner settings' }
  }
}

/**
 * Create or update fee earner settings
 */
export async function upsertFeeEarnerSettings(
  data: FeeEarnerSettingsInsert
): Promise<{ settings: FeeEarnerSettings } | { error: string }> {
  try {
    const user = await requireAuth()
    const canUpdate = await hasRole(data.tenant_id, ['owner', 'admin', 'manager'])

    if (!canUpdate) {
      return { error: 'Unauthorized to update fee earner settings' }
    }

    const supabase = await createClient()

    const { data: settings, error } = await supabase
      .from('fee_earner_settings')
      .upsert(data, {
        onConflict: 'fee_earner_id',
      })
      .select()
      .single()

    if (error) {
      console.error('Error upserting fee earner settings:', error)
      return { error: error.message }
    }

    revalidatePath('/settings/fee-earners')
    return { settings }
  } catch (error) {
    console.error('Unexpected error in upsertFeeEarnerSettings:', error)
    return { error: 'Failed to update fee earner settings' }
  }
}

/**
 * Get all fee earner settings for a tenant
 */
export async function getAllFeeEarnerSettings(
  tenantId: string
): Promise<{ settings: FeeEarnerSettings[] } | { error: string }> {
  try {
    await requireAuth()
    const supabase = await createClient()

    const { data: settings, error } = await supabase
      .from('fee_earner_settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('assignment_priority', { ascending: false })

    if (error) {
      console.error('Error fetching all fee earner settings:', error)
      return { error: error.message }
    }

    return { settings: settings || [] }
  } catch (error) {
    console.error('Unexpected error in getAllFeeEarnerSettings:', error)
    return { error: 'Failed to fetch fee earner settings' }
  }
}

/**
 * Create availability block (holiday, training, etc.)
 */
export async function createAvailabilityBlock(
  data: FeeEarnerAvailabilityInsert
): Promise<{ availability: FeeEarnerAvailability } | { error: string }> {
  try {
    const user = await requireAuth()
    const canCreate = await hasRole(data.tenant_id, ['owner', 'admin', 'manager', 'member'])

    if (!canCreate) {
      return { error: 'Unauthorized to create availability blocks' }
    }

    const supabase = await createClient()

    const availabilityData: FeeEarnerAvailabilityInsert = {
      ...data,
      created_by: user.id,
    }

    const { data: availability, error } = await supabase
      .from('fee_earner_availability')
      .insert(availabilityData)
      .select()
      .single()

    if (error) {
      console.error('Error creating availability block:', error)
      return { error: error.message }
    }

    revalidatePath('/settings/fee-earners')
    return { availability }
  } catch (error) {
    console.error('Unexpected error in createAvailabilityBlock:', error)
    return { error: 'Failed to create availability block' }
  }
}

/**
 * Get availability blocks for a fee earner
 */
export async function getFeeEarnerAvailability(
  feeEarnerId: string,
  startDate?: string,
  endDate?: string
): Promise<{ availability: FeeEarnerAvailability[] } | { error: string }> {
  try {
    await requireAuth()
    const supabase = await createClient()

    let query = supabase
      .from('fee_earner_availability')
      .select('*')
      .eq('fee_earner_id', feeEarnerId)
      .is('deleted_at', null)
      .order('start_date', { ascending: true })

    if (startDate) {
      query = query.gte('end_date', startDate)
    }
    if (endDate) {
      query = query.lte('start_date', endDate)
    }

    const { data: availability, error } = await query

    if (error) {
      console.error('Error fetching availability:', error)
      return { error: error.message }
    }

    return { availability: availability || [] }
  } catch (error) {
    console.error('Unexpected error in getFeeEarnerAvailability:', error)
    return { error: 'Failed to fetch availability' }
  }
}

/**
 * Update availability block
 */
export async function updateAvailabilityBlock(
  availabilityId: string,
  updates: FeeEarnerAvailabilityUpdate
): Promise<{ availability: FeeEarnerAvailability } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing availability
    const { data: existing, error: fetchError } = await supabase
      .from('fee_earner_availability')
      .select('tenant_id')
      .eq('id', availabilityId)
      .single()

    if (fetchError || !existing) {
      return { error: 'Availability block not found' }
    }

    const canUpdate = await hasRole(existing.tenant_id, ['owner', 'admin', 'manager', 'member'])

    if (!canUpdate) {
      return { error: 'Unauthorized to update availability' }
    }

    const { data: availability, error } = await supabase
      .from('fee_earner_availability')
      .update(updates)
      .eq('id', availabilityId)
      .select()
      .single()

    if (error) {
      console.error('Error updating availability:', error)
      return { error: error.message }
    }

    revalidatePath('/settings/fee-earners')
    return { availability }
  } catch (error) {
    console.error('Unexpected error in updateAvailabilityBlock:', error)
    return { error: 'Failed to update availability' }
  }
}

/**
 * Delete availability block (soft delete)
 */
export async function deleteAvailabilityBlock(
  availabilityId: string
): Promise<{ success: true } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing availability
    const { data: existing, error: fetchError } = await supabase
      .from('fee_earner_availability')
      .select('tenant_id')
      .eq('id', availabilityId)
      .single()

    if (fetchError || !existing) {
      return { error: 'Availability block not found' }
    }

    const canDelete = await hasRole(existing.tenant_id, ['owner', 'admin', 'manager'])

    if (!canDelete) {
      return { error: 'Unauthorized to delete availability' }
    }

    const { error } = await supabase
      .from('fee_earner_availability')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', availabilityId)

    if (error) {
      console.error('Error deleting availability:', error)
      return { error: error.message }
    }

    revalidatePath('/settings/fee-earners')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in deleteAvailabilityBlock:', error)
    return { error: 'Failed to delete availability' }
  }
}

/**
 * Calculate workload for a fee earner
 */
export async function calculateFeeEarnerWorkload(
  feeEarnerId: string
): Promise<{ workload: FeeEarnerWorkload } | { error: string }> {
  try {
    await requireAuth()
    const supabase = await createClient()

    // Get fee earner settings
    const { data: settings } = await supabase
      .from('fee_earner_settings')
      .select('*')
      .eq('fee_earner_id', feeEarnerId)
      .single()

    if (!settings) {
      return {
        workload: {
          active_matters: 0,
          max_concurrent_matters: 0,
          new_matters_this_week: 0,
          max_new_matters_per_week: 0,
          capacity_used: 0,
          weekly_capacity_used: 0,
          is_available: false,
          accepts_auto_assignment: false,
          assignment_priority: 0,
          settings_configured: false,
        },
      }
    }

    // Count active matters
    const { count: activeMatters, error: activeError } = await supabase
      .from('matters')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_fee_earner_id', feeEarnerId)
      .in('status', ['new', 'active'])

    if (activeError) {
      console.error('Error counting active matters:', activeError)
      return { error: 'Failed to calculate workload' }
    }

    // Count new matters this week
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const { count: newMattersThisWeek, error: weekError } = await supabase
      .from('matters')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_fee_earner_id', feeEarnerId)
      .gte('created_at', weekStart.toISOString())

    if (weekError) {
      console.error('Error counting new matters this week:', weekError)
      return { error: 'Failed to calculate workload' }
    }

    // Check current availability
    const today = new Date().toISOString().split('T')[0]
    const { data: availability } = await supabase
      .from('fee_earner_availability')
      .select('*')
      .eq('fee_earner_id', feeEarnerId)
      .lte('start_date', today)
      .gte('end_date', today)
      .eq('is_available', false)
      .is('deleted_at', null)
      .single()

    const isCurrentlyAvailable = !availability

    const capacityUsed =
      settings.max_concurrent_matters > 0
        ? ((activeMatters || 0) / settings.max_concurrent_matters) * 100
        : 0

    const weeklyCapacityUsed =
      settings.max_new_matters_per_week > 0
        ? ((newMattersThisWeek || 0) / settings.max_new_matters_per_week) * 100
        : 0

    const workload: FeeEarnerWorkload = {
      active_matters: activeMatters || 0,
      max_concurrent_matters: settings.max_concurrent_matters,
      new_matters_this_week: newMattersThisWeek || 0,
      max_new_matters_per_week: settings.max_new_matters_per_week,
      capacity_used: Math.round(capacityUsed),
      weekly_capacity_used: Math.round(weeklyCapacityUsed),
      is_available: isCurrentlyAvailable,
      accepts_auto_assignment: settings.accepts_auto_assignment,
      assignment_priority: settings.assignment_priority,
      settings_configured: true,
    }

    return { workload }
  } catch (error) {
    console.error('Unexpected error in calculateFeeEarnerWorkload:', error)
    return { error: 'Failed to calculate workload' }
  }
}

/**
 * Get all fee earners with their workload
 */
export async function getAllFeeEarnersWithWorkload(
  tenantId: string
): Promise<
  | {
      feeEarners: Array<{
        id: string
        full_name: string
        email: string
        role: string
        settings: FeeEarnerSettings | null
        workload: FeeEarnerWorkload
      }>
    }
  | { error: string }
> {
  try {
    await requireAuth()
    const supabase = await createClient()

    // Get all fee earners (profiles with member+ roles)
    const { data: profiles, error: profilesError } = await supabase
      .from('tenant_memberships')
      .select(
        `
        profile:profiles!inner(
          id,
          full_name,
          email
        ),
        role
      `
      )
      .eq('tenant_id', tenantId)
      .in('role', ['member', 'manager', 'admin', 'owner'])

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return { error: 'Failed to fetch fee earners' }
    }

    // Get settings and workload for each fee earner
    const feeEarnersData = await Promise.all(
      (profiles || []).map(async (membership: any) => {
        const profile = membership.profile
        const settingsResult = await getFeeEarnerSettings(profile.id)
        const workloadResult = await calculateFeeEarnerWorkload(profile.id)

        return {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          role: membership.role,
          settings: 'settings' in settingsResult ? settingsResult.settings : null,
          workload: 'workload' in workloadResult ? workloadResult.workload : {
            active_matters: 0,
            max_concurrent_matters: 0,
            new_matters_this_week: 0,
            max_new_matters_per_week: 0,
            capacity_used: 0,
            weekly_capacity_used: 0,
            is_available: false,
            accepts_auto_assignment: false,
            assignment_priority: 0,
            settings_configured: false,
          },
        }
      })
    )

    return { feeEarners: feeEarnersData }
  } catch (error) {
    console.error('Unexpected error in getAllFeeEarnersWithWorkload:', error)
    return { error: 'Failed to fetch fee earners with workload' }
  }
}

/**
 * Auto-assign matter to best available fee earner
 */
export async function autoAssignMatter(
  matterId: string,
  matterType: string,
  transactionValue: number
): Promise<{ feeEarnerId: string; feeEarnerName: string } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get matter to check tenant
    const { data: matter, error: matterError } = await supabase
      .from('matters')
      .select('tenant_id')
      .eq('id', matterId)
      .single()

    if (matterError || !matter) {
      return { error: 'Matter not found' }
    }

    const canAssign = await hasRole(matter.tenant_id, ['owner', 'admin', 'manager'])

    if (!canAssign) {
      return { error: 'Unauthorized to assign matters' }
    }

    // Get all fee earners with workload
    const result = await getAllFeeEarnersWithWorkload(matter.tenant_id)

    if ('error' in result) {
      return result
    }

    // Filter eligible fee earners
    const eligible = result.feeEarners.filter((fe) => {
      if (!fe.settings || !fe.workload.settings_configured) return false
      if (!fe.workload.accepts_auto_assignment) return false
      if (!fe.workload.is_available) return false

      // Check matter type
      if (fe.settings.matter_types.length > 0 && !fe.settings.matter_types.includes(matterType)) {
        return false
      }

      // Check transaction value limits
      if (fe.settings.max_transaction_value && transactionValue > fe.settings.max_transaction_value) {
        return false
      }
      if (fe.settings.min_transaction_value && transactionValue < fe.settings.min_transaction_value) {
        return false
      }

      // Check capacity
      if (fe.workload.capacity_used >= 100) return false
      if (fe.workload.weekly_capacity_used >= 100) return false

      return true
    })

    if (eligible.length === 0) {
      return { error: 'No available fee earners found for auto-assignment' }
    }

    // Sort by priority, then by capacity (lowest capacity first)
    eligible.sort((a, b) => {
      if (a.workload.assignment_priority !== b.workload.assignment_priority) {
        return b.workload.assignment_priority - a.workload.assignment_priority
      }
      return a.workload.capacity_used - b.workload.capacity_used
    })

    const selected = eligible[0]

    // Assign matter
    const { error: assignError } = await supabase
      .from('matters')
      .update({ assigned_fee_earner_id: selected.id })
      .eq('id', matterId)

    if (assignError) {
      console.error('Error assigning matter:', assignError)
      return { error: 'Failed to assign matter' }
    }

    revalidatePath(`/matters/${matterId}`)
    return {
      feeEarnerId: selected.id,
      feeEarnerName: selected.full_name,
    }
  } catch (error) {
    console.error('Unexpected error in autoAssignMatter:', error)
    return { error: 'Failed to auto-assign matter' }
  }
}

/**
 * Manually assign matter to fee earner
 */
export async function manuallyAssignMatter(
  matterId: string,
  feeEarnerId: string
): Promise<{ success: true } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get matter to check tenant
    const { data: matter, error: matterError } = await supabase
      .from('matters')
      .select('tenant_id')
      .eq('id', matterId)
      .single()

    if (matterError || !matter) {
      return { error: 'Matter not found' }
    }

    const canAssign = await hasRole(matter.tenant_id, ['owner', 'admin', 'manager'])

    if (!canAssign) {
      return { error: 'Unauthorized to assign matters' }
    }

    const { error: assignError } = await supabase
      .from('matters')
      .update({ assigned_fee_earner_id: feeEarnerId })
      .eq('id', matterId)

    if (assignError) {
      console.error('Error assigning matter:', assignError)
      return { error: 'Failed to assign matter' }
    }

    revalidatePath(`/matters/${matterId}`)
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in manuallyAssignMatter:', error)
    return { error: 'Failed to assign matter' }
  }
}

/**
 * Get assignment recommendations for a matter
 */
export async function getAssignmentRecommendations(
  matterId: string
): Promise<
  | {
      recommendations: Array<{
        feeEarner: {
          id: string
          full_name: string
          email: string
        }
        score: number
        reason: string
        workload: FeeEarnerWorkload
      }>
    }
  | { error: string }
> {
  try {
    await requireAuth()
    const supabase = await createClient()

    // Get matter details
    const { data: matter, error: matterError } = await supabase
      .from('matters')
      .select('tenant_id, matter_type, purchase_price')
      .eq('id', matterId)
      .single()

    if (matterError || !matter) {
      return { error: 'Matter not found' }
    }

    // Get all fee earners with workload
    const result = await getAllFeeEarnersWithWorkload(matter.tenant_id)

    if ('error' in result) {
      return result
    }

    // Calculate scores for each fee earner
    const recommendations = result.feeEarners
      .map((fe) => {
        let score = 0
        let reasons: string[] = []

        if (!fe.settings || !fe.workload.settings_configured) {
          return null
        }

        // Base score from priority
        score += fe.workload.assignment_priority * 10

        // Available
        if (fe.workload.is_available) {
          score += 50
          reasons.push('Available now')
        } else {
          reasons.push('Currently unavailable')
        }

        // Capacity check
        if (fe.workload.capacity_used < 50) {
          score += 30
          reasons.push('Low workload')
        } else if (fe.workload.capacity_used < 75) {
          score += 20
          reasons.push('Moderate workload')
        } else if (fe.workload.capacity_used < 90) {
          score += 10
          reasons.push('High workload')
        } else {
          reasons.push('At capacity')
        }

        // Weekly capacity
        if (fe.workload.weekly_capacity_used < 100) {
          score += 20
          reasons.push('Weekly capacity available')
        } else {
          reasons.push('Weekly limit reached')
        }

        // Matter type match
        if (
          fe.settings.matter_types.length === 0 ||
          fe.settings.matter_types.includes(matter.matter_type)
        ) {
          score += 20
          reasons.push('Handles this matter type')
        }

        // Transaction value within limits
        const transactionValue = matter.purchase_price ? Number(matter.purchase_price) : 0
        if (
          (!fe.settings.max_transaction_value ||
            transactionValue <= fe.settings.max_transaction_value) &&
          (!fe.settings.min_transaction_value ||
            transactionValue >= fe.settings.min_transaction_value)
        ) {
          score += 15
          reasons.push('Transaction value in range')
        }

        return {
          feeEarner: {
            id: fe.id,
            full_name: fe.full_name,
            email: fe.email,
          },
          score,
          reason: reasons.join(' • '),
          workload: fe.workload,
        }
      })
      .filter((r) => r !== null)
      .sort((a, b) => b!.score - a!.score)

    return { recommendations: recommendations as any }
  } catch (error) {
    console.error('Unexpected error in getAssignmentRecommendations:', error)
    return { error: 'Failed to get recommendations' }
  }
}
