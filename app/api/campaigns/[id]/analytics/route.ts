import { NextRequest, NextResponse } from 'next/server'
import { getActiveTenantMembership } from '@/lib/auth'
import {
  getCampaignMetrics,
  getCampaignAnalytics,
} from '@/services/campaign.service'

/**
 * GET /api/campaigns/[id]/analytics
 * Get campaign analytics and metrics
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
    const days = parseInt(searchParams.get('days') || '30')

    // Get overall metrics
    const metricsResult = await getCampaignMetrics(id)

    if (metricsResult.error) {
      return NextResponse.json({ error: metricsResult.error }, { status: 500 })
    }

    // Get daily analytics
    const analyticsResult = await getCampaignAnalytics(id, days)

    if (analyticsResult.error) {
      return NextResponse.json(
        { error: analyticsResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      metrics: metricsResult.metrics,
      daily_analytics: analyticsResult.analytics,
    })
  } catch (error: any) {
    console.error('Error in GET /api/campaigns/[id]/analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
