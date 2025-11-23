// =====================================================
// PHASE 11: SUPPORT SERVICE
// =====================================================

import { createClient } from '@/lib/supabase/server'
import type {
  SupportTicket,
  SupportTicketMessage,
  KnowledgeBaseArticle,
  FeatureRequest,
  CreateSupportTicketRequest,
  CreateTicketMessageRequest,
  CreateFeatureRequestRequest,
  SupportDashboardStats,
} from '@/lib/types/go-to-market'

// =====================================================
// SUPPORT TICKETS
// =====================================================

export async function getSupportTickets(
  tenantId?: string,
  status?: string,
  limit: number = 50
) {
  const supabase = await createClient()

  let query = supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (tenantId) {
    query = query.eq('tenant_id', tenantId)
  }

  if (status) {
    query = query.eq('status', status as any)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, tickets: [] }
  }

  return { tickets: data as SupportTicket[], error: null }
}

export async function getSupportTicket(ticketId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single()

  if (error) {
    return { error: error.message, ticket: null }
  }

  return { ticket: data as SupportTicket, error: null }
}

export async function createSupportTicket(
  tenantId: string,
  userId: string,
  userEmail: string,
  userName: string,
  data: CreateSupportTicketRequest
) {
  const supabase = await createClient()

  // Generate ticket number
  const { data: ticketNumber } = await (supabase as any).rpc('generate_ticket_number')

  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .insert({
      tenant_id: tenantId,
      ticket_number: ticketNumber,
      subject: data.subject,
      description: data.description,
      requester_id: userId,
      requester_email: userEmail,
      requester_name: userName,
      category: data.category || 'other',
      priority: data.priority || 'normal',
      status: 'open',
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, ticket: null }
  }

  return { ticket: ticket as SupportTicket, error: null }
}

export async function updateSupportTicket(
  ticketId: string,
  updates: Partial<SupportTicket>
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('support_tickets')
    .update(updates)
    .eq('id', ticketId)
    .select()
    .single()

  if (error) {
    return { error: error.message, ticket: null }
  }

  return { ticket: data as SupportTicket, error: null }
}

// =====================================================
// TICKET MESSAGES
// =====================================================

export async function getTicketMessages(ticketId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('support_ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) {
    return { error: error.message, messages: [] }
  }

  return { messages: data as SupportTicketMessage[], error: null }
}

export async function createTicketMessage(
  ticketId: string,
  senderType: 'customer' | 'agent',
  senderId: string,
  senderName: string,
  data: CreateTicketMessageRequest
) {
  const supabase = await createClient()

  const { data: message, error } = await supabase
    .from('support_ticket_messages')
    .insert({
      ticket_id: ticketId,
      sender_type: senderType,
      sender_id: senderId,
      sender_name: senderName,
      message_text: data.message_text,
      is_internal: data.is_internal || false,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, message: null }
  }

  // Update ticket status and first_response_at if this is first agent response
  if (senderType === 'agent') {
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('first_response_at, status')
      .eq('id', ticketId)
      .single()

    if (ticket && !ticket.first_response_at) {
      await supabase
        .from('support_tickets')
        .update({
          first_response_at: new Date().toISOString(),
          status: 'in_progress',
        })
        .eq('id', ticketId)
    }
  }

  return { message: message as SupportTicketMessage, error: null }
}

// =====================================================
// KNOWLEDGE BASE
// =====================================================

export async function getKnowledgeBaseArticles(
  category?: string,
  published_only: boolean = true
) {
  const supabase = await createClient()

  let query = supabase
    .from('knowledge_base_articles')
    .select('*')
    .order('created_at', { ascending: false })

  if (published_only) {
    query = query.eq('is_published', true)
  }

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, articles: [] }
  }

  return { articles: data as KnowledgeBaseArticle[], error: null }
}

export async function getKnowledgeBaseArticle(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('knowledge_base_articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) {
    return { error: error.message, article: null }
  }

  // Increment view count
  await supabase
    .from('knowledge_base_articles')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', data.id)

  return { article: data as KnowledgeBaseArticle, error: null }
}

export async function searchKnowledgeBase(query: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('knowledge_base_articles')
    .select('*')
    .eq('is_published', true)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .limit(10)

  if (error) {
    return { error: error.message, articles: [] }
  }

  return { articles: data as KnowledgeBaseArticle[], error: null }
}

export async function markArticleHelpful(articleId: string, helpful: boolean) {
  const supabase = await createClient()

  const field = helpful ? 'helpful_count' : 'not_helpful_count'

  const { error } = await (supabase as any).rpc('increment', {
    table_name: 'knowledge_base_articles',
    row_id: articleId,
    field_name: field,
  })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

// =====================================================
// FEATURE REQUESTS
// =====================================================

export async function getFeatureRequests(status?: string, limit: number = 50) {
  const supabase = await createClient()

  let query = supabase
    .from('feature_requests')
    .select('*')
    .order('vote_count', { ascending: false })
    .limit(limit)

  if (status) {
    query = query.eq('status', status as any)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, requests: [] }
  }

  return { requests: data as FeatureRequest[], error: null }
}

export async function createFeatureRequest(
  userId: string,
  userEmail: string,
  data: CreateFeatureRequestRequest,
  tenantId?: string
) {
  const supabase = await createClient()

  const { data: request, error } = await supabase
    .from('feature_requests')
    .insert({
      tenant_id: tenantId,
      title: data.title,
      description: data.description,
      requester_id: userId,
      requester_email: userEmail,
      category: data.category,
      status: 'under_review',
      vote_count: 1, // Auto-vote for creator
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, request: null }
  }

  return { request: request as FeatureRequest, error: null }
}

export async function voteFeatureRequest(requestId: string) {
  const supabase = await createClient()

  // TODO: Implement vote count increment using RPC
  // Supabase JS client doesn't support raw SQL in updates
  // This should use an RPC function instead
  /*
  const { error } = await (supabase as any).rpc('increment_vote_count', { request_id: requestId })
  if (error) {
    return { error: error.message }
  }
  */

  return { error: null }
}

// =====================================================
// SUPPORT DASHBOARD
// =====================================================

export async function getSupportDashboardStats(tenantId?: string) {
  const supabase = await createClient()

  let query = supabase.from('support_tickets').select('*')

  if (tenantId) {
    query = query.eq('tenant_id', tenantId)
  }

  const { data: tickets, error } = await query

  if (error) {
    return { error: error.message, stats: null }
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const stats: SupportDashboardStats = {
    total_tickets: tickets.length,
    open_tickets: tickets.filter((t) =>
      ['open', 'in_progress', 'waiting_for_customer'].includes(t.status)
    ).length,
    resolved_today: tickets.filter((t) => {
      if (!t.resolved_at) return false
      return new Date(t.resolved_at) >= today
    }).length,
    avg_response_time_hours: calculateAvgResponseTime(tickets),
    by_status: {},
    by_priority: {},
  }

  // Count by status
  tickets.forEach((ticket) => {
    stats.by_status[ticket.status] =
      (stats.by_status[ticket.status] || 0) + 1
    stats.by_priority[ticket.priority] =
      (stats.by_priority[ticket.priority] || 0) + 1
  })

  return { stats, error: null }
}

function calculateAvgResponseTime(tickets: any[]): number {
  const responseTimes = tickets
    .filter((t) => t.first_response_at)
    .map((t) => {
      const created = new Date(t.created_at).getTime()
      const responded = new Date(t.first_response_at).getTime()
      return (responded - created) / (1000 * 60 * 60) // Convert to hours
    })

  if (responseTimes.length === 0) return 0

  return (
    responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
  )
}
