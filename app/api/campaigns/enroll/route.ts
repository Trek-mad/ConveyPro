import { NextRequest, NextResponse } from 'next/server'
import { getActiveTenantMembership } from '@/lib/auth'
import { enrollClientInCampaigns, findMatchingCampaigns } from '@/services/campaign-enrollment.service'

/**
 * POST /api/campaigns/enroll
 * Enroll a client in one or more campaigns
 */
export async function POST(request: NextRequest) {
  try {
    const membership = await getActiveTenantMembership()

    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clientId, campaignIds } = body

    if (!clientId || !campaignIds || !Array.isArray(campaignIds)) {
      return NextResponse.json(
        { error: 'clientId and campaignIds (array) are required' },
        { status: 400 }
      )
    }

    const result = await enrollClientInCampaigns(
      clientId,
      campaignIds,
      membership.tenant_id
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Enrollment failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      enrolled_count: result.enrolled_count,
      queued_emails: result.queued_emails,
    })
  } catch (error: any) {
    console.error('Error in POST /api/campaigns/enroll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/campaigns/enroll?clientId=xxx
 * Get matching campaigns for a client
 */
export async function GET(request: NextRequest) {
  try {
    const membership = await getActiveTenantMembership()

    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      )
    }

    const result = await findMatchingCampaigns(clientId, membership.tenant_id)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ campaigns: result.campaigns })
  } catch (error: any) {
    console.error('Error in GET /api/campaigns/enroll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
