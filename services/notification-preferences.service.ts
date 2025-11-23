'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

export interface NotificationPreferences {
  email_enabled: boolean
  task_reminders: boolean
  closing_date_reminders: boolean
  overdue_task_alerts: boolean
  matter_assignment_notifications: boolean
  offer_notifications: boolean
  document_verification_notifications: boolean
  reminder_frequency: 'daily' | 'immediately' | 'weekly'
  reminder_days_before: number[] // e.g., [1, 3, 7]
  quiet_hours_enabled: boolean
  quiet_hours_start: string // e.g., "22:00"
  quiet_hours_end: string // e.g., "08:00"
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  email_enabled: true,
  task_reminders: true,
  closing_date_reminders: true,
  overdue_task_alerts: true,
  matter_assignment_notifications: true,
  offer_notifications: true,
  document_verification_notifications: true,
  reminder_frequency: 'immediately',
  reminder_days_before: [1, 3, 7],
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
}

/**
 * Get notification preferences for a user
 */
export async function getNotificationPreferences(userId?: string) {
  const user = await requireAuth()
  const targetUserId = userId || user.id
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('metadata')
    .eq('id', targetUserId)
    .single()

  if (error) {
    console.error('Error fetching notification preferences:', error)
    return { error: error.message }
  }

  const metadata = profile?.metadata as any
  const preferences = metadata?.notification_preferences || DEFAULT_PREFERENCES

  return { preferences: preferences as NotificationPreferences }
}

/**
 * Update notification preferences for a user
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>,
  userId?: string
) {
  const user = await requireAuth()
  const targetUserId = userId || user.id
  const supabase = await createClient()

  // Only allow users to update their own preferences
  if (targetUserId !== user.id) {
    return { error: 'Unauthorized: Can only update own preferences' }
  }

  // Get current preferences
  const currentResult = await getNotificationPreferences(targetUserId)
  if ('error' in currentResult) {
    return currentResult
  }

  // Merge with new preferences
  const updatedPreferences = {
    ...currentResult.preferences,
    ...preferences,
  }

  // Get current metadata
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('metadata')
    .eq('id', targetUserId)
    .single()

  if (fetchError) {
    console.error('Error fetching profile metadata:', fetchError)
    return { error: fetchError.message }
  }

  const currentMetadata = (profile?.metadata as any) || {}

  // Update metadata with new preferences
  const { data, error } = await supabase
    .from('profiles')
    .update({
      metadata: {
        ...currentMetadata,
        notification_preferences: updatedPreferences,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', targetUserId)
    .select()
    .single()

  if (error) {
    console.error('Error updating notification preferences:', error)
    return { error: error.message }
  }

  return { preferences: updatedPreferences }
}

/**
 * Reset notification preferences to defaults
 */
export async function resetNotificationPreferences(userId?: string) {
  const user = await requireAuth()
  const targetUserId = userId || user.id

  // Only allow users to reset their own preferences
  if (targetUserId !== user.id) {
    return { error: 'Unauthorized: Can only reset own preferences' }
  }

  return updateNotificationPreferences(DEFAULT_PREFERENCES, targetUserId)
}

/**
 * Check if notifications should be sent based on quiet hours
 */
export async function isWithinQuietHours(preferences: NotificationPreferences): Promise<boolean> {
  if (!preferences.quiet_hours_enabled) {
    return false
  }

  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`

  const { quiet_hours_start, quiet_hours_end } = preferences

  // Handle quiet hours that span midnight
  if (quiet_hours_start > quiet_hours_end) {
    return currentTime >= quiet_hours_start || currentTime < quiet_hours_end
  }

  return currentTime >= quiet_hours_start && currentTime < quiet_hours_end
}

/**
 * Check if a specific notification type is enabled for a user
 */
export async function isNotificationEnabled(
  userId: string,
  notificationType: keyof NotificationPreferences
): Promise<boolean> {
  const result = await getNotificationPreferences(userId)

  if ('error' in result) {
    // Default to enabled if there's an error
    return true
  }

  const { preferences } = result

  // Check if within quiet hours
  if (isWithinQuietHours(preferences)) {
    return false
  }

  // Check if email notifications are enabled
  if (!preferences.email_enabled) {
    return false
  }

  // Check specific notification type
  return preferences[notificationType] as boolean
}

/**
 * Get all users who should receive a specific notification type
 */
export async function getUsersForNotificationType(
  tenantId: string,
  notificationType: keyof NotificationPreferences
) {
  const supabase = await createClient()

  // Get all users in the tenant
  const { data: members, error } = await supabase
    .from('tenant_members')
    .select(
      `
      user_id,
      profiles:user_id (
        id,
        email,
        first_name,
        last_name,
        metadata
      )
    `
    )
    .eq('tenant_id', tenantId)

  if (error) {
    console.error('Error fetching tenant members:', error)
    return { error: error.message }
  }

  // Filter users based on notification preferences
  const eligibleUsers = []

  for (const member of members) {
    const profile = member.profiles as any
    if (!profile) continue

    const metadata = profile.metadata || {}
    const preferences =
      (metadata.notification_preferences as NotificationPreferences) ||
      DEFAULT_PREFERENCES

    // Check if user should receive this notification
    if (
      preferences.email_enabled &&
      preferences[notificationType] &&
      !isWithinQuietHours(preferences)
    ) {
      eligibleUsers.push({
        user_id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        preferences,
      })
    }
  }

  return { users: eligibleUsers }
}
