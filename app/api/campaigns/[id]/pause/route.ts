import { NextRequest, NextResponse } from 'next/server'
import { getActiveTenantMembership } from '@/lib/auth'
import { pauseCampaign } from '@/services/campaign.service'

/**
 * POST /api/campaigns/[id]/pause
 * Pause a campaign
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

    // Only admins can pause campaigns
    if (!['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const result = await pauseCampaign(id)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ campaign: result.campaign })
  } catch (error: any) {
    console.error('Error in POST /api/campaigns/[id]/pause:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
