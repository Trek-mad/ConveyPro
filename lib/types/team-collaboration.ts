// =====================================================
// PHASE 8: TEAM COLLABORATION TYPES
// =====================================================

// =====================================================
// STAFF MANAGEMENT
// =====================================================

export interface StaffProfile {
  id: string
  user_id: string
  tenant_id: string

  // Profile information
  job_title?: string
  department?: string
  bio?: string
  avatar_url?: string
  phone_work?: string
  phone_mobile?: string

  // Work settings
  max_workload: number
  specializations: string[]
  availability_status: 'available' | 'busy' | 'away' | 'offline'

  // Performance metrics
  total_quotes_handled: number
  total_clients_managed: number
  average_response_time_hours?: number
  client_satisfaction_score?: number

  // Settings
  notification_preferences: {
    email: boolean
    push: boolean
    sms: boolean
    digest: 'never' | 'daily' | 'weekly'
  }

  // Metadata
  is_active: boolean
  last_activity_at?: string
  created_at: string
  updated_at: string
}

export interface QuoteAssignment {
  id: string
  quote_id: string
  assigned_to: string
  assigned_by?: string
  tenant_id: string

  assignment_type: 'primary' | 'secondary' | 'reviewer' | 'observer'
  assigned_at: string
  completed_at?: string

  assignment_note?: string
  created_at: string
}

export interface ClientAssignment {
  id: string
  client_id: string
  assigned_to: string
  assigned_by?: string
  tenant_id: string

  is_primary_owner: boolean
  assigned_at: string
  assignment_note?: string

  created_at: string
  updated_at: string
}

// =====================================================
// WORKFLOW & APPROVALS
// =====================================================

export interface ApprovalWorkflow {
  id: string
  tenant_id: string

  name: string
  description?: string
  workflow_type: 'quote' | 'campaign' | 'template' | 'form' | 'custom'

  approval_steps: ApprovalStep[]
  auto_approve_threshold?: number

  is_active: boolean
  is_required: boolean

  created_by?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface ApprovalStep {
  role: string
  required_approvers: number
  order: number
}

export interface ApprovalRequest {
  id: string
  workflow_id?: string
  tenant_id: string

  request_type: 'quote' | 'campaign' | 'template' | 'form' | 'custom'
  entity_id: string
  entity_data?: Record<string, any>

  submitted_by: string
  submitted_at: string
  submission_note?: string

  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  current_step: number

  decided_by?: string
  decided_at?: string
  decision_note?: string

  created_at: string
  updated_at: string
}

export interface ApprovalComment {
  id: string
  approval_request_id: string
  tenant_id: string

  commented_by: string
  comment_text: string
  is_internal: boolean

  attachments: Array<{
    name: string
    url: string
    type: string
  }>

  created_at: string
  updated_at: string
  deleted_at?: string
}

// =====================================================
// NOTIFICATIONS & ALERTS
// =====================================================

export type NotificationType =
  | 'form_submission'
  | 'quote_accepted'
  | 'quote_viewed'
  | 'campaign_milestone'
  | 'approval_request'
  | 'approval_decision'
  | 'assignment'
  | 'mention'
  | 'task_reminder'
  | 'system'

export interface Notification {
  id: string
  tenant_id: string
  user_id: string

  notification_type: NotificationType
  title: string
  message: string

  action_url?: string
  entity_type?: string
  entity_id?: string

  is_read: boolean
  read_at?: string

  sent_email: boolean
  sent_push: boolean
  sent_sms: boolean

  priority: 'low' | 'normal' | 'high' | 'urgent'

  created_at: string
  expires_at?: string
}

// =====================================================
// PERMISSIONS & AUDIT
// =====================================================

export interface AuditLog {
  id: string
  tenant_id?: string

  user_id?: string
  user_email?: string
  user_role?: string

  action: string
  resource_type: string
  resource_id?: string

  description?: string
  changes?: Record<string, any>
  metadata: Record<string, any>

  ip_address?: string
  user_agent?: string
  request_id?: string

  created_at: string
}

// =====================================================
// EXTENDED TYPES (with relations)
// =====================================================

export interface StaffProfileWithUser extends StaffProfile {
  user: {
    id: string
    email: string
    full_name?: string
  }
}

export interface QuoteAssignmentWithDetails extends QuoteAssignment {
  quote: {
    id: string
    quote_number: string
    client_name: string
    status: string
    total_amount: number
  }
  assigned_user: {
    id: string
    email: string
    full_name?: string
  }
}

export interface ApprovalRequestWithDetails extends ApprovalRequest {
  workflow?: ApprovalWorkflow
  submitter: {
    id: string
    email: string
    full_name?: string
  }
  decider?: {
    id: string
    email: string
    full_name?: string
  }
  comments: ApprovalComment[]
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface CreateStaffProfileRequest {
  user_id: string
  job_title?: string
  department?: string
  bio?: string
  phone_work?: string
  phone_mobile?: string
  specializations?: string[]
}

export interface UpdateStaffProfileRequest {
  job_title?: string
  department?: string
  bio?: string
  avatar_url?: string
  phone_work?: string
  phone_mobile?: string
  max_workload?: number
  specializations?: string[]
  availability_status?: 'available' | 'busy' | 'away' | 'offline'
  notification_preferences?: {
    email?: boolean
    push?: boolean
    sms?: boolean
    digest?: 'never' | 'daily' | 'weekly'
  }
}

export interface CreateQuoteAssignmentRequest {
  quote_id: string
  assigned_to: string
  assignment_type?: 'primary' | 'secondary' | 'reviewer' | 'observer'
  assignment_note?: string
}

export interface CreateClientAssignmentRequest {
  client_id: string
  assigned_to: string
  is_primary_owner?: boolean
  assignment_note?: string
}

export interface CreateApprovalWorkflowRequest {
  name: string
  description?: string
  workflow_type: 'quote' | 'campaign' | 'template' | 'form' | 'custom'
  approval_steps: ApprovalStep[]
  auto_approve_threshold?: number
  is_required?: boolean
}

export interface CreateApprovalRequestRequest {
  workflow_id?: string
  request_type: 'quote' | 'campaign' | 'template' | 'form' | 'custom'
  entity_id: string
  entity_data?: Record<string, any>
  submission_note?: string
}

export interface ApproveRejectRequest {
  decision: 'approved' | 'rejected'
  decision_note?: string
}

export interface CreateNotificationRequest {
  user_id: string
  notification_type: NotificationType
  title: string
  message: string
  action_url?: string
  entity_type?: string
  entity_id?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}

// =====================================================
// DASHBOARD & STATS TYPES
// =====================================================

export interface StaffWorkloadStats {
  staff_id: string
  staff_name: string
  current_quotes: number
  current_clients: number
  total_workload: number
  max_workload: number
  workload_percentage: number
  average_response_time_hours?: number
  client_satisfaction_score?: number
}

export interface TeamPerformanceStats {
  total_staff: number
  active_staff: number
  total_quotes_handled: number
  average_response_time_hours: number
  average_satisfaction_score: number
  staff_breakdown: StaffWorkloadStats[]
}

export interface ApprovalStats {
  total_pending: number
  total_approved_today: number
  total_rejected_today: number
  average_approval_time_hours: number
  by_type: {
    [key: string]: {
      pending: number
      approved: number
      rejected: number
    }
  }
}

export interface NotificationStats {
  total_unread: number
  by_type: {
    [key in NotificationType]?: number
  }
  by_priority: {
    low: number
    normal: number
    high: number
    urgent: number
  }
}
