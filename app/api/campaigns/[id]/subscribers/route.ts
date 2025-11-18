import { NextRequest, NextResponse } from 'next/server'
import { getActiveTenantMembership } from '@/lib/auth'
import {
  getCampaignSubscribers,
  enrollClient,
  unsubscribeClient,
} from '@/services/campaign.service'
import { enrollMatchingClients } from '@/services/email-automation.service'

/**
 * GET /api/campaigns/[id]/subscribers
 * Get all subscribers for a campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const membership = await getActiveTenantMembership()

    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as
      | 'active'
      | 'paused'
      | 'completed'
      | 'unsubscribed'
      | undefined

    const result = await getCampaignSubscribers(id, status)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ subscribers: result.subscribers })
  } catch (error: any) {
    console.error('Error in GET /api/campaigns/[id]/subscribers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/campaigns/[id]/subscribers
 * Enroll client(s) in a campaign
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const membership = await getActiveTenantMembership()

    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can enroll clients
    if (!['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { id: campaignId } = await params
    const body = await request.json()

    // Two modes: single client enrollment or batch enrollment by criteria
    if (body.client_id) {
      // Single client enrollment
      const result = await enrollClient({
        tenant_id: membership.tenant_id,
        campaign_id: campaignId,
        client_id: body.client_id,
        enrollment_source: 'manual',
      })

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      return NextResponse.json({ subscriber: result.subscriber }, { status: 201 })
    } else if (body.auto_enroll) {
      // Batch enrollment based on targeting criteria
      const result = await enrollMatchingClients({
        campaignId,
        tenantId: membership.tenant_id,
        targetLifeStages: body.target_life_stages,
        targetClientTypes: body.target_client_types,
        targetServicesUsed: body.target_services_used,
      })

      return NextResponse.json({
        enrolled: result.enrolled,
        skipped: result.skipped,
      })
    } else {
      return NextResponse.json(
        { error: 'Must provide client_id or auto_enroll flag' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error in POST /api/campaigns/[id]/subscribers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
