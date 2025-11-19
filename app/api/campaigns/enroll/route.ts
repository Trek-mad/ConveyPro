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

    // Handle both single clientId (string) and multiple clientIds (array)
    const clientIds = Array.isArray(clientId) ? clientId : [clientId]

    if (!clientIds.length || !campaignIds || !Array.isArray(campaignIds)) {
      return NextResponse.json(
        { error: 'clientId(s) and campaignIds (array) are required' },
        { status: 400 }
      )
    }

    // Enroll each client in the specified campaigns
    let totalEnrolled = 0
    let totalQueued = 0
    const errors: string[] = []

    for (const singleClientId of clientIds) {
      const result = await enrollClientInCampaigns(
        singleClientId,
        campaignIds,
        membership.tenant_id
      )

      if (result.success) {
        totalEnrolled += result.enrolled_count
        totalQueued += result.queued_emails
      } else {
        errors.push(result.error || 'Unknown error')
      }
    }

    return NextResponse.json({
      success: totalEnrolled > 0,
      enrolled_count: totalEnrolled,
      queued_emails: totalQueued,
      errors: errors.length > 0 ? errors : undefined,
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
