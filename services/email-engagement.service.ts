import { createClient } from '@/lib/supabase/server'

export interface CampaignEngagementMetrics {
  total_sent: number
  total_opens: number
  total_clicks: number
  total_conversions: number
  total_bounces: number
  total_unsubscribes: number
  spam_reports: number

  open_rate: number
  click_rate: number
  conversion_rate: number
  bounce_rate: number
  unsubscribe_rate: number
  spam_report_rate: number

  best_send_time?: string
}

export async function getCampaignEngagementMetrics(
  campaignId: string,
  tenantId: string
): Promise<CampaignEngagementMetrics> {
  const supabase = await createClient()

  // Get email history for campaign
  const { data: emails } = await supabase
    .from('email_history')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('tenant_id', tenantId)

  if (!emails || emails.length === 0) {
    return {
      total_sent: 0,
      total_opens: 0,
      total_clicks: 0,
      total_conversions: 0,
      total_bounces: 0,
      total_unsubscribes: 0,
      spam_reports: 0,
      open_rate: 0,
      click_rate: 0,
      conversion_rate: 0,
      bounce_rate: 0,
      unsubscribe_rate: 0,
      spam_report_rate: 0,
    }
  }

  const totalSent = emails.length
  const totalOpens = emails.filter(e => e.opened_at).length
  const totalClicks = emails.filter(e => e.clicked_at).length
  const totalConversions = emails.filter(e => e.converted_at).length
  const totalBounces = emails.filter(e => e.bounced).length
  const totalUnsubscribes = emails.filter(e => e.unsubscribed).length
  const spamReports = 0 // TODO: Add spam_reported field

  return {
    total_sent: totalSent,
    total_opens: totalOpens,
    total_clicks: totalClicks,
    total_conversions: totalConversions,
    total_bounces: totalBounces,
    total_unsubscribes: totalUnsubscribes,
    spam_reports: spamReports,

    open_rate: totalSent > 0 ? (totalOpens / totalSent) * 100 : 0,
    click_rate: totalSent > 0 ? (totalClicks / totalSent) * 100 : 0,
    conversion_rate: totalSent > 0 ? (totalConversions / totalSent) * 100 : 0,
    bounce_rate: totalSent > 0 ? (totalBounces / totalSent) * 100 : 0,
    unsubscribe_rate: totalSent > 0 ? (totalUnsubscribes / totalSent) * 100 : 0,
    spam_report_rate: totalSent > 0 ? (spamReports / totalSent) * 100 : 0,

    best_send_time: '09:00', // TODO: Calculate from data
  }
}
