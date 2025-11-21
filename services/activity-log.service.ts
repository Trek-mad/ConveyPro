'use server'

import { createClient } from '@/lib/supabase/server'

// ============================================================================
// TYPES
// ============================================================================

export interface ActivityLog {
  id: string
  tenant_id: string
  matter_id: string | null
  user_id: string
  activity_type: string
  description: string
  metadata: any
  created_at: string
  user_name?: string
  user_email?: string
  matter_number?: string
  property_address?: string
}

export interface ActivityLogFilters {
  matter_id?: string
  user_id?: string
  activity_type?: string
  date_from?: string
  date_to?: string
  search_query?: string
}

export interface ActivityLogResponse {
  activities: ActivityLog[]
  total_count: number
  has_more: boolean
}

export interface UserActivitySummary {
  user_id: string
  user_name: string
  user_email: string
  total_activities: number
  activity_types: { type: string; count: number }[]
  last_activity: string
}

// ============================================================================
// LOG ACTIVITY (Used throughout the system)
// ============================================================================

export async function logActivity(data: {
  tenant_id: string
  matter_id?: string
  user_id: string
  activity_type: string
  description: string
  metadata?: any
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('matter_activities')
      .insert({
        tenant_id: data.tenant_id,
        matter_id: data.matter_id || null,
        user_id: data.user_id,
        activity_type: data.activity_type,
        description: data.description,
        metadata: data.metadata || {}
      })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Log activity error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to log activity'
    }
  }
}

// ============================================================================
// GET ACTIVITIES WITH FILTERING
// ============================================================================

export async function getActivities(
  tenant_id: string,
  filters?: ActivityLogFilters,
  limit: number = 50,
  offset: number = 0
): Promise<{ success: boolean; data?: ActivityLogResponse; error?: string }> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('matter_activities')
      .select(`
        id,
        tenant_id,
        matter_id,
        user_id,
        activity_type,
        description,
        metadata,
        created_at,
        profiles:user_id(first_name, last_name, email),
        matters:matter_id(matter_number, property_address)
      `, { count: 'exact' })
      .eq('tenant_id', tenant_id)

    // Apply filters
    if (filters?.matter_id) {
      query = query.eq('matter_id', filters.matter_id)
    }

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id)
    }

    if (filters?.activity_type) {
      query = query.eq('activity_type', filters.activity_type)
    }

    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from)
    }

    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to)
    }

    if (filters?.search_query) {
      query = query.ilike('description', `%${filters.search_query}%`)
    }

    // Order by most recent first
    query = query.order('created_at', { ascending: false })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    // Transform data to include user and matter info
    const activities: ActivityLog[] = (data || []).map(activity => ({
      id: activity.id,
      tenant_id: activity.tenant_id,
      matter_id: activity.matter_id,
      user_id: activity.user_id,
      activity_type: activity.activity_type,
      description: activity.description,
      metadata: activity.metadata,
      created_at: activity.created_at,
      user_name: (activity.profiles as any)
        ? `${(activity.profiles as any).first_name} ${(activity.profiles as any).last_name}`
        : 'Unknown User',
      user_email: (activity.profiles as any)?.email || null,
      matter_number: (activity.matters as any)?.matter_number || null,
      property_address: (activity.matters as any)?.property_address || null
    }))

    return {
      success: true,
      data: {
        activities,
        total_count: count || 0,
        has_more: (count || 0) > offset + limit
      }
    }
  } catch (error) {
    console.error('Get activities error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get activities'
    }
  }
}

// ============================================================================
// GET MATTER ACTIVITIES
// ============================================================================

export async function getMatterActivities(
  matter_id: string,
  tenant_id: string,
  limit: number = 100
): Promise<{ success: boolean; data?: ActivityLog[]; error?: string }> {
  try {
    const result = await getActivities(tenant_id, { matter_id }, limit)

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to get matter activities')
    }

    return {
      success: true,
      data: result.data.activities
    }
  } catch (error) {
    console.error('Get matter activities error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get matter activities'
    }
  }
}

// ============================================================================
// GET USER ACTIVITIES
// ============================================================================

export async function getUserActivities(
  user_id: string,
  tenant_id: string,
  limit: number = 50
): Promise<{ success: boolean; data?: ActivityLog[]; error?: string }> {
  try {
    const result = await getActivities(tenant_id, { user_id }, limit)

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to get user activities')
    }

    return {
      success: true,
      data: result.data.activities
    }
  } catch (error) {
    console.error('Get user activities error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user activities'
    }
  }
}

// ============================================================================
// GET ACTIVITY TYPES (for filtering)
// ============================================================================

export async function getActivityTypes(
  tenant_id: string
): Promise<{ success: boolean; data?: string[]; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('matter_activities')
      .select('activity_type')
      .eq('tenant_id', tenant_id)

    if (error) throw error

    // Get unique activity types
    const uniqueTypes = [...new Set(data?.map(a => a.activity_type) || [])]
    uniqueTypes.sort()

    return {
      success: true,
      data: uniqueTypes
    }
  } catch (error) {
    console.error('Get activity types error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get activity types'
    }
  }
}

// ============================================================================
// GET USER ACTIVITY SUMMARY
// ============================================================================

export async function getUserActivitySummary(
  tenant_id: string,
  date_from?: string,
  date_to?: string
): Promise<{ success: boolean; data?: UserActivitySummary[]; error?: string }> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('matter_activities')
      .select(`
        user_id,
        activity_type,
        created_at,
        profiles:user_id(first_name, last_name, email)
      `)
      .eq('tenant_id', tenant_id)

    if (date_from) {
      query = query.gte('created_at', date_from)
    }

    if (date_to) {
      query = query.lte('created_at', date_to)
    }

    const { data, error } = await query

    if (error) throw error

    // Group by user
    const userMap = new Map<string, UserActivitySummary>()

    for (const activity of data || []) {
      const userId = activity.user_id

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user_id: userId,
          user_name: (activity.profiles as any)
            ? `${(activity.profiles as any).first_name} ${(activity.profiles as any).last_name}`
            : 'Unknown User',
          user_email: (activity.profiles as any)?.email || 'Unknown',
          total_activities: 0,
          activity_types: [],
          last_activity: activity.created_at
        })
      }

      const summary = userMap.get(userId)!
      summary.total_activities++

      // Update last activity if more recent
      if (new Date(activity.created_at) > new Date(summary.last_activity)) {
        summary.last_activity = activity.created_at
      }
    }

    // Calculate activity type counts per user
    for (const [userId, summary] of userMap.entries()) {
      const userActivities = (data || []).filter(a => a.user_id === userId)
      const typeMap = new Map<string, number>()

      for (const activity of userActivities) {
        typeMap.set(activity.activity_type, (typeMap.get(activity.activity_type) || 0) + 1)
      }

      summary.activity_types = Array.from(typeMap.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
    }

    // Convert to array and sort by total activities
    const summaries = Array.from(userMap.values()).sort((a, b) => b.total_activities - a.total_activities)

    return {
      success: true,
      data: summaries
    }
  } catch (error) {
    console.error('Get user activity summary error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user activity summary'
    }
  }
}

// ============================================================================
// EXPORT ACTIVITIES TO CSV
// ============================================================================

export async function exportActivitiesToCSV(
  tenant_id: string,
  filters?: ActivityLogFilters
): Promise<{ success: boolean; data?: ActivityLog[]; error?: string }> {
  try {
    // Get all activities (no limit for export)
    const result = await getActivities(tenant_id, filters, 10000)

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to export activities')
    }

    return {
      success: true,
      data: result.data.activities
    }
  } catch (error) {
    console.error('Export activities error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export activities'
    }
  }
}

// ============================================================================
// GET RECENT ACTIVITY FEED (for dashboard widget)
// ============================================================================

export async function getRecentActivityFeed(
  tenant_id: string,
  limit: number = 10
): Promise<{ success: boolean; data?: ActivityLog[]; error?: string }> {
  try {
    const result = await getActivities(tenant_id, {}, limit)

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to get recent activity feed')
    }

    return {
      success: true,
      data: result.data.activities
    }
  } catch (error) {
    console.error('Get recent activity feed error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recent activity feed'
    }
  }
}
