// @ts-nocheck
/**
 * Profile Service
 *
 * Business logic for user profile management
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import type { Profile, ProfileUpdate } from '@/types'
import { revalidatePath } from 'next/cache'

/**
 * Update the current user's profile
 */
export async function updateProfile(
  data: Partial<ProfileUpdate>
): Promise<{ profile: Profile } | { error: string }> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
      .select()
      .single()

    if (error || !profile) {
      return { error: error?.message || 'Failed to update profile' }
    }

    revalidatePath('/')
    return { profile }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get the current user's profile
 */
export async function getProfile(): Promise<
  { profile: Profile } | { error: string }
> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      return { error: error?.message || 'Profile not found' }
    }

    return { profile }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
