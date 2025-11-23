import { NextRequest, NextResponse } from 'next/server'
import { getActiveTenantMembership } from '@/lib/auth'
import {
  getCampaigns,
  createCampaign,
} from '@/services/campaign.service'

/**
 * GET /api/campaigns
 * Get all campaigns for the current tenant
 */
export async function GET() {
  try {
    const membership = await getActiveTenantMembership()

    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getCampaigns(membership.tenant_id)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ campaigns: result.campaigns })
  } catch (error: any) {
    console.error('Error in GET /api/campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/campaigns
 * Create a new campaign
 */
export async function POST(request: NextRequest) {
  try {
    const membership = await getActiveTenantMembership()

    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can create campaigns
    if (!['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.campaign_type) {
      return NextResponse.json(
        { error: 'Name and campaign type are required' },
        { status: 400 }
      )
    }

    const result = await createCampaign({
      tenant_id: membership.tenant_id,
      name: body.name,
      description: body.description,
      campaign_type: body.campaign_type,
      status: body.status || 'draft',
      target_life_stages: body.target_life_stages,
      target_client_types: body.target_client_types,
      target_services_used: body.target_services_used,
      send_delay_days: body.send_delay_days || 0,
      max_emails_per_campaign: body.max_emails_per_campaign || 5,
      created_by: membership.user_id,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ campaign: result.campaign }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
