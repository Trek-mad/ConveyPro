import { NextRequest, NextResponse } from 'next/server'
import { getActiveTenantMembership } from '@/lib/auth'
import {
  getCampaignTemplates,
  createTemplate,
} from '@/services/campaign.service'

/**
 * GET /api/templates?campaign_id=xxx
 * Get all templates for a campaign
 */
export async function GET(request: NextRequest) {
  try {
    const membership = await getActiveTenantMembership()

    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaign_id')

    if (!campaignId) {
      return NextResponse.json(
        { error: 'campaign_id parameter required' },
        { status: 400 }
      )
    }

    const result = await getCampaignTemplates(campaignId)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ templates: result.templates })
  } catch (error: any) {
    console.error('Error in GET /api/templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/templates
 * Create a new email template
 */
export async function POST(request: NextRequest) {
  try {
    const membership = await getActiveTenantMembership()

    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can create templates
    if (!['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.subject_line || !body.body_html) {
      return NextResponse.json(
        { error: 'Name, subject, and body are required' },
        { status: 400 }
      )
    }

    const result = await createTemplate({
      tenant_id: membership.tenant_id,
      campaign_id: body.campaign_id,
      name: body.name,
      description: body.description,
      sequence_order: body.sequence_order || 1,
      subject_line: body.subject_line,
      preview_text: body.preview_text,
      body_html: body.body_html,
      body_text: body.body_text,
      from_name: body.from_name,
      from_email: body.from_email,
      reply_to: body.reply_to,
      send_delay_days: body.send_delay_days || 0,
      is_active: body.is_active ?? true,
      created_by: membership.user_id,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ template: result.template }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
