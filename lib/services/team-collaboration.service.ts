// =====================================================
// PHASE 8: TEAM COLLABORATION SERVICE
// =====================================================

import { createClient } from '@/lib/supabase/server'
import type {
  StaffProfile,
  QuoteAssignment,
  ClientAssignment,
  ApprovalWorkflow,
  ApprovalRequest,
  ApprovalComment,
  Notification,
  AuditLog,
  CreateStaffProfileRequest,
  UpdateStaffProfileRequest,
  CreateQuoteAssignmentRequest,
  CreateClientAssignmentRequest,
  CreateApprovalWorkflowRequest,
  CreateApprovalRequestRequest,
  ApproveRejectRequest,
  CreateNotificationRequest,
  StaffWorkloadStats,
  TeamPerformanceStats,
  ApprovalStats,
  NotificationStats,
} from '@/lib/types/team-collaboration'

// =====================================================
// STAFF MANAGEMENT
// =====================================================

export async function getStaffProfiles(tenantId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('staff_profiles')
    .select(`
      *,
      user:user_id (
        id,
        email,
        full_name
      )
    `)
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, profiles: [] }
  }

  return { profiles: data as any[], error: null }
}

export async function getStaffProfile(userId: string, tenantId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('staff_profiles')
    .select(`
      *,
      user:user_id (
        id,
        email,
        full_name
      )
    `)
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .single()

  if (error) {
    return { error: error.message, profile: null }
  }

  return { profile: data as any, error: null }
}

export async function createStaffProfile(
  tenantId: string,
  data: CreateStaffProfileRequest
) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('staff_profiles')
    .insert({
      ...data,
      tenant_id: tenantId,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, profile: null }
  }

  return { profile: profile as StaffProfile, error: null }
}

export async function updateStaffProfile(
  userId: string,
  tenantId: string,
  data: UpdateStaffProfileRequest
) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('staff_profiles')
    .update(data)
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .select()
    .single()

  if (error) {
    return { error: error.message, profile: null }
  }

  return { profile: profile as StaffProfile, error: null }
}

export async function getTeamWorkloadStats(tenantId: string) {
  const supabase = await createClient()

  // Get all staff with their assignments
  const { data: staff, error } = await supabase
    .from('staff_profiles')
    .select(`
      *,
      user:user_id (
        id,
        email,
        full_name
      ),
      quote_assignments:quote_assignments!assigned_to (
        id,
        quote_id
      ),
      client_assignments:client_assignments!assigned_to (
        id,
        client_id
      )
    `)
    .eq('tenant_id', tenantId)
    .eq('is_active', true)

  if (error) {
    return { error: error.message, stats: null }
  }

  // Calculate stats
  const staffStats: StaffWorkloadStats[] = staff.map((s: any) => ({
    staff_id: s.user_id,
    staff_name: s.user?.full_name || s.user?.email || 'Unknown',
    current_quotes: s.quote_assignments?.length || 0,
    current_clients: s.client_assignments?.length || 0,
    total_workload: (s.quote_assignments?.length || 0) + (s.client_assignments?.length || 0),
    max_workload: s.max_workload,
    workload_percentage: ((s.quote_assignments?.length || 0) + (s.client_assignments?.length || 0)) / s.max_workload * 100,
    average_response_time_hours: s.average_response_time_hours,
    client_satisfaction_score: s.client_satisfaction_score,
  }))

  const teamStats: TeamPerformanceStats = {
    total_staff: staff.length,
    active_staff: staff.filter((s: any) => s.availability_status === 'available').length,
    total_quotes_handled: staff.reduce((sum: number, s: any) => sum + s.total_quotes_handled, 0),
    average_response_time_hours: staff.reduce((sum: number, s: any) => sum + (s.average_response_time_hours || 0), 0) / staff.length,
    average_satisfaction_score: staff.reduce((sum: number, s: any) => sum + (s.client_satisfaction_score || 0), 0) / staff.length,
    staff_breakdown: staffStats,
  }

  return { stats: teamStats, error: null }
}

// =====================================================
// QUOTE & CLIENT ASSIGNMENTS
// =====================================================

export async function createQuoteAssignment(
  tenantId: string,
  data: CreateQuoteAssignmentRequest
) {
  const supabase = await createClient()

  const { data: assignment, error } = await supabase
    .from('quote_assignments')
    .insert({
      ...data,
      tenant_id: tenantId,
      assigned_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, assignment: null }
  }

  // Create notification for assigned user
  await createNotification(tenantId, {
    user_id: data.assigned_to,
    notification_type: 'assignment',
    title: 'New Quote Assignment',
    message: `You have been assigned to quote ${data.quote_id}`,
    action_url: `/quotes/${data.quote_id}`,
    entity_type: 'quote',
    entity_id: data.quote_id,
    priority: 'normal',
  })

  return { assignment: assignment as QuoteAssignment, error: null }
}

export async function getQuoteAssignments(quoteId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('quote_assignments')
    .select(`
      *,
      assigned_user:assigned_to (
        id,
        email
      )
    `)
    .eq('quote_id', quoteId)
    .order('assigned_at', { ascending: false })

  if (error) {
    return { error: error.message, assignments: [] }
  }

  return { assignments: data as any[], error: null }
}

export async function createClientAssignment(
  tenantId: string,
  data: CreateClientAssignmentRequest
) {
  const supabase = await createClient()

  const { data: assignment, error } = await supabase
    .from('client_assignments')
    .insert({
      ...data,
      tenant_id: tenantId,
      assigned_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, assignment: null }
  }

  // Create notification
  await createNotification(tenantId, {
    user_id: data.assigned_to,
    notification_type: 'assignment',
    title: 'New Client Assignment',
    message: `You have been assigned as ${data.is_primary_owner ? 'primary owner' : 'team member'} for a client`,
    action_url: `/clients/${data.client_id}`,
    entity_type: 'client',
    entity_id: data.client_id,
    priority: 'normal',
  })

  return { assignment: assignment as ClientAssignment, error: null }
}

export async function getClientAssignments(clientId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('client_assignments')
    .select(`
      *,
      assigned_user:assigned_to (
        id,
        email
      )
    `)
    .eq('client_id', clientId)
    .order('is_primary_owner', { ascending: false })

  if (error) {
    return { error: error.message, assignments: [] }
  }

  return { assignments: data as any[], error: null }
}

// =====================================================
// APPROVAL WORKFLOWS
// =====================================================

export async function getApprovalWorkflows(tenantId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('approval_workflows')
    .select('*')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, workflows: [] }
  }

  return { workflows: data as ApprovalWorkflow[], error: null }
}

export async function createApprovalWorkflow(
  tenantId: string,
  data: CreateApprovalWorkflowRequest
) {
  const supabase = await createClient()

  const { data: workflow, error } = await supabase
    .from('approval_workflows')
    .insert({
      ...data,
      tenant_id: tenantId,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, workflow: null }
  }

  return { workflow: workflow as ApprovalWorkflow, error: null }
}

export async function createApprovalRequest(
  tenantId: string,
  data: CreateApprovalRequestRequest
) {
  const supabase = await createClient()

  const { data: request, error } = await supabase
    .from('approval_requests')
    .insert({
      ...data,
      tenant_id: tenantId,
      submitted_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, request: null }
  }

  // Notify approvers
  // TODO: Get approvers from workflow and send notifications

  return { request: request as ApprovalRequest, error: null }
}

export async function getApprovalRequests(tenantId: string, status?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('approval_requests')
    .select(`
      *,
      workflow:workflow_id (*),
      submitter:submitted_by (
        id,
        email
      )
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, requests: [] }
  }

  return { requests: data as any[], error: null }
}

export async function approveRejectRequest(
  requestId: string,
  decision: ApproveRejectRequest
) {
  const supabase = await createClient()

  const user = (await supabase.auth.getUser()).data.user

  const { data: request, error } = await supabase
    .from('approval_requests')
    .update({
      status: decision.decision,
      decided_by: user?.id,
      decided_at: new Date().toISOString(),
      decision_note: decision.decision_note,
    })
    .eq('id', requestId)
    .select()
    .single()

  if (error) {
    return { error: error.message, request: null }
  }

  // Notify submitter
  const typedRequest = request as ApprovalRequest
  await createNotification(typedRequest.tenant_id, {
    user_id: typedRequest.submitted_by,
    notification_type: 'approval_decision',
    title: `Request ${decision.decision === 'approved' ? 'Approved' : 'Rejected'}`,
    message: `Your ${typedRequest.request_type} request has been ${decision.decision}`,
    action_url: `/approvals/${requestId}`,
    entity_type: typedRequest.request_type,
    entity_id: typedRequest.entity_id,
    priority: 'high',
  })

  return { request: typedRequest, error: null }
}

export async function addApprovalComment(
  requestId: string,
  tenantId: string,
  commentText: string,
  isInternal: boolean = true
) {
  const supabase = await createClient()

  const { data: comment, error } = await supabase
    .from('approval_comments')
    .insert({
      approval_request_id: requestId,
      tenant_id: tenantId,
      commented_by: (await supabase.auth.getUser()).data.user?.id,
      comment_text: commentText,
      is_internal: isInternal,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, comment: null }
  }

  return { comment: comment as ApprovalComment, error: null }
}

// =====================================================
// NOTIFICATIONS
// =====================================================

export async function getNotifications(
  userId: string,
  unreadOnly: boolean = false
) {
  const supabase = await createClient()

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, notifications: [] }
  }

  return { notifications: data as Notification[], error: null }
}

export async function createNotification(
  tenantId: string,
  data: CreateNotificationRequest
) {
  const supabase = await createClient()

  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      ...data,
      tenant_id: tenantId,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, notification: null }
  }

  return { notification: notification as Notification, error: null }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId)
    .select()
    .single()

  if (error) {
    return { error: error.message, notification: null }
  }

  return { notification: data as Notification, error: null }
}

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

export async function getNotificationStats(userId: string) {
  const supabase = await createClient()

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('notification_type, priority, is_read')
    .eq('user_id', userId)

  if (error) {
    return { error: error.message, stats: null }
  }

  const stats: NotificationStats = {
    total_unread: notifications.filter(n => !n.is_read).length,
    by_type: {},
    by_priority: {
      low: 0,
      normal: 0,
      high: 0,
      urgent: 0,
    },
  }

  notifications.forEach(n => {
    if (!n.is_read) {
      stats.by_type[n.notification_type] = (stats.by_type[n.notification_type] || 0) + 1
      stats.by_priority[n.priority as keyof typeof stats.by_priority]++
    }
  })

  return { stats, error: null }
}

// =====================================================
// AUDIT LOGS
// =====================================================

export async function getAuditLogs(
  tenantId: string,
  filters?: {
    userId?: string
    resourceType?: string
    resourceId?: string
    action?: string
    limit?: number
  }
) {
  const supabase = await createClient()

  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(filters?.limit || 100)

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId)
  }

  if (filters?.resourceType) {
    query = query.eq('resource_type', filters.resourceType)
  }

  if (filters?.resourceId) {
    query = query.eq('resource_id', filters.resourceId)
  }

  if (filters?.action) {
    query = query.eq('action', filters.action)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, logs: [] }
  }

  return { logs: data as AuditLog[], error: null }
}

export async function createAuditLog(
  tenantId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  description?: string,
  changes?: Record<string, any>
) {
  const supabase = await createClient()

  const user = (await supabase.auth.getUser()).data.user

  const { data: log, error } = await supabase
    .from('audit_logs')
    .insert({
      tenant_id: tenantId,
      user_id: user?.id,
      user_email: user?.email,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      description,
      changes,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, log: null }
  }

  return { log: log as AuditLog, error: null }
}
