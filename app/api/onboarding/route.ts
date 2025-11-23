import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getTenantOnboarding,
  updateTenantOnboarding,
  completeOnboardingStep,
  updateChecklistItem,
  getOnboardingProgress,
} from '@/lib/services/onboarding.service'

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

    // Get tenant ID
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('tenant_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
    }

    if (action === 'progress') {
      const { progress, error } = await getOnboardingProgress(
        membership.tenant_id
      )

      if (error) {
        return NextResponse.json({ error }, { status: 500 })
      }

      return NextResponse.json({ progress })
    }

    const { onboarding, error } = await getTenantOnboarding(
      membership.tenant_id
    )

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ onboarding })
  } catch (error) {
    console.error('Error in GET /api/onboarding:', error)
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

    // Get tenant ID
    const { data: membership } = await supabase
      .from('tenant_memberships')
      .select('tenant_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
    }

    if (body.action === 'complete_step') {
      const { onboarding, error } = await completeOnboardingStep(
        membership.tenant_id,
        body.step_id
      )

      if (error) {
        return NextResponse.json({ error }, { status: 500 })
      }

      return NextResponse.json({ onboarding })
    }

    if (body.action === 'update_checklist') {
      const { onboarding, error } = await updateChecklistItem(
        membership.tenant_id,
        body.item_key,
        body.completed
      )

      if (error) {
        return NextResponse.json({ error }, { status: 500 })
      }

      return NextResponse.json({ onboarding })
    }

    const { onboarding, error } = await updateTenantOnboarding(
      membership.tenant_id,
      body
    )

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ onboarding })
  } catch (error) {
    console.error('Error in PATCH /api/onboarding:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
