import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * PHASE 7: Intelligent Triggers Service
 * Foundation for smart automation based on client behavior
 */

/**
 * Predict next purchase timeframe
 */
export async function predictNextPurchase(clientId: string, tenantId: string) {
  const supabase = createServiceRoleClient()

  const factors: string[] = []
  const { data: quotes } = await supabase
    .from('quotes')
    .select('created_at, transaction_type, status')
    .eq('client_id', clientId)
    .eq('tenant_id', tenantId)
    .eq('status', 'accepted')
    .order('created_at', { ascending: true })

  if (!quotes || quotes.length === 0) {
    return { likely_timeframe: 'unknown', confidence: 0, factors: ['No purchase history'] }
  }

  if (quotes.length >= 2) {
    const timeBetween = quotes.map((q, i) => {
      if (i === 0) return null
      const prev = new Date(quotes[i - 1].created_at).getTime()
      const curr = new Date(q.created_at).getTime()
      return (curr - prev) / (1000 * 60 * 60 * 24)
    }).filter(Boolean) as number[]

    if (timeBetween.length > 0) {
      const avgDays = timeBetween.reduce((a, b) => a + b, 0) / timeBetween.length
      factors.push(`Average ${Math.round(avgDays)} days between purchases`)

      if (avgDays < 90) return { likely_timeframe: '0-3 months', confidence: 0.75, factors }
      if (avgDays < 180) return { likely_timeframe: '3-6 months', confidence: 0.7, factors }
      if (avgDays < 365) return { likely_timeframe: '6-12 months', confidence: 0.65, factors }
      return { likely_timeframe: '12+ months', confidence: 0.6, factors }
    }
  }

  factors.push('Single purchase - predicting based on service type')
  return { likely_timeframe: '6-12 months', confidence: 0.5, factors }
}

/**
 * Identify upsell opportunities
 */
export async function identifyUpsellOpportunities(clientId: string, tenantId: string) {
  const supabase = createServiceRoleClient()
  const opportunities: any[] = []

  const { data: client } = await supabase
    .from('clients')
    .select('life_stage')
    .eq('id', clientId)
    .single()

  const { data: quotes } = await supabase
    .from('quotes')
    .select('transaction_type')
    .eq('client_id', clientId)
    .eq('tenant_id', tenantId)

  const usedServices = new Set(quotes?.map(q => q.transaction_type) || [])

  if (client?.life_stage === 'first-time-buyer') {
    opportunities.push({
      service: 'Power of Attorney',
      priority: 'high',
      reason: 'First-time buyers often need POA after property purchase',
      estimated_value: 500,
    })
    opportunities.push({
      service: 'Wills & Estate Planning',
      priority: 'high',
      reason: 'Essential estate planning for new property owners',
      estimated_value: 800,
    })
  }

  if (client?.life_stage === 'retired') {
    opportunities.push({
      service: 'Estate Planning',
      priority: 'high',
      reason: 'Comprehensive estate planning for retirement',
      estimated_value: 1500,
    })
  }

  if (client?.life_stage === 'investor' && !usedServices.has('remortgage')) {
    opportunities.push({
      service: 'Remortgage',
      priority: 'medium',
      reason: 'Investors often refinance to expand portfolio',
      estimated_value: 800,
    })
  }

  return opportunities
}

/**
 * Get count of stale quotes needing follow-up
 */
export async function getStaleQuotesCount(tenantId: string): Promise<number> {
  const supabase = createServiceRoleClient()
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const { count } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('status', 'sent')
    .lt('created_at', threeDaysAgo.toISOString())

  return count || 0
}
