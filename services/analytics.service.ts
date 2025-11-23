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

// ============================================================================
// PHASE 12 - PURCHASE WORKFLOW ANALYTICS
// ============================================================================

export interface PurchaseMattersByStageReport {
  stage_key: string
  stage_name: string
  stage_order: number
  count: number
  percentage: number
  total_matters: number
}

export interface PurchaseAverageTimePerStageReport {
  stage_key: string
  stage_name: string
  stage_order: number
  average_days: number
  matter_count: number
  min_days: number
  max_days: number
}

export interface PurchaseConversionRateReport {
  metric: string
  count: number
  total: number
  percentage: number
}

export interface PurchaseFeeEarnerPerformanceReport {
  fee_earner_id: string
  fee_earner_name: string
  active_matters: number
  completed_matters: number
  total_value: number
  avg_completion_days: number
  task_completion_rate: number
  document_verification_rate: number
}

export interface PurchaseDocumentCompletionReport {
  document_type: string
  total_required: number
  uploaded: number
  verified: number
  missing: number
  completion_rate: number
}

export interface PurchaseTaskCompletionReport {
  task_type: string
  total_tasks: number
  completed: number
  pending: number
  overdue: number
  completion_rate: number
  avg_completion_days: number
}

export interface PurchaseExecutiveMetrics {
  total_matters: number
  active_matters: number
  completed_matters: number
  total_pipeline_value: number
  avg_matter_value: number
  conversion_rate: number
  avg_time_to_completion: number
  matters_by_stage: PurchaseMattersByStageReport[]
  monthly_trend: PurchaseMonthlyTrend[]
}

export interface PurchaseMonthlyTrend {
  month: string
  year: number
  matters_started: number
  matters_completed: number
  total_value: number
}

export interface PurchaseReportFilters {
  start_date?: string
  end_date?: string
  fee_earner_id?: string
  matter_type?: string
  status?: string
}

/**
 * Get matters by stage report for Purchase Workflow
 */
export async function getPurchaseMattersByStageReport(
  tenant_id: string,
  filters?: PurchaseReportFilters
): Promise<{ success: boolean; data?: PurchaseMattersByStageReport[]; error?: string }> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('matters')
      .select('current_stage, workflow_stages(stage_key, stage_name, stage_order)')
      .eq('tenant_id', tenant_id)
      .is('deleted_at', null)

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date)
    }
    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date)
    }
    if (filters?.matter_type) {
      query = query.eq('matter_type', filters.matter_type as any)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status as any)
    }

    const { data: matters, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    // Count matters by stage
    const stageCount = new Map<string, { stage: any; count: number }>()
    const totalMatters = matters?.length || 0

    matters?.forEach((matter: any) => {
      const stageKey = matter.current_stage
      if (!stageCount.has(stageKey)) {
        stageCount.set(stageKey, {
          stage: matter.workflow_stages,
          count: 0,
        })
      }
      stageCount.get(stageKey)!.count++
    })

    const report: PurchaseMattersByStageReport[] = Array.from(stageCount.entries()).map(
      ([stage_key, data]) => ({
        stage_key,
        stage_name: data.stage?.stage_name || stage_key,
        stage_order: data.stage?.stage_order || 0,
        count: data.count,
        percentage: totalMatters > 0 ? (data.count / totalMatters) * 100 : 0,
        total_matters: totalMatters,
      })
    )

    report.sort((a, b) => a.stage_order - b.stage_order)

    return { success: true, data: report }
  } catch (err) {
    console.error('Error in getPurchaseMattersByStageReport:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get conversion rate report for Purchase Workflow
 */
export async function getPurchaseConversionRateReport(
  tenant_id: string
): Promise<{ success: boolean; data?: PurchaseConversionRateReport[]; error?: string }> {
  try {
    const supabase = await createClient()

    const { count: quotesCount } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant_id)

    const { count: mattersCount } = await supabase
      .from('matters')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant_id)
      .is('deleted_at', null)

    const { count: completedCount } = await supabase
      .from('matters')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant_id)
      .eq('status', 'completed')
      .is('deleted_at', null)

    const report: PurchaseConversionRateReport[] = [
      {
        metric: 'Quote to Matter',
        count: mattersCount || 0,
        total: quotesCount || 0,
        percentage:
          quotesCount && quotesCount > 0 ? ((mattersCount || 0) / quotesCount) * 100 : 0,
      },
      {
        metric: 'Matter to Completion',
        count: completedCount || 0,
        total: mattersCount || 0,
        percentage:
          mattersCount && mattersCount > 0 ? ((completedCount || 0) / mattersCount) * 100 : 0,
      },
      {
        metric: 'Quote to Completion',
        count: completedCount || 0,
        total: quotesCount || 0,
        percentage:
          quotesCount && quotesCount > 0 ? ((completedCount || 0) / quotesCount) * 100 : 0,
      },
    ]

    return { success: true, data: report }
  } catch (err) {
    console.error('Error in getPurchaseConversionRateReport:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get fee earner performance report for Purchase Workflow
 */
export async function getPurchaseFeeEarnerPerformanceReport(
  tenant_id: string
): Promise<{ success: boolean; data?: PurchaseFeeEarnerPerformanceReport[]; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: feeEarners, error } = await supabase
      .from('profiles')
      .select(
        `
        id,
        first_name,
        last_name,
        matters!matters_assigned_fee_earner_id_fkey(
          id,
          status,
          purchase_price,
          created_at,
          actual_completion_date,
          matter_tasks(id, status, due_date, completed_at),
          documents(id, status)
        )
      `
      )
      .eq('tenant_id', tenant_id)

    if (error) {
      return { success: false, error: error.message }
    }

    const report: PurchaseFeeEarnerPerformanceReport[] =
      feeEarners?.map((feeEarner: any) => {
        const matters = feeEarner.matters || []
        const activeMatters = matters.filter((m: any) => m.status === 'active').length
        const completedMatters = matters.filter((m: any) => m.status === 'completed')

        const totalValue = matters.reduce(
          (sum: number, m: any) => sum + (Number(m.purchase_price) || 0),
          0
        )

        const completionDays = completedMatters
          .filter((m: any) => m.actual_completion_date)
          .map((m: any) => {
            const start = new Date(m.created_at)
            const end = new Date(m.actual_completion_date)
            return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
          })
        const avgCompletionDays =
          completionDays.length > 0
            ? completionDays.reduce((a: number, b: number) => a + b, 0) / completionDays.length
            : 0

        const allTasks = matters.flatMap((m: any) => m.matter_tasks || [])
        const completedTasks = allTasks.filter((t: any) => t.status === 'completed').length
        const taskCompletionRate =
          allTasks.length > 0 ? (completedTasks / allTasks.length) * 100 : 0

        const allDocs = matters.flatMap((m: any) => m.documents || [])
        const verifiedDocs = allDocs.filter((d: any) => d.status === 'verified').length
        const docVerificationRate =
          allDocs.length > 0 ? (verifiedDocs / allDocs.length) * 100 : 0

        return {
          fee_earner_id: feeEarner.id,
          fee_earner_name: `${feeEarner.first_name} ${feeEarner.last_name}`,
          active_matters: activeMatters,
          completed_matters: completedMatters.length,
          total_value: totalValue,
          avg_completion_days: Math.round(avgCompletionDays * 10) / 10,
          task_completion_rate: Math.round(taskCompletionRate * 10) / 10,
          document_verification_rate: Math.round(docVerificationRate * 10) / 10,
        }
      }) || []

    return { success: true, data: report }
  } catch (err) {
    console.error('Error in getPurchaseFeeEarnerPerformanceReport:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get executive metrics for Purchase Workflow
 */
export async function getPurchaseExecutiveMetrics(
  tenant_id: string,
  filters?: PurchaseReportFilters
): Promise<{ success: boolean; data?: PurchaseExecutiveMetrics; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: matters, error } = await supabase
      .from('matters')
      .select('id, status, purchase_price, created_at, actual_completion_date')
      .eq('tenant_id', tenant_id)
      .is('deleted_at', null)

    if (error) {
      return { success: false, error: error.message }
    }

    const totalMatters = matters?.length || 0
    const activeMatters = matters?.filter((m) => m.status === 'active').length || 0
    const completedMatters = matters?.filter((m) => m.status === 'completed').length || 0

    const totalPipelineValue =
      matters?.reduce((sum, m) => sum + (Number(m.purchase_price) || 0), 0) || 0
    const avgMatterValue = totalMatters > 0 ? totalPipelineValue / totalMatters : 0

    const conversionRate = totalMatters > 0 ? (completedMatters / totalMatters) * 100 : 0

    const completedWithDate =
      matters?.filter((m) => m.status === 'completed' && m.actual_completion_date) || []
    const completionDays = completedWithDate.map((m) => {
      const start = new Date(m.created_at)
      const end = new Date(m.actual_completion_date!)
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    })
    const avgTimeToCompletion =
      completionDays.length > 0
        ? completionDays.reduce((a, b) => a + b, 0) / completionDays.length
        : 0

    const mattersByStageResult = await getPurchaseMattersByStageReport(tenant_id, filters)
    const mattersByStage = mattersByStageResult.data || []

    const monthlyTrend: PurchaseMonthlyTrend[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const monthMatters =
        matters?.filter((m) => {
          const created = new Date(m.created_at)
          return created >= month && created < nextMonth
        }) || []

      const monthCompleted =
        matters?.filter((m) => {
          if (!m.actual_completion_date) return false
          const completed = new Date(m.actual_completion_date)
          return completed >= month && completed < nextMonth
        }) || []

      const monthValue = monthMatters.reduce(
        (sum, m) => sum + (Number(m.purchase_price) || 0),
        0
      )

      monthlyTrend.push({
        month: month.toLocaleDateString('en-GB', { month: 'short' }),
        year: month.getFullYear(),
        matters_started: monthMatters.length,
        matters_completed: monthCompleted.length,
        total_value: monthValue,
      })
    }

    const metrics: PurchaseExecutiveMetrics = {
      total_matters: totalMatters,
      active_matters: activeMatters,
      completed_matters: completedMatters,
      total_pipeline_value: totalPipelineValue,
      avg_matter_value: avgMatterValue,
      conversion_rate: conversionRate,
      avg_time_to_completion: Math.round(avgTimeToCompletion * 10) / 10,
      matters_by_stage: mattersByStage,
      monthly_trend: monthlyTrend,
    }

    return { success: true, data: metrics }
  } catch (err) {
    console.error('Error in getPurchaseExecutiveMetrics:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Export data to CSV format
 * Re-exported from lib/utils/csv for backwards compatibility
 */
export { exportToCSV } from '@/lib/utils/csv'
