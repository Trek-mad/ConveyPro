import { createClient } from '@/lib/supabase/server'

export interface RevenueAttributionMetrics {
  total_revenue: number
  revenue_by_campaign: {
    campaign_id: string
    campaign_name: string
    revenue: number
    conversions: number
    roi: number
  }[]
  revenue_by_source: {
    source: string
    revenue: number
    clients: number
  }[]
  revenue_by_service: {
    service: string
    revenue: number
    count: number
  }[]
  monthly_revenue: {
    month: string
    revenue: number
    growth: number
  }[]
}

export async function getRevenueAttribution(tenantId: string): Promise<RevenueAttributionMetrics> {
  const supabase = await createClient()

  // Get all accepted quotes for revenue
  const { data: quotes } = await supabase
    .from('quotes')
    .select('*, client:clients(source)')
    .eq('tenant_id', tenantId)
    .eq('status', 'accepted')

  if (!quotes || quotes.length === 0) {
    return {
      total_revenue: 0,
      revenue_by_campaign: [],
      revenue_by_source: [],
      revenue_by_service: [],
      monthly_revenue: [],
    }
  }

  const totalRevenue = quotes.reduce((sum, q) => sum + (q.total_amount || 0), 0)

  // Revenue by source
  const sourceMap = new Map<string, { revenue: number; clients: Set<string> }>()
  quotes.forEach(q => {
    const source = (q.client as any)?.source || 'unknown'
    if (!sourceMap.has(source)) {
      sourceMap.set(source, { revenue: 0, clients: new Set() })
    }
    const data = sourceMap.get(source)!
    data.revenue += q.total_amount || 0
    if (q.client_id) data.clients.add(q.client_id)
  })

  const revenueBySource = Array.from(sourceMap.entries()).map(([source, data]) => ({
    source,
    revenue: data.revenue,
    clients: data.clients.size,
  }))

  // Revenue by service (transaction type)
  const serviceMap = new Map<string, { revenue: number; count: number }>()
  quotes.forEach(q => {
    const service = q.transaction_type || 'unknown'
    if (!serviceMap.has(service)) {
      serviceMap.set(service, { revenue: 0, count: 0 })
    }
    const data = serviceMap.get(service)!
    data.revenue += q.total_amount || 0
    data.count += 1
  })

  const revenueByService = Array.from(serviceMap.entries()).map(([service, data]) => ({
    service,
    revenue: data.revenue,
    count: data.count,
  }))

  return {
    total_revenue: totalRevenue,
    revenue_by_campaign: [], // TODO: Add campaign tracking to quotes
    revenue_by_source: revenueBySource,
    revenue_by_service: revenueByService,
    monthly_revenue: [], // TODO: Calculate monthly breakdown
  }
}

export interface ClientJourneyEvent {
  id: string
  type: 'form_submission' | 'quote_sent' | 'quote_accepted' | 'email_sent' | 'email_opened' | 'email_clicked' | 'campaign_enrolled'
  timestamp: string
  description: string
  metadata?: any
}

export async function getClientJourney(clientId: string, tenantId: string): Promise<ClientJourneyEvent[]> {
  const supabase = await createClient()
  const events: ClientJourneyEvent[] = []

  // Get client created event
  const { data: client } = await supabase
    .from('clients')
    .select('created_at, source')
    .eq('id', clientId)
    .single()

  if (client) {
    events.push({
      id: 'client-created',
      type: 'form_submission',
      timestamp: client.created_at,
      description: `Client created from ${client.source}`,
    })
  }

  // Get quotes
  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, quote_number, status, created_at, accepted_at, total_amount')
    .eq('client_id', clientId)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true })

  quotes?.forEach(quote => {
    events.push({
      id: `quote-${quote.id}`,
      type: 'quote_sent',
      timestamp: quote.created_at,
      description: `Quote ${quote.quote_number} created (£${quote.total_amount?.toLocaleString()})`,
      metadata: quote,
    })

    if (quote.accepted_at) {
      events.push({
        id: `quote-accepted-${quote.id}`,
        type: 'quote_accepted',
        timestamp: quote.accepted_at,
        description: `Quote ${quote.quote_number} accepted`,
        metadata: quote,
      })
    }
  })

  // Get campaign enrollments
  const { data: subscriptions } = await supabase
    .from('campaign_subscribers')
    .select('id, enrolled_at, campaign:campaigns(name)')
    .eq('client_id', clientId)
    .eq('tenant_id', tenantId)
    .order('enrolled_at', { ascending: true })

  subscriptions?.forEach(sub => {
    events.push({
      id: `enrollment-${sub.id}`,
      type: 'campaign_enrolled',
      timestamp: sub.enrolled_at,
      description: `Enrolled in ${(sub.campaign as any)?.name || 'campaign'}`,
      metadata: sub,
    })
  })

  // Get email history
  const { data: emails } = await supabase
    .from('email_history')
    .select('id, sent_at, opened_at, clicked_at, subject')
    .eq('client_id', clientId)
    .eq('tenant_id', tenantId)
    .order('sent_at', { ascending: true })

  emails?.forEach(email => {
    events.push({
      id: `email-sent-${email.id}`,
      type: 'email_sent',
      timestamp: email.sent_at,
      description: `Email sent: ${email.subject}`,
      metadata: email,
    })

    if (email.opened_at) {
      events.push({
        id: `email-opened-${email.id}`,
        type: 'email_opened',
        timestamp: email.opened_at,
        description: `Opened: ${email.subject}`,
        metadata: email,
      })
    }

    if (email.clicked_at) {
      events.push({
        id: `email-clicked-${email.id}`,
        type: 'email_clicked',
        timestamp: email.clicked_at,
        description: `Clicked link in: ${email.subject}`,
        metadata: email,
      })
    }
  })

  // Sort by timestamp
  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

export interface ConversionFunnelData {
  stage: string
  count: number
  percentage: number
  dropoff: number
}

export async function getConversionFunnel(tenantId: string): Promise<ConversionFunnelData[]> {
  const supabase = await createClient()

  // Get counts for each stage
  const { count: totalClients } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)

  const { count: quotesCreated } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)

  const { count: quotesSent } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .in('status', ['sent', 'accepted'])

  const { count: quotesAccepted } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('status', 'accepted')

  const stages = [
    { stage: 'Clients Created', count: totalClients || 0 },
    { stage: 'Quotes Created', count: quotesCreated || 0 },
    { stage: 'Quotes Sent', count: quotesSent || 0 },
    { stage: 'Quotes Accepted', count: quotesAccepted || 0 },
  ]

  const total = totalClients || 1

  return stages.map((stage, index) => {
    const percentage = (stage.count / total) * 100
    const nextStage = stages[index + 1]
    const dropoff = nextStage ? stage.count - nextStage.count : 0

    return {
      stage: stage.stage,
      count: stage.count,
      percentage,
      dropoff,
    }
  })
}
