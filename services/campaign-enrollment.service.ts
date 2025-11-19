/**
 * Campaign Enrollment Service
 *
 * Handles enrolling clients in campaigns, matching logic, and queue management
 */

import { createClient } from '@/lib/supabase/server'

export interface MatchingCampaign {
  id: string
  name: string
  description: string | null
  campaign_type: string
  template_count: number
  estimated_duration_days: number
}

export interface EnrollmentResult {
  success: boolean
  enrolled_count: number
  queued_emails: number
  error?: string
}

/**
 * Find campaigns that match a client's profile
 */
export async function findMatchingCampaigns(
  clientId: string,
  tenantId: string
): Promise<{ campaigns: MatchingCampaign[]; error?: string }> {
  try {
    const supabase = await createClient()

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('life_stage')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return { campaigns: [], error: 'Client not found' }
    }

    // Get active campaigns for this tenant
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select(`
        id,
        name,
        description,
        campaign_type,
        target_life_stages,
        status
      `)
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (campaignsError) {
      return { campaigns: [], error: 'Failed to fetch campaigns' }
    }

    if (!campaigns || campaigns.length === 0) {
      return { campaigns: [] }
    }

    // Filter campaigns that match client's life stage
    const matchingCampaigns = campaigns.filter((campaign) => {
      const targetStages = campaign.target_life_stages as string[] | null

      // If no target stages specified, campaign matches all clients
      if (!targetStages || targetStages.length === 0) {
        return true
      }

      // Check if client's life stage matches any target stage
      if (client.life_stage && targetStages.includes(client.life_stage)) {
        return true
      }

      return false
    })

    // Get template counts for each campaign
    const campaignIds = matchingCampaigns.map((c) => c.id)

    if (campaignIds.length === 0) {
      return { campaigns: [] }
    }

    const { data: templates } = await supabase
      .from('email_templates')
      .select('campaign_id, sequence_order, send_delay_days')
      .in('campaign_id', campaignIds)
      .eq('is_active', true)

    // Build response with template counts
    const result: MatchingCampaign[] = matchingCampaigns.map((campaign) => {
      const campaignTemplates = templates?.filter(
        (t) => t.campaign_id === campaign.id
      ) || []

      const maxDelay = campaignTemplates.reduce(
        (max, t) => Math.max(max, t.send_delay_days || 0),
        0
      )

      return {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        campaign_type: campaign.campaign_type,
        template_count: campaignTemplates.length,
        estimated_duration_days: maxDelay,
      }
    })

    return { campaigns: result }
  } catch (error: any) {
    console.error('Error finding matching campaigns:', error)
    return { campaigns: [], error: 'Internal server error' }
  }
}

/**
 * Enroll a client in one or more campaigns
 */
export async function enrollClientInCampaigns(
  clientId: string,
  campaignIds: string[],
  tenantId: string
): Promise<EnrollmentResult> {
  try {
    const supabase = await createClient()

    let totalEnrolled = 0
    let totalQueued = 0

    for (const campaignId of campaignIds) {
      // Check if already enrolled
      const { data: existing } = await supabase
        .from('campaign_subscribers')
        .select('id, status')
        .eq('campaign_id', campaignId)
        .eq('client_id', clientId)
        .single()

      if (existing) {
        // If unsubscribed, reactivate
        if (existing.status === 'unsubscribed') {
          await supabase
            .from('campaign_subscribers')
            .update({ status: 'active', enrolled_at: new Date().toISOString() })
            .eq('id', existing.id)

          totalEnrolled++
        }
        // If already active, skip
        continue
      }

      // Create enrollment record
      const { data: subscription, error: subError } = await supabase
        .from('campaign_subscribers')
        .insert({
          campaign_id: campaignId,
          client_id: clientId,
          status: 'active',
          enrolled_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (subError || !subscription) {
        console.error('Error creating subscription:', subError)
        continue
      }

      totalEnrolled++

      // Get client and firm details for personalization
      const { data: client } = await supabase
        .from('clients')
        .select('full_name, email')
        .eq('id', clientId)
        .single()

      const { data: tenant } = await supabase
        .from('tenants')
        .select('firm_name')
        .eq('id', tenantId)
        .single()

      // Get campaign templates
      const { data: templates } = await supabase
        .from('email_templates')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('is_active', true)
        .order('sequence_order', { ascending: true })

      if (!templates || templates.length === 0) {
        continue
      }

      // Queue emails for each template
      const now = new Date()

      for (const template of templates) {
        const scheduledDate = new Date(now)
        scheduledDate.setDate(scheduledDate.getDate() + (template.send_delay_days || 0))

        // Simple variable replacement (basic implementation)
        const personalizedSubject = template.subject_line
          .replace(/\{\{client_name\}\}/g, client?.full_name || '')
          .replace(/\{\{firm_name\}\}/g, tenant?.firm_name || '')

        const personalizedBody = template.body_html
          .replace(/\{\{client_name\}\}/g, client?.full_name || '')
          .replace(/\{\{firm_name\}\}/g, tenant?.firm_name || '')

        const { error: queueError } = await supabase
          .from('email_queue')
          .insert({
            campaign_id: campaignId,
            template_id: template.id,
            subscriber_id: subscription.id,
            client_id: clientId,
            status: 'pending',
            scheduled_for: scheduledDate.toISOString(),
            personalized_subject: personalizedSubject,
            personalized_body_html: personalizedBody,
            personalized_body_text: template.body_text || '',
          })

        if (!queueError) {
          totalQueued++
        }
      }
    }

    return {
      success: true,
      enrolled_count: totalEnrolled,
      queued_emails: totalQueued,
    }
  } catch (error: any) {
    console.error('Error enrolling client in campaigns:', error)
    return {
      success: false,
      enrolled_count: 0,
      queued_emails: 0,
      error: 'Failed to enroll client',
    }
  }
}

/**
 * Unenroll a client from a campaign
 */
export async function unenrollClient(
  subscriberId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Update subscription status
    const { error } = await supabase
      .from('campaign_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('id', subscriberId)

    if (error) {
      return { success: false, error: 'Failed to unenroll client' }
    }

    // Cancel pending emails
    await supabase
      .from('email_queue')
      .update({ status: 'cancelled' })
      .eq('subscriber_id', subscriberId)
      .eq('status', 'pending')

    return { success: true }
  } catch (error: any) {
    console.error('Error unenrolling client:', error)
    return { success: false, error: 'Internal server error' }
  }
}
