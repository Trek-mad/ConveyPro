/**
 * Email Automation Service
 * Handles email queuing, scheduling, sending, and tracking
 */

import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import sgMail from '@sendgrid/mail'
import { replaceEmailVariables } from './campaign.service'

type EmailQueue = Database['public']['Tables']['email_queue']['Row']
type EmailQueueInsert = Database['public']['Tables']['email_queue']['Insert']
type EmailHistory = Database['public']['Tables']['email_history']['Row']
type EmailHistoryInsert = Database['public']['Tables']['email_history']['Insert']

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// =====================================================
// EMAIL QUEUE OPERATIONS
// =====================================================

/**
 * Add an email to the queue
 */
export async function queueEmail(
  data: EmailQueueInsert
): Promise<{
  email?: EmailQueue
  error?: string
}> {
  const supabase = createServiceRoleClient() // Use service role to bypass RLS

  const { data: email, error } = await supabase
    .from('email_queue')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Error queuing email:', error)
    return { error: error.message }
  }

  return { email }
}

/**
 * Schedule a campaign email for a subscriber
 */
export async function scheduleCampaignEmail(params: {
  tenantId: string
  campaignId: string
  templateId: string
  clientId: string
  scheduledFor: Date
  personalizationData?: Record<string, any>
}): Promise<{
  email?: EmailQueue
  error?: string
}> {
  const supabase = await createClient()

  // Get template
  const { data: template, error: templateError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', params.templateId)
    .single()

  if (templateError || !template) {
    return { error: 'Template not found' }
  }

  // Get client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('first_name, last_name, email')
    .eq('id', params.clientId)
    .single()

  if (clientError || !client || !client.email) {
    return { error: 'Client not found or missing email' }
  }

  const clientName = `${client.first_name} ${client.last_name}`

  // Get tenant for firm name
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name')
    .eq('id', params.tenantId)
    .single()

  // Prepare personalization variables
  const variables = {
    client_name: clientName,
    firm_name: tenant?.name || 'ConveyPro',
    ...params.personalizationData,
  }

  // Replace variables in subject and body
  const subject = replaceEmailVariables(template.subject_line, variables)
  const bodyHtml = replaceEmailVariables(template.body_html, variables)
  const bodyText = template.body_text
    ? replaceEmailVariables(template.body_text, variables)
    : undefined

  // Queue the email
  return queueEmail({
    tenant_id: params.tenantId,
    campaign_id: params.campaignId,
    template_id: params.templateId,
    client_id: params.clientId,
    to_email: client.email,
    to_name: clientName,
    subject,
    body_html: bodyHtml,
    body_text: bodyText,
    personalization_data: variables,
    scheduled_for: params.scheduledFor.toISOString(),
    status: 'pending',
  })
}

/**
 * Get pending emails ready to be sent
 */
export async function getPendingEmails(limit: number = 100): Promise<{
  emails?: EmailQueue[]
  error?: string
}> {
  const supabase = createServiceRoleClient()

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('email_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', now)
    .limit(limit)
    .order('scheduled_for', { ascending: true })

  if (error) {
    console.error('Error fetching pending emails:', error)
    return { error: error.message }
  }

  return { emails: data }
}

/**
 * Send a queued email via SendGrid
 */
export async function sendQueuedEmail(emailId: string): Promise<{
  success?: boolean
  error?: string
}> {
  const supabase = createServiceRoleClient()

  // Get email from queue
  const { data: email, error: fetchError } = await supabase
    .from('email_queue')
    .select('*')
    .eq('id', emailId)
    .single()

  if (fetchError || !email) {
    return { error: 'Email not found in queue' }
  }

  // Update status to sending
  await supabase
    .from('email_queue')
    .update({ status: 'sending' })
    .eq('id', emailId)

  try {
    // Prepare SendGrid message
    const msg = {
      to: {
        email: email.to_email,
        name: email.to_name || undefined,
      },
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@conveypro.com',
      subject: email.subject,
      html: email.body_html,
      text: email.body_text || undefined,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
    }

    // Send email
    const [response] = await sgMail.send(msg)

    // Get message ID from response
    const messageId = response.headers['x-message-id'] as string

    // Mark as sent in queue
    await supabase
      .from('email_queue')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sendgrid_message_id: messageId,
      })
      .eq('id', emailId)

    // Add to history
    await addToHistory({
      tenant_id: email.tenant_id,
      campaign_id: email.campaign_id,
      template_id: email.template_id,
      client_id: email.client_id,
      queue_id: emailId,
      to_email: email.to_email,
      to_name: email.to_name,
      subject: email.subject,
      sent_at: new Date().toISOString(),
      sendgrid_message_id: messageId,
    })

    // Update campaign metrics
    if (email.campaign_id) {
      await incrementCampaignMetric(email.campaign_id, 'total_sent')
    }

    // Update subscriber metrics
    if (email.campaign_id && email.client_id) {
      await incrementSubscriberMetric(
        email.campaign_id,
        email.client_id,
        'emails_sent'
      )
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error sending email:', error)

    // Update queue with error
    await supabase
      .from('email_queue')
      .update({
        status: 'failed',
        error_message: error.message || 'Unknown error',
        retry_count: email.retry_count + 1,
      })
      .eq('id', emailId)

    // Retry if under max retries
    if (email.retry_count + 1 < email.max_retries) {
      // Schedule retry for later (exponential backoff)
      const retryDelay = Math.pow(2, email.retry_count) * 60 * 1000 // 1min, 2min, 4min...
      const retryTime = new Date(Date.now() + retryDelay)

      await supabase
        .from('email_queue')
        .update({
          status: 'pending',
          scheduled_for: retryTime.toISOString(),
        })
        .eq('id', emailId)
    }

    return { error: error.message || 'Failed to send email' }
  }
}

/**
 * Process email queue (call this from a cron job or background worker)
 */
export async function processEmailQueue(): Promise<{
  processed: number
  errors: number
}> {
  const { emails } = await getPendingEmails(50) // Process 50 at a time

  if (!emails || emails.length === 0) {
    return { processed: 0, errors: 0 }
  }

  let processed = 0
  let errors = 0

  // Process emails sequentially to avoid rate limits
  for (const email of emails) {
    const result = await sendQueuedEmail(email.id)
    if (result.success) {
      processed++
    } else {
      errors++
    }

    // Small delay between sends to respect rate limits
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return { processed, errors }
}

// =====================================================
// EMAIL HISTORY OPERATIONS
// =====================================================

/**
 * Add an email to history
 */
export async function addToHistory(
  data: EmailHistoryInsert
): Promise<{
  history?: EmailHistory
  error?: string
}> {
  const supabase = createServiceRoleClient()

  const { data: history, error } = await supabase
    .from('email_history')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Error adding to history:', error)
    return { error: error.message }
  }

  return { history }
}

/**
 * Track email open
 */
export async function trackEmailOpen(params: {
  messageId?: string
  queueId?: string
}): Promise<{
  success?: boolean
  error?: string
}> {
  const supabase = createServiceRoleClient()

  let query = supabase.from('email_history').select('*')

  if (params.messageId) {
    query = query.eq('sendgrid_message_id', params.messageId)
  } else if (params.queueId) {
    query = query.eq('queue_id', params.queueId)
  } else {
    return { error: 'Must provide messageId or queueId' }
  }

  const { data: history, error: fetchError } = await query.single()

  if (fetchError || !history) {
    return { error: 'Email not found in history' }
  }

  const now = new Date().toISOString()
  const updates: any = {
    open_count: history.open_count + 1,
    last_opened_at: now,
  }

  // Set opened_at on first open
  if (!history.opened_at) {
    updates.opened_at = now

    // Update campaign metrics
    if (history.campaign_id) {
      await incrementCampaignMetric(history.campaign_id, 'total_opened')
    }

    // Update subscriber metrics
    if (history.campaign_id && history.client_id) {
      await incrementSubscriberMetric(
        history.campaign_id,
        history.client_id,
        'emails_opened'
      )
    }
  }

  const { error } = await supabase
    .from('email_history')
    .update(updates)
    .eq('id', history.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Track email click
 */
export async function trackEmailClick(params: {
  messageId?: string
  queueId?: string
}): Promise<{
  success?: boolean
  error?: string
}> {
  const supabase = createServiceRoleClient()

  let query = supabase.from('email_history').select('*')

  if (params.messageId) {
    query = query.eq('sendgrid_message_id', params.messageId)
  } else if (params.queueId) {
    query = query.eq('queue_id', params.queueId)
  } else {
    return { error: 'Must provide messageId or queueId' }
  }

  const { data: history, error: fetchError } = await query.single()

  if (fetchError || !history) {
    return { error: 'Email not found in history' }
  }

  const now = new Date().toISOString()
  const updates: any = {
    click_count: history.click_count + 1,
    last_clicked_at: now,
  }

  // Set clicked_at on first click
  if (!history.clicked_at) {
    updates.clicked_at = now

    // Update campaign metrics
    if (history.campaign_id) {
      await incrementCampaignMetric(history.campaign_id, 'total_clicked')
    }

    // Update subscriber metrics
    if (history.campaign_id && history.client_id) {
      await incrementSubscriberMetric(
        history.campaign_id,
        history.client_id,
        'emails_clicked'
      )
    }
  }

  const { error } = await supabase
    .from('email_history')
    .update(updates)
    .eq('id', history.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Track email conversion
 */
export async function trackEmailConversion(params: {
  messageId?: string
  queueId?: string
  conversionValue?: number
  conversionType?: string
}): Promise<{
  success?: boolean
  error?: string
}> {
  const supabase = createServiceRoleClient()

  let query = supabase.from('email_history').select('*')

  if (params.messageId) {
    query = query.eq('sendgrid_message_id', params.messageId)
  } else if (params.queueId) {
    query = query.eq('queue_id', params.queueId)
  } else {
    return { error: 'Must provide messageId or queueId' }
  }

  const { data: history, error: fetchError } = await query.single()

  if (fetchError || !history) {
    return { error: 'Email not found in history' }
  }

  const now = new Date().toISOString()

  const { error } = await supabase
    .from('email_history')
    .update({
      converted_at: now,
      conversion_value: params.conversionValue,
      conversion_type: params.conversionType,
    })
    .eq('id', history.id)

  if (error) {
    return { error: error.message }
  }

  // Update campaign metrics
  if (history.campaign_id) {
    await incrementCampaignMetric(history.campaign_id, 'total_converted')
    if (params.conversionValue) {
      await incrementCampaignRevenue(
        history.campaign_id,
        params.conversionValue
      )
    }
  }

  // Update subscriber conversion
  if (history.campaign_id && history.client_id) {
    await markSubscriberConverted(
      history.campaign_id,
      history.client_id,
      params.conversionValue
    )
  }

  return { success: true }
}

// =====================================================
// METRIC UPDATE HELPERS
// =====================================================

/**
 * Increment a campaign metric
 */
async function incrementCampaignMetric(
  campaignId: string,
  metric: 'total_sent' | 'total_opened' | 'total_clicked' | 'total_converted'
): Promise<void> {
  const supabase = createServiceRoleClient()

  // Get current values
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('total_sent, total_opened, total_clicked, total_converted')
    .eq('id', campaignId)
    .single()

  if (campaign) {
    const currentValue = campaign[metric] || 0
    await supabase
      .from('campaigns')
      .update({ [metric]: currentValue + 1 })
      .eq('id', campaignId)
  }
}

/**
 * Increment campaign revenue
 */
async function incrementCampaignRevenue(
  campaignId: string,
  amount: number
): Promise<void> {
  const supabase = createServiceRoleClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('estimated_revenue')
    .eq('id', campaignId)
    .single()

  if (campaign) {
    await supabase
      .from('campaigns')
      .update({
        estimated_revenue: Number(campaign.estimated_revenue) + amount,
      })
      .eq('id', campaignId)
  }
}

/**
 * Increment a subscriber metric
 */
async function incrementSubscriberMetric(
  campaignId: string,
  clientId: string,
  metric: 'emails_sent' | 'emails_opened' | 'emails_clicked'
): Promise<void> {
  const supabase = createServiceRoleClient()

  const { data: subscriber } = await supabase
    .from('campaign_subscribers')
    .select('emails_sent, emails_opened, emails_clicked')
    .eq('campaign_id', campaignId)
    .eq('client_id', clientId)
    .single()

  if (subscriber) {
    const currentValue = subscriber[metric] || 0
    await supabase
      .from('campaign_subscribers')
      .update({ [metric]: currentValue + 1 })
      .eq('campaign_id', campaignId)
      .eq('client_id', clientId)
  }
}

/**
 * Mark subscriber as converted
 */
async function markSubscriberConverted(
  campaignId: string,
  clientId: string,
  conversionValue?: number
): Promise<void> {
  const supabase = createServiceRoleClient()

  await supabase
    .from('campaign_subscribers')
    .update({
      converted: true,
      conversion_value: conversionValue,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('campaign_id', campaignId)
    .eq('client_id', clientId)
}

// =====================================================
// BATCH OPERATIONS
// =====================================================

/**
 * Enroll multiple clients in a campaign based on targeting criteria
 */
export async function enrollMatchingClients(params: {
  campaignId: string
  tenantId: string
  targetLifeStages?: string[]
  targetClientTypes?: string[]
  targetServicesUsed?: string[]
}): Promise<{
  enrolled: number
  skipped: number
  error?: string
}> {
  const supabase = await createClient()

  // Build query for matching clients
  let query = supabase
    .from('clients')
    .select('id, first_name, last_name, email, life_stage, client_type, services_used')
    .eq('tenant_id', params.tenantId)
    .not('email', 'is', null)

  // Apply filters
  if (params.targetLifeStages && params.targetLifeStages.length > 0) {
    query = query.in('life_stage', params.targetLifeStages)
  }

  if (params.targetClientTypes && params.targetClientTypes.length > 0) {
    query = query.in('client_type', params.targetClientTypes as any)
  }

  const { data: clients, error: clientError } = await query

  if (clientError) {
    return { enrolled: 0, skipped: 0, error: clientError.message }
  }

  if (!clients || clients.length === 0) {
    return { enrolled: 0, skipped: 0 }
  }

  let enrolled = 0
  let skipped = 0

  // Enroll each client
  for (const client of clients) {
    const serviceRoleClient = createServiceRoleClient()

    const { error: enrollError } = await serviceRoleClient
      .from('campaign_subscribers')
      .insert({
        tenant_id: params.tenantId,
        campaign_id: params.campaignId,
        client_id: client.id,
        status: 'active',
        enrollment_source: 'automatic',
      })

    if (enrollError) {
      // Skip if already enrolled
      if (enrollError.code === '23505') {
        skipped++
      } else {
        console.error('Error enrolling client:', enrollError)
        skipped++
      }
    } else {
      enrolled++
    }
  }

  return { enrolled, skipped }
}
