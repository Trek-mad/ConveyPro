import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getStaffProfiles,
  createStaffProfile,
  getTeamWorkloadStats,
} from '@/lib/services/team-collaboration.service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get tenant ID from user's membership
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('tenant_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
    }

    if (action === 'stats') {
      const { stats, error } = await getTeamWorkloadStats(membership.tenant_id)
      if (error) {
        return NextResponse.json({ error }, { status: 500 })
      }
      return NextResponse.json({ stats })
    }

    // Default: get all staff profiles
    const { profiles, error } = await getStaffProfiles(membership.tenant_id)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ profiles })
  } catch (error) {
    console.error('Error in GET /api/team/staff:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get tenant ID
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('tenant_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
    }

    const { profile, error } = await createStaffProfile(
      membership.tenant_id,
      body
    )

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/team/staff:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
