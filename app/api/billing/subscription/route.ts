import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getTenantSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
} from '@/lib/services/billing.service'

export async function GET(request: Request) {
  try {
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

    const { subscription, error } = await getTenantSubscription(
      membership.tenant_id
    )

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Error in GET /api/billing/subscription:', error)
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

    const { subscription, error } = await createSubscription(
      membership.tenant_id,
      body
    )

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ subscription }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/billing/subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (body.action === 'cancel') {
      const { subscription, error } = await cancelSubscription(
        body.subscription_id
      )

      if (error) {
        return NextResponse.json({ error }, { status: 500 })
      }

      return NextResponse.json({ subscription })
    }

    const { subscription, error } = await updateSubscription(
      body.subscription_id,
      body
    )

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Error in PATCH /api/billing/subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
