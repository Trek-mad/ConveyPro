/**
 * Client-side Authentication Hooks
 *
 * React hooks for authentication state management
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, TenantMembership } from '@/types'

/**
 * Hook to get the current authenticated user
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}

/**
 * Hook to get the current user's profile
 */
export function useProfile() {
  const { user, loading: userLoading } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userLoading) return

    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const supabase = createClient()

    // Fetch profile
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data)
        setLoading(false)
      })

    // Subscribe to profile changes
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setProfile(payload.new as Profile)
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user, userLoading])

  return { profile, loading: userLoading || loading }
}

/**
 * Hook to get the current user's tenant memberships
 */
export function useMemberships() {
  const { user, loading: userLoading } = useUser()
  const [memberships, setMemberships] = useState<TenantMembership[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userLoading) return

    if (!user) {
      setMemberships([])
      setLoading(false)
      return
    }

    const supabase = createClient()

    // Fetch memberships
    supabase
      .from('tenant_memberships')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .then(({ data }) => {
        setMemberships(data || [])
        setLoading(false)
      })

    // Subscribe to membership changes
    const channel = supabase
      .channel('membership-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_memberships',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch memberships on any change
          supabase
            .from('tenant_memberships')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .is('deleted_at', null)
            .then(({ data }) => {
              setMemberships(data || [])
            })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user, userLoading])

  return { memberships, loading: userLoading || loading }
}

/**
 * Hook to get the active tenant membership
 * Returns the first active membership (Phase 2 assumes single tenant per user)
 */
export function useActiveTenant() {
  const { memberships, loading } = useMemberships()

  return {
    membership: memberships[0] || null,
    tenantId: memberships[0]?.tenant_id || null,
    loading,
  }
}

/**
 * Hook to check if user has specific role(s) in a tenant
 */
export function useHasRole(
  tenantId: string | null,
  roles: Array<'owner' | 'admin' | 'manager' | 'member' | 'viewer'>
) {
  const { memberships, loading } = useMemberships()

  if (!tenantId || loading) {
    return { hasRole: false, loading }
  }

  const membership = memberships.find((m) => m.tenant_id === tenantId)
  const hasRole = membership ? roles.includes(membership.role) : false

  return { hasRole, role: membership?.role, loading: false }
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { user, loading } = useUser()
  return { isAuthenticated: !!user, loading }
}
