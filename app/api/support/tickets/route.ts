import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getSupportTickets,
  createSupportTicket,
} from '@/lib/services/support.service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

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

    const { tickets, error } = await getSupportTickets(
      membership.tenant_id,
      status || undefined
    )

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Error in GET /api/support/tickets:', error)
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

    // Get tenant ID and user profile
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('tenant_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
    }

    const { ticket, error } = await createSupportTicket(
      membership.tenant_id,
      user.id,
      user.email || '',
      user.email || '',
      body
    )

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/support/tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
