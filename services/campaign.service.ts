/**
 * Campaign Service
 * Handles all campaign-related business logic for automated cross-selling
 */

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type Campaign = Database['public']['Tables']['campaigns']['Row']
type CampaignInsert = Database['public']['Tables']['campaigns']['Insert']
type CampaignUpdate = Database['public']['Tables']['campaigns']['Update']

type EmailTemplate = Database['public']['Tables']['email_templates']['Row']
type EmailTemplateInsert = Database['public']['Tables']['email_templates']['Insert']
type EmailTemplateUpdate = Database['public']['Tables']['email_templates']['Update']

type CampaignTrigger = Database['public']['Tables']['campaign_triggers']['Row']
type CampaignTriggerInsert = Database['public']['Tables']['campaign_triggers']['Insert']

type CampaignSubscriber = Database['public']['Tables']['campaign_subscribers']['Row']
type CampaignSubscriberInsert = Database['public']['Tables']['campaign_subscribers']['Insert']
type CampaignSubscriberUpdate = Database['public']['Tables']['campaign_subscribers']['Update']

// =====================================================
// CAMPAIGN CRUD OPERATIONS
// =====================================================

/**
 * Get all campaigns for a tenant
 */
export async function getCampaigns(tenantId: string): Promise<{
  campaigns?: Campaign[]
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching campaigns:', error)
    return { error: error.message }
  }

  return { campaigns: data }
}

/**
 * Get a single campaign by ID with related data
 */
export async function getCampaign(campaignId: string): Promise<{
  campaign?: Campaign & {
    templates?: EmailTemplate[]
    triggers?: CampaignTrigger[]
    subscriber_count?: number
  }
  error?: string
}> {
  const supabase = await createClient()

  // Get campaign
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single()

  if (campaignError) {
    console.error('Error fetching campaign:', campaignError)
    return { error: campaignError.message }
  }

  // Get related templates
  const { data: templates } = await supabase
    .from('email_templates')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('sequence_order', { ascending: true })

  // Get related triggers
  const { data: triggers } = await supabase
    .from('campaign_triggers')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('priority', { ascending: false })

  // Get subscriber count
  const { count: subscriber_count } = await supabase
    .from('campaign_subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .eq('status', 'active')

  return {
    campaign: {
      ...campaign,
      templates: templates || [],
      triggers: triggers || [],
      subscriber_count: subscriber_count || 0,
    },
  }
}

/**
 * Create a new campaign
 */
export async function createCampaign(
  data: CampaignInsert
): Promise<{
  campaign?: Campaign
  error?: string
}> {
  const supabase = await createClient()

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Error creating campaign:', error)
    return { error: error.message }
  }

  return { campaign }
}

/**
 * Update a campaign
 */
export async function updateCampaign(
  campaignId: string,
  data: CampaignUpdate
): Promise<{
  campaign?: Campaign
  error?: string
}> {
  const supabase = await createClient()

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .update(data)
    .eq('id', campaignId)
    .select()
    .single()

  if (error) {
    console.error('Error updating campaign:', error)
    return { error: error.message }
  }

  return { campaign }
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(campaignId: string): Promise<{
  success?: boolean
  error?: string
}> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', campaignId)

  if (error) {
    console.error('Error deleting campaign:', error)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Activate a campaign (set status to 'active' and set started_at)
 */
export async function activateCampaign(campaignId: string): Promise<{
  campaign?: Campaign
  error?: string
}> {
  return updateCampaign(campaignId, {
    status: 'active',
    started_at: new Date().toISOString(),
  })
}

/**
 * Pause a campaign
 */
export async function pauseCampaign(campaignId: string): Promise<{
  campaign?: Campaign
  error?: string
}> {
  return updateCampaign(campaignId, {
    status: 'paused',
  })
}

// =====================================================
// EMAIL TEMPLATE OPERATIONS
// =====================================================

/**
 * Get all templates for a campaign
 */
export async function getCampaignTemplates(
  campaignId: string
): Promise<{
  templates?: EmailTemplate[]
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('sequence_order', { ascending: true })

  if (error) {
    console.error('Error fetching templates:', error)
    return { error: error.message }
  }

  return { templates: data }
}

/**
 * Get a single template
 */
export async function getTemplate(templateId: string): Promise<{
  template?: EmailTemplate
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) {
    console.error('Error fetching template:', error)
    return { error: error.message }
  }

  return { template: data }
}

/**
 * Create a new email template
 */
export async function createTemplate(
  data: EmailTemplateInsert
): Promise<{
  template?: EmailTemplate
  error?: string
}> {
  const supabase = await createClient()

  const { data: template, error } = await supabase
    .from('email_templates')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Error creating template:', error)
    return { error: error.message }
  }

  return { template }
}

/**
 * Update an email template
 */
export async function updateTemplate(
  templateId: string,
  data: EmailTemplateUpdate
): Promise<{
  template?: EmailTemplate
  error?: string
}> {
  const supabase = await createClient()

  const { data: template, error } = await supabase
    .from('email_templates')
    .update(data)
    .eq('id', templateId)
    .select()
    .single()

  if (error) {
    console.error('Error updating template:', error)
    return { error: error.message }
  }

  return { template }
}

/**
 * Delete an email template
 */
export async function deleteTemplate(templateId: string): Promise<{
  success?: boolean
  error?: string
}> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', templateId)

  if (error) {
    console.error('Error deleting template:', error)
    return { error: error.message }
  }

  return { success: true }
}

// =====================================================
// CAMPAIGN TRIGGER OPERATIONS
// =====================================================

/**
 * Create a new trigger for a campaign
 */
export async function createCampaignTrigger(
  data: CampaignTriggerInsert
): Promise<{
  trigger?: CampaignTrigger
  error?: string
}> {
  const supabase = await createClient()

  const { data: trigger, error } = await supabase
    .from('campaign_triggers')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Error creating trigger:', error)
    return { error: error.message }
  }

  return { trigger }
}

/**
 * Get all triggers for a campaign
 */
export async function getCampaignTriggers(
  campaignId: string
): Promise<{
  triggers?: CampaignTrigger[]
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaign_triggers')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('priority', { ascending: false })

  if (error) {
    console.error('Error fetching triggers:', error)
    return { error: error.message }
  }

  return { triggers: data }
}

/**
 * Delete a trigger
 */
export async function deleteCampaignTrigger(triggerId: string): Promise<{
  success?: boolean
  error?: string
}> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('campaign_triggers')
    .delete()
    .eq('id', triggerId)

  if (error) {
    console.error('Error deleting trigger:', error)
    return { error: error.message }
  }

  return { success: true }
}

// =====================================================
// CAMPAIGN SUBSCRIBER OPERATIONS
// =====================================================

/**
 * Enroll a client in a campaign
 */
export async function enrollClient(
  data: CampaignSubscriberInsert
): Promise<{
  subscriber?: CampaignSubscriber
  error?: string
}> {
  const supabase = await createClient()

  const { data: subscriber, error } = await supabase
    .from('campaign_subscribers')
    .insert(data)
    .select()
    .single()

  if (error) {
    // Check if already enrolled
    if (error.code === '23505') {
      return { error: 'Client is already enrolled in this campaign' }
    }
    console.error('Error enrolling client:', error)
    return { error: error.message }
  }

  return { subscriber }
}

/**
 * Get all subscribers for a campaign
 */
export async function getCampaignSubscribers(
  campaignId: string,
  status?: 'active' | 'paused' | 'completed' | 'unsubscribed'
): Promise<{
  subscribers?: (CampaignSubscriber & {
    client?: {
      id: string
      full_name: string
      email: string
      life_stage: string
    }
  })[]
  error?: string
}> {
  const supabase = await createClient()

  let query = supabase
    .from('campaign_subscribers')
    .select(
      `
      *,
      client:clients(
        id,
        full_name,
        email,
        life_stage
      )
    `
    )
    .eq('campaign_id', campaignId)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('enrolled_at', { ascending: false })

  if (error) {
    console.error('Error fetching subscribers:', error)
    return { error: error.message }
  }

  return { subscribers: data as any }
}

/**
 * Update a subscriber's status
 */
export async function updateSubscriber(
  subscriberId: string,
  data: CampaignSubscriberUpdate
): Promise<{
  subscriber?: CampaignSubscriber
  error?: string
}> {
  const supabase = await createClient()

  const { data: subscriber, error } = await supabase
    .from('campaign_subscribers')
    .update(data)
    .eq('id', subscriberId)
    .select()
    .single()

  if (error) {
    console.error('Error updating subscriber:', error)
    return { error: error.message }
  }

  return { subscriber }
}

/**
 * Unsubscribe a client from a campaign
 */
export async function unsubscribeClient(subscriberId: string): Promise<{
  subscriber?: CampaignSubscriber
  error?: string
}> {
  return updateSubscriber(subscriberId, {
    status: 'unsubscribed',
    unsubscribed_at: new Date().toISOString(),
  })
}

// =====================================================
// CAMPAIGN ANALYTICS
// =====================================================

/**
 * Get campaign performance metrics
 */
export async function getCampaignMetrics(campaignId: string): Promise<{
  metrics?: {
    total_subscribers: number
    active_subscribers: number
    emails_sent: number
    open_rate: number
    click_rate: number
    conversion_rate: number
    revenue_generated: number
  }
  error?: string
}> {
  const supabase = await createClient()

  // Get campaign data
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single()

  if (campaignError) {
    return { error: campaignError.message }
  }

  // Get subscriber counts
  const { count: total_subscribers } = await supabase
    .from('campaign_subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)

  const { count: active_subscribers } = await supabase
    .from('campaign_subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .eq('status', 'active')

  // Calculate rates
  const open_rate =
    campaign.total_sent > 0
      ? (campaign.total_opened / campaign.total_sent) * 100
      : 0
  const click_rate =
    campaign.total_sent > 0
      ? (campaign.total_clicked / campaign.total_sent) * 100
      : 0
  const conversion_rate =
    campaign.total_sent > 0
      ? (campaign.total_converted / campaign.total_sent) * 100
      : 0

  return {
    metrics: {
      total_subscribers: total_subscribers || 0,
      active_subscribers: active_subscribers || 0,
      emails_sent: campaign.total_sent,
      open_rate: Math.round(open_rate * 100) / 100,
      click_rate: Math.round(click_rate * 100) / 100,
      conversion_rate: Math.round(conversion_rate * 100) / 100,
      revenue_generated: Number(campaign.estimated_revenue),
    },
  }
}

/**
 * Get daily analytics for a campaign
 */
export async function getCampaignAnalytics(
  campaignId: string,
  days: number = 30
): Promise<{
  analytics?: Database['public']['Tables']['campaign_analytics']['Row'][]
  error?: string
}> {
  const supabase = await createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('campaign_analytics')
    .select('*')
    .eq('campaign_id', campaignId)
    .gte('analytics_date', startDate.toISOString().split('T')[0])
    .order('analytics_date', { ascending: false })

  if (error) {
    console.error('Error fetching analytics:', error)
    return { error: error.message }
  }

  return { analytics: data }
}

// =====================================================
// VARIABLE REPLACEMENT UTILITIES
// =====================================================

/**
 * Replace variables in email content with actual values
 */
export function replaceEmailVariables(
  content: string,
  variables: {
    client_name?: string
    firm_name?: string
    service_name?: string
    quote_value?: string
    [key: string]: string | undefined
  }
): string {
  let result = content

  // Replace all {{variable}} patterns
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    result = result.replace(regex, value || '')
  })

  // Remove any unreplaced variables
  result = result.replace(/{{.*?}}/g, '')

  return result
}
