import { NextRequest, NextResponse } from 'next/server'
import {
  trackEmailOpen,
  trackEmailClick,
  trackEmailConversion,
} from '@/services/email-automation.service'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * SendGrid Webhook Handler
 * Handles email events from SendGrid:
 * - open: Email opened
 * - click: Link clicked
 * - bounce: Email bounced
 * - dropped: Email dropped
 * - deferred: Email deferred
 * - delivered: Email delivered
 * - spam_report: Marked as spam
 * - unsubscribe: Unsubscribed
 */

interface SendGridEvent {
  email: string
  timestamp: number
  event: string
  sg_message_id: string
  sg_event_id: string
  url?: string // For click events
  reason?: string // For bounce/drop events
  status?: string // For bounce events
  type?: string // For bounce events
  [key: string]: any
}

export async function POST(request: NextRequest) {
  try {
    // Verify SendGrid webhook signature if configured
    const signature = request.headers.get('x-twilio-email-event-webhook-signature')
    const timestamp = request.headers.get('x-twilio-email-event-webhook-timestamp')

    // TODO: Implement signature verification for production
    // For now, we'll process all events

    const events: SendGridEvent[] = await request.json()

    console.log(`[SendGrid Webhook] Received ${events.length} events`)

    const results = {
      processed: 0,
      errors: 0,
      skipped: 0,
    }

    for (const event of events) {
      try {
        await processEvent(event)
        results.processed++
      } catch (error) {
        console.error('[SendGrid Webhook] Error processing event:', event, error)
        results.errors++
      }
    }

    console.log('[SendGrid Webhook] Results:', results)

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error: any) {
    console.error('[SendGrid Webhook] Fatal error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * Process a single SendGrid event
 */
async function processEvent(event: SendGridEvent): Promise<void> {
  const messageId = event.sg_message_id

  console.log(`[SendGrid Event] ${event.event} for ${event.email} (${messageId})`)

  switch (event.event) {
    case 'delivered':
      await handleDelivered(event)
      break

    case 'open':
      await handleOpen(event)
      break

    case 'click':
      await handleClick(event)
      break

    case 'bounce':
      await handleBounce(event)
      break

    case 'dropped':
      await handleDropped(event)
      break

    case 'deferred':
      await handleDeferred(event)
      break

    case 'spam_report':
      await handleSpamReport(event)
      break

    case 'unsubscribe':
      await handleUnsubscribe(event)
      break

    default:
      console.log(`[SendGrid Event] Unknown event type: ${event.event}`)
  }
}

/**
 * Handle email delivered event
 */
async function handleDelivered(event: SendGridEvent): Promise<void> {
  const supabase = createServiceRoleClient()

  // Update email history
  await supabase
    .from('email_history')
    .update({
      delivered_at: new Date(event.timestamp * 1000).toISOString(),
    })
    .eq('sendgrid_message_id', event.sg_message_id)
}

/**
 * Handle email open event
 */
async function handleOpen(event: SendGridEvent): Promise<void> {
  await trackEmailOpen({
    messageId: event.sg_message_id,
  })
}

/**
 * Handle link click event
 */
async function handleClick(event: SendGridEvent): Promise<void> {
  await trackEmailClick({
    messageId: event.sg_message_id,
  })

  // TODO: If URL contains conversion tracking parameter, mark as conversion
  if (event.url && event.url.includes('conversion=true')) {
    await trackEmailConversion({
      messageId: event.sg_message_id,
    })
  }
}

/**
 * Handle email bounce event
 */
async function handleBounce(event: SendGridEvent): Promise<void> {
  const supabase = createServiceRoleClient()

  // Update email history with bounce info
  await supabase
    .from('email_history')
    .update({
      bounced_at: new Date(event.timestamp * 1000).toISOString(),
      bounce_reason: event.reason,
      bounce_type: event.type,
    })
    .eq('sendgrid_message_id', event.sg_message_id)

  // If hard bounce, mark client as undeliverable
  if (event.type === 'hard') {
    // Get the email history record
    const { data: history } = await supabase
      .from('email_history')
      .select('client_id, campaign_id')
      .eq('sendgrid_message_id', event.sg_message_id)
      .single()

    if (history && history.campaign_id && history.client_id) {
      // Unsubscribe the client from the campaign
      await supabase
        .from('campaign_subscribers')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('campaign_id', history.campaign_id)
        .eq('client_id', history.client_id)
    }
  }
}

/**
 * Handle email dropped event
 */
async function handleDropped(event: SendGridEvent): Promise<void> {
  const supabase = createServiceRoleClient()

  // Update email queue status
  await supabase
    .from('email_queue')
    .update({
      status: 'failed',
      error_message: event.reason || 'Dropped by SendGrid',
    })
    .eq('sendgrid_message_id', event.sg_message_id)

  // Update email history
  await supabase
    .from('email_history')
    .update({
      bounced_at: new Date(event.timestamp * 1000).toISOString(),
      bounce_reason: event.reason,
      bounce_type: 'dropped',
    })
    .eq('sendgrid_message_id', event.sg_message_id)
}

/**
 * Handle email deferred event
 */
async function handleDeferred(event: SendGridEvent): Promise<void> {
  const supabase = createServiceRoleClient()

  // Log deferred event (email will be retried by SendGrid)
  await supabase
    .from('email_history')
    .update({
      // Just log it, no status change needed
    })
    .eq('sendgrid_message_id', event.sg_message_id)

  console.log(`[SendGrid Event] Email deferred: ${event.reason}`)
}

/**
 * Handle spam report event
 */
async function handleSpamReport(event: SendGridEvent): Promise<void> {
  const supabase = createServiceRoleClient()

  // Update email history
  await supabase
    .from('email_history')
    .update({
      spam_reported_at: new Date(event.timestamp * 1000).toISOString(),
    })
    .eq('sendgrid_message_id', event.sg_message_id)

  // Get the email history record
  const { data: history } = await supabase
    .from('email_history')
    .select('client_id, campaign_id, to_email')
    .eq('sendgrid_message_id', event.sg_message_id)
    .single()

  if (history && history.campaign_id && history.client_id) {
    // Unsubscribe the client from the campaign
    await supabase
      .from('campaign_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('campaign_id', history.campaign_id)
      .eq('client_id', history.client_id)

    console.log(
      `[SendGrid Event] Client unsubscribed due to spam report: ${history.to_email}`
    )
  }
}

/**
 * Handle unsubscribe event
 */
async function handleUnsubscribe(event: SendGridEvent): Promise<void> {
  const supabase = createServiceRoleClient()

  // Update email history
  await supabase
    .from('email_history')
    .update({
      unsubscribed_at: new Date(event.timestamp * 1000).toISOString(),
    })
    .eq('sendgrid_message_id', event.sg_message_id)

  // Get the email history record
  const { data: history } = await supabase
    .from('email_history')
    .select('client_id, campaign_id, to_email')
    .eq('sendgrid_message_id', event.sg_message_id)
    .single()

  if (history && history.campaign_id && history.client_id) {
    // Unsubscribe the client from the campaign
    await supabase
      .from('campaign_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('campaign_id', history.campaign_id)
      .eq('client_id', history.client_id)

    console.log(`[SendGrid Event] Client unsubscribed: ${history.to_email}`)
  }
}
