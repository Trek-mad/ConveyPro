// =====================================================
// PHASE 11: GO-TO-MARKET TYPES
// =====================================================

// =====================================================
// BILLING & SUBSCRIPTIONS
// =====================================================

export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description?: string
  price_monthly: number
  price_yearly: number
  currency: string
  max_users?: number
  max_quotes_per_month?: number
  max_clients?: number
  max_email_sends_per_month?: number
  features: string[]
  stripe_price_id_monthly?: string
  stripe_price_id_yearly?: string
  stripe_product_id?: string
  is_active: boolean
  is_popular: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface TenantSubscription {
  id: string
  tenant_id: string
  plan_id: string
  billing_cycle: 'monthly' | 'yearly'
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'paused'
  trial_ends_at?: string
  current_period_start: string
  current_period_end: string
  cancelled_at?: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  quotes_used_this_period: number
  emails_sent_this_period: number
  created_at: string
  updated_at: string
}

export interface PaymentMethod {
  id: string
  tenant_id: string
  type: 'card' | 'bank_account'
  last4: string
  brand?: string
  exp_month?: number
  exp_year?: number
  is_default: boolean
  stripe_payment_method_id: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  tenant_id: string
  subscription_id?: string
  invoice_number: string
  amount_due: number
  amount_paid: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  invoice_date: string
  due_date: string
  paid_at?: string
  stripe_invoice_id?: string
  stripe_invoice_pdf?: string
  line_items: InvoiceLineItem[]
  created_at: string
  updated_at: string
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  unit_price: number
  amount: number
}

export interface UsageEvent {
  id: string
  tenant_id: string
  subscription_id?: string
  event_type: 'quote_created' | 'email_sent' | 'user_added' | 'client_added'
  quantity: number
  metadata: Record<string, any>
  created_at: string
}

// =====================================================
// ONBOARDING
// =====================================================

export interface TenantOnboarding {
  id: string
  tenant_id: string
  current_step: number
  is_completed: boolean
  completed_steps: string[]
  checklist: {
    profile_completed: boolean
    team_invited: boolean
    first_quote_created: boolean
    branding_customized: boolean
    form_created: boolean
    campaign_created: boolean
  }
  email_course_day: number
  email_course_started_at?: string
  email_course_completed_at?: string
  sample_data_generated: boolean
  success_score: number
  time_to_first_quote_hours?: number
  started_at: string
  completed_at?: string
  updated_at: string
}

export interface OnboardingWalkthrough {
  id: string
  name: string
  slug: string
  description?: string
  video_url?: string
  steps: OnboardingStep[]
  estimated_duration_minutes?: number
  target_role?: string[]
  trigger_event?: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  action?: string
  order: number
}

// =====================================================
// MARKETING
// =====================================================

export interface DemoRequest {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  company_name: string
  company_size?: string
  message?: string
  preferred_date?: string
  lead_source?: string
  lead_score: number
  status: 'new' | 'contacted' | 'scheduled' | 'completed' | 'lost'
  assigned_to?: string
  internal_notes?: string
  created_at: string
  updated_at: string
}

export interface Testimonial {
  id: string
  tenant_id?: string
  author_name: string
  author_title?: string
  author_company?: string
  author_photo_url?: string
  testimonial_text: string
  rating?: number
  result_achieved?: string
  is_featured: boolean
  is_approved: boolean
  display_order: number
  created_at: string
  updated_at: string
}

// =====================================================
// SUPPORT
// =====================================================

export interface SupportTicket {
  id: string
  tenant_id?: string
  ticket_number: string
  subject: string
  description: string
  requester_id?: string
  requester_email: string
  requester_name: string
  category?: 'billing' | 'technical' | 'feature_request' | 'bug' | 'other'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed'
  assigned_to?: string
  first_response_at?: string
  resolved_at?: string
  closed_at?: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface SupportTicketMessage {
  id: string
  ticket_id: string
  sender_type: 'customer' | 'agent'
  sender_id?: string
  sender_name: string
  message_text: string
  is_internal: boolean
  attachments: Array<{
    name: string
    url: string
    type: string
  }>
  created_at: string
}

export interface KnowledgeBaseArticle {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  category: string
  tags: string[]
  meta_title?: string
  meta_description?: string
  is_published: boolean
  is_featured: boolean
  view_count: number
  helpful_count: number
  not_helpful_count: number
  author_id?: string
  published_at?: string
  created_at: string
  updated_at: string
}

export interface FeatureRequest {
  id: string
  tenant_id?: string
  title: string
  description: string
  requester_id?: string
  requester_email: string
  category?: string
  status: 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined'
  vote_count: number
  estimated_effort?: string
  planned_release?: string
  created_at: string
  updated_at: string
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface CreateSubscriptionRequest {
  plan_id: string
  billing_cycle: 'monthly' | 'yearly'
  payment_method_id: string
}

export interface UpdateSubscriptionRequest {
  plan_id?: string
  billing_cycle?: 'monthly' | 'yearly'
}

export interface CreatePaymentMethodRequest {
  stripe_payment_method_id: string
  set_as_default?: boolean
}

export interface CreateDemoRequestRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
  company_name: string
  company_size?: string
  message?: string
  preferred_date?: string
}

export interface CreateSupportTicketRequest {
  subject: string
  description: string
  category?: 'billing' | 'technical' | 'feature_request' | 'bug' | 'other'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}

export interface CreateTicketMessageRequest {
  message_text: string
  is_internal?: boolean
}

export interface CreateFeatureRequestRequest {
  title: string
  description: string
  category?: string
}

export interface UpdateOnboardingRequest {
  current_step?: number
  completed_steps?: string[]
  checklist?: Partial<TenantOnboarding['checklist']>
}

// =====================================================
// DASHBOARD & STATS TYPES
// =====================================================

export interface BillingDashboardData {
  subscription?: TenantSubscription
  plan?: SubscriptionPlan
  payment_methods: PaymentMethod[]
  recent_invoices: Invoice[]
  usage_this_period: {
    quotes_used: number
    emails_sent: number
    quotes_limit?: number
    emails_limit?: number
  }
}

export interface OnboardingProgress {
  onboarding: TenantOnboarding
  next_steps: OnboardingStep[]
  progress_percentage: number
}

export interface SupportDashboardStats {
  total_tickets: number
  open_tickets: number
  resolved_today: number
  avg_response_time_hours: number
  by_status: {
    [key: string]: number
  }
  by_priority: {
    [key: string]: number
  }
}
