/**
 * TypeScript types for Purchase Client Workflow (Phase 12)
 * Auto-generated from database schema
 */

import { Database } from './database'

// Helper types
type Json = Database['public']['Tables']['tenants']['Row']['subscription_tier']

// ============================================================================
// CLIENTS
// ============================================================================

export type Client = {
  id: string
  tenant_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  mobile: string | null
  title: string | null
  company_name: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  postcode: string | null
  country: string | null
  client_type: 'individual' | 'couple' | 'company' | 'estate' | 'business' | null
  life_stage: string | null
  source: string | null
  tags: string[] | null
  notes: string | null
  services_used: any
  preferred_contact_method: 'email' | 'phone' | 'mobile'
  date_of_birth: string | null
  national_insurance_number: string | null
  passport_number: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  deleted_at: string | null
}

export type ClientInsert = Omit<Client, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type ClientUpdate = Partial<Omit<Client, 'id' | 'tenant_id' | 'created_at'>>

// ============================================================================
// MATTERS
// ============================================================================

export type Matter = {
  id: string
  tenant_id: string
  matter_number: string
  matter_type: 'purchase' | 'sale' | 'remortgage' | 'transfer_of_equity'
  status: 'new' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  primary_client_id: string | null
  secondary_client_id: string | null
  property_id: string | null
  quote_id: string | null
  current_stage: string
  current_stage_started_at: string | null
  instruction_date: string | null
  target_completion_date: string | null
  actual_completion_date: string | null
  closing_date: string | null
  purchase_price: number | null
  mortgage_amount: number | null
  deposit_amount: number | null
  ads_applicable: boolean
  first_time_buyer: boolean
  selling_agent_name: string | null
  selling_agent_email: string | null
  selling_agent_phone: string | null
  seller_solicitor_name: string | null
  seller_solicitor_firm: string | null
  seller_solicitor_email: string | null
  assigned_fee_earner_id: string | null
  assigned_at: string | null
  assigned_by: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
  notes: string | null
  internal_notes: string | null
  metadata: any
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  deleted_at: string | null
}

export type MatterInsert = Omit<Matter, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type MatterUpdate = Partial<Omit<Matter, 'id' | 'tenant_id' | 'created_at'>>

// ============================================================================
// WORKFLOW STAGES
// ============================================================================

export type WorkflowStage = {
  id: string
  tenant_id: string | null
  stage_key: string
  stage_name: string
  stage_description: string | null
  stage_order: number
  matter_type: 'purchase' | 'sale' | 'remortgage' | 'transfer_of_equity'
  auto_transition_conditions: any | null
  required_task_keys: string[] | null
  entry_notification_template: string | null
  exit_notification_template: string | null
  reminder_days_before_due: number[] | null
  is_active: boolean
  color: string
  icon: string | null
  metadata: any
  created_at: string
  updated_at: string
}

export type WorkflowStageInsert = Omit<WorkflowStage, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type WorkflowStageUpdate = Partial<Omit<WorkflowStage, 'id' | 'created_at'>>

// ============================================================================
// MATTER TASKS
// ============================================================================

export type MatterTask = {
  id: string
  matter_id: string
  tenant_id: string
  task_key: string | null
  title: string
  description: string | null
  task_type: 'manual' | 'automated' | 'approval'
  stage: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  assigned_to: string | null
  assigned_at: string | null
  assigned_by: string | null
  due_date: string | null
  completed_at: string | null
  completed_by: string | null
  depends_on_task_ids: string[] | null
  blocks_stage_progression: boolean
  reminder_sent_at: string | null
  reminder_days_before: number
  metadata: any
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type MatterTaskInsert = Omit<MatterTask, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type MatterTaskUpdate = Partial<Omit<MatterTask, 'id' | 'matter_id' | 'tenant_id' | 'created_at'>>

// Convenience alias
export type Task = MatterTask

// ============================================================================
// DOCUMENTS
// ============================================================================

export type Document = {
  id: string
  tenant_id: string
  document_type: 'home_report' | 'financial_questionnaire' | 'offer_letter' | 'id_document' | 'bank_statement' | 'mortgage_in_principle' | 'survey' | 'contract' | 'searches' | 'title_deed' | 'other'
  title: string
  description: string | null
  matter_id: string | null
  client_id: string | null
  property_id: string | null
  storage_path: string
  file_name: string
  file_size: number | null
  mime_type: string | null
  version: number
  previous_version_id: string | null
  is_latest_version: boolean
  status: 'uploaded' | 'verified' | 'rejected' | 'archived'
  verified_at: string | null
  verified_by: string | null
  tags: string[] | null
  metadata: any
  created_at: string
  updated_at: string
  uploaded_by: string | null
  deleted_at: string | null
}

export type DocumentInsert = Omit<Document, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type DocumentUpdate = Partial<Omit<Document, 'id' | 'tenant_id' | 'created_at'>>

// ============================================================================
// OFFERS
// ============================================================================

export type Offer = {
  id: string
  tenant_id: string
  matter_id: string
  offer_number: string
  offer_type: 'verbal' | 'written'
  offer_amount: number
  offer_status: 'draft' | 'pending_solicitor' | 'pending_negotiator' | 'pending_client' | 'submitted' | 'accepted' | 'rejected' | 'withdrawn'
  closing_date: string | null
  entry_date: string | null
  conditions: string | null
  survey_required: boolean | null
  drafted_by: string | null
  drafted_at: string | null
  solicitor_approved_by: string | null
  solicitor_approved_at: string | null
  negotiator_approved_by: string | null
  negotiator_approved_at: string | null
  client_accepted_at: string | null
  client_acceptance_ip: string | null
  submitted_to_agent_at: string | null
  submitted_by: string | null
  agent_response: 'accepted' | 'rejected' | 'counter_offer' | null
  agent_response_date: string | null
  agent_notes: string | null
  rejection_reason: string | null
  counter_offer_amount: number | null
  document_id: string | null
  notes: string | null
  metadata: any
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type OfferInsert = {
  id?: string
  tenant_id: string
  matter_id: string
  offer_number: string
  offer_type: 'verbal' | 'written'
  offer_amount: number
  offer_status?: 'draft' | 'pending_solicitor' | 'pending_negotiator' | 'pending_client' | 'submitted' | 'accepted' | 'rejected' | 'withdrawn'
  closing_date?: string | null
  entry_date?: string | null
  conditions?: string | null
  survey_required?: boolean | null
  drafted_by?: string | null
  drafted_at?: string | null
  solicitor_approved_by?: string | null
  solicitor_approved_at?: string | null
  negotiator_approved_by?: string | null
  negotiator_approved_at?: string | null
  client_accepted_at?: string | null
  client_acceptance_ip?: string | null
  submitted_to_agent_at?: string | null
  submitted_by?: string | null
  agent_response?: 'accepted' | 'rejected' | 'counter_offer' | null
  agent_response_date?: string | null
  agent_notes?: string | null
  rejection_reason?: string | null
  counter_offer_amount?: number | null
  document_id?: string | null
  notes?: string | null
  metadata?: any
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export type OfferUpdate = Partial<Omit<Offer, 'id' | 'tenant_id' | 'matter_id' | 'created_at'>>

// ============================================================================
// FINANCIAL QUESTIONNAIRES
// ============================================================================

export type FinancialQuestionnaire = {
  id: string
  tenant_id: string
  matter_id: string
  client_id: string
  employment_status: 'employed' | 'self_employed' | 'retired' | 'unemployed' | 'student' | 'other' | null
  employer_name: string | null
  occupation: string | null
  annual_income: number | null
  additional_income_sources: string[] | null
  additional_income_amount: number | null
  savings_amount: number | null
  investments_amount: number | null
  other_assets_description: string | null
  other_assets_value: number | null
  existing_mortgage_balance: number | null
  credit_card_debt: number | null
  loan_debts: number | null
  other_liabilities_description: string | null
  other_liabilities_amount: number | null
  selling_property: boolean
  sale_property_address: string | null
  expected_sale_proceeds: number | null
  sale_status: 'not_started' | 'marketed' | 'under_offer' | 'sold' | null
  mortgage_required: boolean
  mortgage_amount_required: number | null
  mortgage_in_principle: boolean
  mortgage_lender: string | null
  mortgage_broker_name: string | null
  mortgage_broker_contact: string | null
  deposit_source: 'savings' | 'gift' | 'sale_proceeds' | 'inheritance' | 'investment' | 'other' | null
  deposit_amount: number | null
  deposit_available_date: string | null
  owns_other_properties: boolean
  other_properties_count: number
  other_properties_details: string | null
  ads_applicable: boolean
  completed_at: string | null
  completed_by: string | null
  verified_at: string | null
  verified_by: string | null
  metadata: any
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type FinancialQuestionnaireInsert = Omit<FinancialQuestionnaire, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type FinancialQuestionnaireUpdate = Partial<Omit<FinancialQuestionnaire, 'id' | 'tenant_id' | 'matter_id' | 'client_id' | 'created_at'>>

// ============================================================================
// FEE EARNER SETTINGS
// ============================================================================

export type FeeEarnerSettings = {
  id: string
  tenant_id: string
  fee_earner_id: string
  max_concurrent_matters: number
  max_new_matters_per_week: number
  matter_types: string[]
  max_transaction_value: number | null
  min_transaction_value: number | null
  accepts_auto_assignment: boolean
  assignment_priority: number
  working_days: number[]
  working_hours_start: string
  working_hours_end: string
  metadata: any
  created_at: string
  updated_at: string
}

export type FeeEarnerSettingsInsert = Omit<FeeEarnerSettings, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type FeeEarnerSettingsUpdate = Partial<Omit<FeeEarnerSettings, 'id' | 'tenant_id' | 'fee_earner_id' | 'created_at'>>

// ============================================================================
// FEE EARNER AVAILABILITY
// ============================================================================

export type FeeEarnerAvailability = {
  id: string
  tenant_id: string
  fee_earner_id: string
  start_date: string
  end_date: string | null
  availability_type: 'available' | 'holiday' | 'sick' | 'training' | 'blocked' | 'reduced_capacity'
  is_available: boolean
  max_new_matters_per_week: number | null
  current_workload: number | null
  reason: string | null
  notes: string | null
  is_recurring: boolean
  recurrence_pattern: any | null
  created_at: string
  updated_at: string
  created_by: string | null
  deleted_at: string | null
}

export type FeeEarnerAvailabilityInsert = {
  id?: string
  tenant_id: string
  fee_earner_id: string
  start_date: string
  end_date?: string | null
  availability_type: 'available' | 'holiday' | 'sick' | 'training' | 'blocked' | 'reduced_capacity'
  is_available?: boolean
  max_new_matters_per_week?: number | null
  current_workload?: number | null
  reason?: string | null
  notes?: string | null
  is_recurring?: boolean
  recurrence_pattern?: any | null
  created_at?: string
  updated_at?: string
  created_by?: string | null
  deleted_at?: string | null
}

export type FeeEarnerAvailabilityUpdate = Partial<Omit<FeeEarnerAvailability, 'id' | 'tenant_id' | 'fee_earner_id' | 'created_at'>>

// ============================================================================
// MATTER ACTIVITIES
// ============================================================================

export type MatterActivity = {
  id: string
  matter_id: string
  tenant_id: string
  activity_type: string
  title: string
  description: string | null
  actor_id: string | null
  actor_name: string | null
  related_task_id: string | null
  related_document_id: string | null
  related_offer_id: string | null
  changes: any | null
  metadata: any
  created_at: string
}

export type MatterActivityInsert = Omit<MatterActivity, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

// Matter Activities are immutable - no Update type

// ============================================================================
// HELPER TYPES
// ============================================================================

// Workflow stage keys
export type WorkflowStageKey =
  | 'client_entry'
  | 'quote_check'
  | 'client_details'
  | 'financial_questionnaire'
  | 'financial_checks'
  | 'home_report'
  | 'establish_parameters'
  | 'offer_creation'
  | 'offer_approval'
  | 'client_acceptance'
  | 'offer_outcome'
  | 'conveyancing_allocation'

// Matter with related entities
export type MatterWithRelations = Matter & {
  primary_client?: Client | null
  secondary_client?: Client | null
  property?: Database['public']['Tables']['properties']['Row'] | null
  quote?: Database['public']['Tables']['quotes']['Row'] | null
  assigned_fee_earner?: Database['public']['Tables']['profiles']['Row'] | null
  tasks?: MatterTask[]
  documents?: Document[]
  offers?: Offer[]
  activities?: MatterActivity[]
}

// Workload calculation result
export type FeeEarnerWorkload = {
  active_matters: number
  active_matters_count: number // Alias for active_matters for backwards compatibility
  max_concurrent_matters: number
  new_matters_this_week: number
  max_new_matters_per_week: number
  capacity_used: number
  capacity_percentage: number // Alias for capacity_used (which is already a percentage)
  weekly_capacity_used: number
  weekly_capacity_percentage: number // Alias for weekly_capacity_used (which is already a percentage)
  is_available: boolean
  unavailable_reason: string | null
  accepts_auto_assignment: boolean
  assignment_priority: number
  settings_configured: boolean
}

// Affordability calculation result
export type AffordabilityResult = {
  total_income: number
  total_assets: number
  total_liabilities: number
  available_deposit: number
  total_needed: number
  shortfall: number
  affordable: boolean
  warnings: string[]
}

// ============================================================================
// CLIENT PORTAL TOKENS
// ============================================================================

export type ClientPortalToken = {
  id: string
  tenant_id: string
  matter_id: string
  client_id: string
  token: string
  token_hash: string
  expires_at: string
  is_active: boolean
  last_accessed_at: string | null
  access_count: number
  last_ip_address: string | null
  offer_accepted_at: string | null
  offer_acceptance_ip: string | null
  purpose: string
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  deleted_at: string | null
}

export type ClientPortalTokenInsert = Omit<ClientPortalToken, 'id' | 'created_at' | 'updated_at' | 'access_count'> & {
  id?: string
  created_at?: string
  updated_at?: string
  access_count?: number
}

export type ClientPortalTokenUpdate = Partial<Omit<ClientPortalToken, 'id' | 'tenant_id' | 'matter_id' | 'client_id' | 'created_at'>>

// Token validation result
export type TokenValidationResult = {
  isValid: boolean
  matter?: Matter
  client?: Client
  tenant?: Database['public']['Tables']['tenants']['Row']
  token?: ClientPortalToken
  error?: string
}

// Client portal matter view
export type PortalMatterView = Matter & {
  primary_client?: Client | null
  secondary_client?: Client | null
  property?: Database['public']['Tables']['properties']['Row'] | null
  documents?: Document[] // Only client-visible documents
  current_offer?: Offer | null
  workflow_stage?: WorkflowStage | null
  tenant?: Database['public']['Tables']['tenants']['Row']
}
