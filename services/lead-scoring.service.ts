import { createClient } from '@/lib/supabase/server'

export interface LeadScore {
  client_id: string
  score: number
  grade: 'hot' | 'warm' | 'cold'
  factors: {
    engagement: number
    property_value: number
    response_time: number
    service_history: number
  }
  recommendations: string[]
}

/**
 * Calculate lead score for a client
 *
 * Scoring factors:
 * - Email engagement (opens, clicks) - 30 points
 * - Property value - 25 points
 * - Response time to quotes - 20 points
 * - Service history - 15 points
 * - Client type - 10 points
 *
 * Total: 100 points
 * - 70-100: Hot lead
 * - 40-69: Warm lead
 * - 0-39: Cold lead
 */
export async function calculateLeadScore(clientId: string, tenantId: string): Promise<LeadScore> {
  const supabase = await createClient()

  let score = 0
  const factors = {
    engagement: 0,
    property_value: 0,
    response_time: 0,
    service_history: 0,
  }
  const recommendations: string[] = []

  // Get client data
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (!client) {
    return {
      client_id: clientId,
      score: 0,
      grade: 'cold',
      factors,
      recommendations: ['Client not found'],
    }
  }

  // 1. Email Engagement Score (0-30 points)
  const { data: emails } = await supabase
    .from('email_history')
    .select('opened_at, clicked_at')
    .eq('client_id', clientId)
    .eq('tenant_id', tenantId)

  if (emails && emails.length > 0) {
    const totalEmails = emails.length
    const opens = emails.filter(e => e.opened_at).length
    const clicks = emails.filter(e => e.clicked_at).length

    const openRate = opens / totalEmails
    const clickRate = clicks / totalEmails

    factors.engagement = Math.min(30, Math.round(
      (openRate * 20) + (clickRate * 10)
    ))
    score += factors.engagement

    if (openRate < 0.2) {
      recommendations.push('Low email engagement - try different subject lines or content')
    }
    if (clickRate < 0.05 && opens > 0) {
      recommendations.push('Opens but no clicks - add clearer call-to-action buttons')
    }
  } else {
    recommendations.push('No email engagement yet - enroll in welcome campaign')
  }

  // 2. Property Value Score (0-25 points)
  const { data: quotes } = await supabase
    .from('quotes')
    .select('transaction_value')
    .eq('client_id', clientId)
    .eq('tenant_id', tenantId)

  if (quotes && quotes.length > 0) {
    const avgValue = quotes.reduce((sum, q) => sum + (q.transaction_value || 0), 0) / quotes.length

    if (avgValue > 500000) {
      factors.property_value = 25
    } else if (avgValue > 300000) {
      factors.property_value = 20
    } else if (avgValue > 200000) {
      factors.property_value = 15
    } else if (avgValue > 100000) {
      factors.property_value = 10
    } else {
      factors.property_value = 5
    }

    score += factors.property_value

    if (avgValue > 400000) {
      recommendations.push('High-value client - prioritize personalized service')
    }
  }

  // 3. Response Time Score (0-20 points)
  const { data: recentQuotes } = await supabase
    .from('quotes')
    .select('created_at, accepted_at, status')
    .eq('client_id', clientId)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(3)

  if (recentQuotes && recentQuotes.length > 0) {
    const acceptedQuotes = recentQuotes.filter(q => q.accepted_at)

    if (acceptedQuotes.length > 0) {
      const avgResponseTime = acceptedQuotes.reduce((sum, q) => {
        const sent = new Date(q.created_at).getTime()
        const accepted = new Date(q.accepted_at!).getTime()
        return sum + (accepted - sent)
      }, 0) / acceptedQuotes.length

      const daysToRespond = avgResponseTime / (1000 * 60 * 60 * 24)

      if (daysToRespond < 1) {
        factors.response_time = 20
        recommendations.push('Fast responder - prioritize for urgent quotes')
      } else if (daysToRespond < 3) {
        factors.response_time = 15
      } else if (daysToRespond < 7) {
        factors.response_time = 10
      } else {
        factors.response_time = 5
        recommendations.push('Slow to respond - send reminder emails')
      }

      score += factors.response_time
    }
  }

  // 4. Service History Score (0-15 points)
  const { count: quoteCount } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('tenant_id', tenantId)

  if (quoteCount && quoteCount > 0) {
    if (quoteCount >= 5) {
      factors.service_history = 15
      recommendations.push('Repeat client - offer loyalty discount or premium service')
    } else if (quoteCount >= 3) {
      factors.service_history = 10
    } else if (quoteCount >= 2) {
      factors.service_history = 5
    }

    score += factors.service_history
  } else {
    recommendations.push('New client - focus on building relationship')
  }

  // Determine grade
  let grade: 'hot' | 'warm' | 'cold'
  if (score >= 70) {
    grade = 'hot'
  } else if (score >= 40) {
    grade = 'warm'
  } else {
    grade = 'cold'
  }

  return {
    client_id: clientId,
    score,
    grade,
    factors,
    recommendations,
  }
}

/**
 * Get all hot leads for a tenant
 */
export async function getHotLeads(tenantId: string): Promise<LeadScore[]> {
  const supabase = await createClient()

  // Get all clients
  const { data: clients } = await supabase
    .from('clients')
    .select('id')
    .eq('tenant_id', tenantId)

  if (!clients) return []

  // Calculate scores for all clients
  const scores = await Promise.all(
    clients.map(c => calculateLeadScore(c.id, tenantId))
  )

  // Filter for hot leads only
  return scores
    .filter(s => s.grade === 'hot')
    .sort((a, b) => b.score - a.score)
}
