-- ===============================================================================
-- PURCHASE WORKFLOW MIGRATIONS - CONSOLIDATED
-- ===============================================================================
-- 
-- This file contains all 9 database migrations required for the Purchase Client
-- Workflow (Phase 12) feature.
--
-- INSTRUCTIONS:
-- 1. Go to https://app.supabase.com and select your ConveyPro project
-- 2. Navigate to SQL Editor in the left sidebar
-- 3. Click "New query"
-- 4. Copy and paste this ENTIRE file
-- 5. Click "Run" (or press Ctrl+Enter)
-- 6. Verify "Success" message appears
--
-- This will create the following tables:
-- - matters (purchase transaction cases)
-- - matter_tasks (task management)
-- - matter_activities (activity audit log)
-- - workflow_stages (12-stage workflow)
-- - documents (document storage)
-- - offers (property offers)
-- - financial_questionnaires (client financial info)
-- - fee_earner_settings (capacity management)
-- - fee_earner_availability (calendar availability)
--
-- All migrations use "IF NOT EXISTS" and "ADD COLUMN IF NOT EXISTS" so this
-- script is safe to run multiple times (idempotent).
--
-- Migration files included (in order):
-- 1. 20251120000001_enhance_clients_for_purchase_workflow.sql
-- 2. 20251120000002_create_matters_table.sql
-- 3. 20251120000003_create_workflow_stages.sql
-- 4. 20251120000004_create_matter_tasks.sql
-- 5. 20251120000005_create_documents_table.sql
-- 6. 20251120000006_create_offers_table.sql
-- 7. 20251120000007_create_financial_questionnaires.sql
-- 8. 20251120000008_create_fee_earner_tables.sql
-- 9. 20251120000009_create_matter_activities.sql
--
-- ===============================================================================

-- Enhance clients table for Purchase Client Workflow (Phase 12)
-- Adds additional fields needed for purchase conveyancing matters

-- Add title field
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS title TEXT;

COMMENT ON COLUMN public.clients.title IS 'Title (Mr, Mrs, Ms, Dr, etc.)';

-- Add company name for business clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS company_name TEXT;

COMMENT ON COLUMN public.clients.company_name IS 'Company name for business/corporate clients';

-- Add mobile phone (separate from phone)
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS mobile TEXT;

COMMENT ON COLUMN public.clients.mobile IS 'Mobile phone number';

-- Add preferred contact method
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'email';

COMMENT ON COLUMN public.clients.preferred_contact_method IS 'Preferred contact method: email, phone, mobile';

-- Add date of birth for ID verification
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

COMMENT ON COLUMN public.clients.date_of_birth IS 'Date of birth for ID verification';

-- Add National Insurance number
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS national_insurance_number TEXT;

COMMENT ON COLUMN public.clients.national_insurance_number IS 'National Insurance number (UK)';

-- Add passport number
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS passport_number TEXT;

COMMENT ON COLUMN public.clients.passport_number IS 'Passport number for ID verification';

-- Add updated_by tracking
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN public.clients.updated_by IS 'User who last updated this record';

-- Add check constraint for client_type values
ALTER TABLE public.clients
  DROP CONSTRAINT IF EXISTS clients_client_type_check;

ALTER TABLE public.clients
  ADD CONSTRAINT clients_client_type_check
  CHECK (client_type IS NULL OR client_type IN ('individual', 'couple', 'company', 'estate', 'business'));

-- Add check constraint for preferred_contact_method
ALTER TABLE public.clients
  ADD CONSTRAINT clients_preferred_contact_method_check
  CHECK (preferred_contact_method IN ('email', 'phone', 'mobile'));

-- Add index for company name (for business client searches)
CREATE INDEX IF NOT EXISTS idx_clients_company_name
  ON public.clients(company_name)
  WHERE deleted_at IS NULL AND company_name IS NOT NULL;

-- Add index for date of birth (for age-based segmentation)
CREATE INDEX IF NOT EXISTS idx_clients_date_of_birth
  ON public.clients(date_of_birth)
  WHERE deleted_at IS NULL AND date_of_birth IS NOT NULL;

-- Update table comment
COMMENT ON TABLE public.clients IS 'Client contact information and relationship management (enhanced for Purchase Workflow)';
-- Create matters table for Purchase Client Workflow (Phase 12)
-- Represents purchase transaction cases tracked through 12-stage workflow

CREATE TABLE IF NOT EXISTS public.matters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Matter Identification
  matter_number TEXT NOT NULL UNIQUE,
  matter_type TEXT NOT NULL DEFAULT 'purchase',
  status TEXT NOT NULL DEFAULT 'new',

  -- Relationships
  primary_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  secondary_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,

  -- Workflow Tracking
  current_stage TEXT NOT NULL DEFAULT 'client_entry',
  current_stage_started_at TIMESTAMPTZ DEFAULT NOW(),

  -- Key Dates
  instruction_date DATE DEFAULT CURRENT_DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  closing_date DATE,

  -- Financial Details
  purchase_price DECIMAL(12,2),
  mortgage_amount DECIMAL(12,2),
  deposit_amount DECIMAL(12,2),
  ads_applicable BOOLEAN DEFAULT false,
  first_time_buyer BOOLEAN DEFAULT false,

  -- Selling Side Details
  selling_agent_name TEXT,
  selling_agent_email TEXT,
  selling_agent_phone TEXT,
  seller_solicitor_name TEXT,
  seller_solicitor_firm TEXT,
  seller_solicitor_email TEXT,

  -- Assignment
  assigned_fee_earner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Priority & Notes
  priority TEXT DEFAULT 'normal',
  notes TEXT,
  internal_notes TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit Fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT matters_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
  CONSTRAINT matters_matter_type_check CHECK (matter_type IN ('purchase', 'sale', 'remortgage', 'transfer_of_equity')),
  CONSTRAINT matters_status_check CHECK (status IN ('new', 'active', 'on_hold', 'completed', 'cancelled')),
  CONSTRAINT matters_current_stage_check CHECK (current_stage IN (
    'client_entry', 'quote_check', 'client_details', 'financial_questionnaire',
    'financial_checks', 'home_report', 'establish_parameters', 'offer_creation',
    'offer_approval', 'client_acceptance', 'offer_outcome', 'conveyancing_allocation'
  )),
  CONSTRAINT matters_priority_check CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Indexes for performance
CREATE INDEX idx_matters_tenant_id
  ON public.matters(tenant_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_matters_matter_number
  ON public.matters(matter_number)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_matters_status
  ON public.matters(tenant_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_matters_current_stage
  ON public.matters(current_stage)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_matters_assigned_fee_earner
  ON public.matters(assigned_fee_earner_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_matters_closing_date
  ON public.matters(closing_date)
  WHERE deleted_at IS NULL AND closing_date IS NOT NULL;

CREATE INDEX idx_matters_primary_client
  ON public.matters(primary_client_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_matters_property
  ON public.matters(property_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_matters_quote
  ON public.matters(quote_id)
  WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE public.matters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Matters are viewable by tenant members"
  ON public.matters
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Matters are insertable by tenant members"
  ON public.matters
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'member')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Matters are updatable by tenant members"
  ON public.matters
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'member')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Matters are deletable by tenant managers"
  ON public.matters
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_matters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_matters_updated_at_trigger
  BEFORE UPDATE ON public.matters
  FOR EACH ROW
  EXECUTE FUNCTION update_matters_updated_at();

-- Function to generate matter number
CREATE OR REPLACE FUNCTION generate_matter_number(p_tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_next_number INTEGER;
  v_matter_number TEXT;
BEGIN
  -- Get last 2 digits of year
  v_year := TO_CHAR(CURRENT_DATE, 'YY');

  -- Get the highest matter number for this tenant this year
  SELECT COALESCE(
    MAX(
      CAST(
        SPLIT_PART(matter_number, '-', 1)
        AS INTEGER
      )
    ),
    0
  ) + 1
  INTO v_next_number
  FROM public.matters
  WHERE tenant_id = p_tenant_id
  AND matter_number LIKE 'M%' || v_year
  AND deleted_at IS NULL;

  -- Format: M00001-25
  v_matter_number := 'M' || LPAD(v_next_number::TEXT, 5, '0') || '-' || v_year;

  RETURN v_matter_number;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE public.matters IS 'Purchase transaction cases tracked through 12-stage workflow';
COMMENT ON COLUMN public.matters.matter_number IS 'Auto-generated matter reference (e.g., M00001-25)';
COMMENT ON COLUMN public.matters.current_stage IS 'Current workflow stage (12 stages total)';
COMMENT ON COLUMN public.matters.ads_applicable IS 'Additional Dwelling Supplement applicable (Scottish tax)';
COMMENT ON COLUMN public.matters.closing_date IS 'Closing date for competitive property offers (Scottish practice)';
COMMENT ON COLUMN public.matters.internal_notes IS 'Staff-only notes (not visible to clients)';
-- Create workflow_stages table for Purchase Client Workflow (Phase 12)
-- Defines the 12-stage purchase workflow and supports tenant customization

CREATE TABLE IF NOT EXISTS public.workflow_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Stage Definition
  stage_key TEXT NOT NULL,
  stage_name TEXT NOT NULL,
  stage_description TEXT,
  stage_order INTEGER NOT NULL,
  matter_type TEXT NOT NULL DEFAULT 'purchase',

  -- Automation Settings
  auto_transition_conditions JSONB,
  required_task_keys TEXT[],

  -- Notification Settings
  entry_notification_template TEXT,
  exit_notification_template TEXT,
  reminder_days_before_due INTEGER[],

  -- UI Customization
  is_active BOOLEAN DEFAULT true,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT workflow_stages_matter_type_check CHECK (matter_type IN ('purchase', 'sale', 'remortgage', 'transfer_of_equity'))
);

-- Unique constraint: One stage_key per tenant per matter_type (NULL tenant_id for global defaults)
CREATE UNIQUE INDEX idx_workflow_stages_unique_key
  ON public.workflow_stages(COALESCE(tenant_id, '00000000-0000-0000-0000-000000000000'::UUID), stage_key, matter_type);

-- Index for lookups
CREATE INDEX idx_workflow_stages_tenant
  ON public.workflow_stages(tenant_id, matter_type, stage_order);

-- Enable RLS
ALTER TABLE public.workflow_stages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Workflow stages are viewable by all authenticated users"
  ON public.workflow_stages
  FOR SELECT
  USING (
    -- Global stages (tenant_id IS NULL) visible to all
    tenant_id IS NULL
    OR
    -- Tenant-specific stages visible to tenant members
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Workflow stages are manageable by tenant admins"
  ON public.workflow_stages
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

-- Insert global default workflow stages for purchase matters
INSERT INTO public.workflow_stages (
  tenant_id,
  stage_key,
  stage_name,
  stage_description,
  stage_order,
  matter_type,
  required_task_keys,
  color,
  icon
) VALUES
  -- Stage 1: Client Entry
  (
    NULL,
    'client_entry',
    'Client Entry',
    'New purchase client enters system, create client and matter records',
    1,
    'purchase',
    ARRAY['create_client_record', 'create_matter_record'],
    '#10b981',
    'UserPlus'
  ),

  -- Stage 2: Quote Check
  (
    NULL,
    'quote_check',
    'Quote Check',
    'Verify client has received a quote or create one',
    2,
    'purchase',
    ARRAY['check_quote_exists'],
    '#3b82f6',
    'FileText'
  ),

  -- Stage 3: Client & Property Details
  (
    NULL,
    'client_details',
    'Client & Property Details',
    'Collect selling agent details and property address',
    3,
    'purchase',
    ARRAY['add_selling_agent', 'obtain_property_address'],
    '#6366f1',
    'Home'
  ),

  -- Stage 4: Financial Questionnaire
  (
    NULL,
    'financial_questionnaire',
    'Financial Assessment',
    'Client completes financial questionnaire',
    4,
    'purchase',
    ARRAY['complete_financial_questionnaire'],
    '#8b5cf6',
    'Calculator'
  ),

  -- Stage 5: Financial Checks
  (
    NULL,
    'financial_checks',
    'Financial Verification',
    'Verify affordability and check ADS liability',
    5,
    'purchase',
    ARRAY['verify_affordability', 'check_ads_liability'],
    '#ec4899',
    'Shield'
  ),

  -- Stage 6: Home Report
  (
    NULL,
    'home_report',
    'Home Report Review',
    'Download and review home report from selling agent',
    6,
    'purchase',
    ARRAY['download_home_report', 'review_home_report', 'save_home_report'],
    '#f59e0b',
    'FileCheck'
  ),

  -- Stage 7: Establish Parameters
  (
    NULL,
    'establish_parameters',
    'Financial Parameters',
    'Establish client financial limits and closing date',
    7,
    'purchase',
    ARRAY['establish_financial_parameters'],
    '#eab308',
    'Settings'
  ),

  -- Stage 8: Offer Creation
  (
    NULL,
    'offer_creation',
    'Offer Preparation',
    'Agree offer price and create written offer',
    8,
    'purchase',
    ARRAY['agree_offer_price', 'create_written_offer'],
    '#14b8a6',
    'PenTool'
  ),

  -- Stage 9: Offer Approval
  (
    NULL,
    'offer_approval',
    'Offer Approvals',
    'Solicitor and negotiator approve offer for submission',
    9,
    'purchase',
    ARRAY['solicitor_signature', 'negotiator_approval'],
    '#06b6d4',
    'CheckCircle'
  ),

  -- Stage 10: Client Acceptance
  (
    NULL,
    'client_acceptance',
    'Client Acceptance',
    'Client reviews and accepts offer summary',
    10,
    'purchase',
    ARRAY['client_click_to_accept'],
    '#0ea5e9',
    'UserCheck'
  ),

  -- Stage 11: Offer Outcome
  (
    NULL,
    'offer_outcome',
    'Offer Outcome',
    'Submit offer to agent and track outcome',
    11,
    'purchase',
    ARRAY['submit_offer_to_agent', 'log_agent_response'],
    '#3b82f6',
    'Target'
  ),

  -- Stage 12: Conveyancing Allocation
  (
    NULL,
    'conveyancing_allocation',
    'Conveyancer Assignment',
    'Allocate to conveyancer and send documentation',
    12,
    'purchase',
    ARRAY['allocate_conveyancer', 'send_documents_to_conveyancer', 'notify_client'],
    '#10b981',
    'UserCog'
  );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_workflow_stages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_workflow_stages_updated_at_trigger
  BEFORE UPDATE ON public.workflow_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_stages_updated_at();

-- Comments
COMMENT ON TABLE public.workflow_stages IS '12-stage purchase workflow definition with tenant customization support';
COMMENT ON COLUMN public.workflow_stages.tenant_id IS 'NULL = global default stages, UUID = tenant-specific customization';
COMMENT ON COLUMN public.workflow_stages.stage_key IS 'Unique identifier for stage (e.g., client_entry)';
COMMENT ON COLUMN public.workflow_stages.required_task_keys IS 'Task keys that must be completed before stage progression';
COMMENT ON COLUMN public.workflow_stages.auto_transition_conditions IS 'JSONB conditions for automatic stage transition';
-- Create matter_tasks table for Purchase Client Workflow (Phase 12)
-- Checklist tasks for each matter, auto-generated per workflow stage

CREATE TABLE IF NOT EXISTS public.matter_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Task Definition
  task_key TEXT,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT DEFAULT 'manual',

  -- Workflow Context
  stage TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Scheduling
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Dependencies
  depends_on_task_ids UUID[],
  blocks_stage_progression BOOLEAN DEFAULT false,

  -- Reminders
  reminder_sent_at TIMESTAMPTZ,
  reminder_days_before INTEGER DEFAULT 3,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT matter_tasks_task_type_check CHECK (task_type IN ('manual', 'automated', 'approval')),
  CONSTRAINT matter_tasks_status_check CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'cancelled')),
  CONSTRAINT matter_tasks_priority_check CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  CONSTRAINT matter_tasks_stage_check CHECK (stage IN (
    'client_entry', 'quote_check', 'client_details', 'financial_questionnaire',
    'financial_checks', 'home_report', 'establish_parameters', 'offer_creation',
    'offer_approval', 'client_acceptance', 'offer_outcome', 'conveyancing_allocation'
  ))
);

-- Indexes
CREATE INDEX idx_matter_tasks_matter
  ON public.matter_tasks(matter_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_matter_tasks_tenant
  ON public.matter_tasks(tenant_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_matter_tasks_assigned
  ON public.matter_tasks(assigned_to, status)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_matter_tasks_due_date
  ON public.matter_tasks(due_date)
  WHERE deleted_at IS NULL AND status != 'completed';

CREATE INDEX idx_matter_tasks_stage
  ON public.matter_tasks(matter_id, stage)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_matter_tasks_status
  ON public.matter_tasks(status)
  WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE public.matter_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Matter tasks are viewable by tenant members"
  ON public.matter_tasks
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Matter tasks are insertable by tenant members"
  ON public.matter_tasks
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'member')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Matter tasks are updatable by tenant members"
  ON public.matter_tasks
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'member')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Matter tasks are deletable by tenant managers"
  ON public.matter_tasks
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_matter_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_matter_tasks_updated_at_trigger
  BEFORE UPDATE ON public.matter_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_matter_tasks_updated_at();

-- Function to auto-generate tasks when matter enters a new stage
CREATE OR REPLACE FUNCTION auto_generate_stage_tasks()
RETURNS TRIGGER AS $$
DECLARE
  v_stage_config RECORD;
  v_task_key TEXT;
BEGIN
  -- Get workflow stage configuration
  SELECT * INTO v_stage_config
  FROM public.workflow_stages
  WHERE stage_key = NEW.current_stage
  AND (tenant_id IS NULL OR tenant_id = NEW.tenant_id)
  ORDER BY tenant_id DESC NULLS LAST
  LIMIT 1;

  -- If stage has required tasks, create them
  IF v_stage_config.required_task_keys IS NOT NULL THEN
    FOREACH v_task_key IN ARRAY v_stage_config.required_task_keys
    LOOP
      -- Check if task already exists
      IF NOT EXISTS (
        SELECT 1 FROM public.matter_tasks
        WHERE matter_id = NEW.id
        AND task_key = v_task_key
        AND deleted_at IS NULL
      ) THEN
        -- Create task
        INSERT INTO public.matter_tasks (
          matter_id,
          tenant_id,
          task_key,
          title,
          stage,
          status,
          blocks_stage_progression
        ) VALUES (
          NEW.id,
          NEW.tenant_id,
          v_task_key,
          REPLACE(INITCAP(REPLACE(v_task_key, '_', ' ')), ' ', ' '), -- Convert task_key to title
          NEW.current_stage,
          'pending',
          true -- Stage tasks block progression by default
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate tasks on matter creation or stage change
CREATE TRIGGER auto_generate_stage_tasks_trigger
  AFTER INSERT OR UPDATE OF current_stage ON public.matters
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NULL)
  EXECUTE FUNCTION auto_generate_stage_tasks();

-- Comments
COMMENT ON TABLE public.matter_tasks IS 'Checklist tasks for matters, auto-generated per workflow stage';
COMMENT ON COLUMN public.matter_tasks.task_key IS 'Unique key linking to workflow stage required tasks';
COMMENT ON COLUMN public.matter_tasks.blocks_stage_progression IS 'If true, task must be completed before progressing to next stage';
COMMENT ON COLUMN public.matter_tasks.depends_on_task_ids IS 'Array of task IDs that must be completed first';
COMMENT ON COLUMN public.matter_tasks.reminder_days_before IS 'Send reminder N days before due_date';
-- Create documents table for Purchase Client Workflow (Phase 12)
-- Document storage metadata with Supabase Storage integration

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Document Identity
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Relationships
  matter_id UUID REFERENCES public.matters(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,

  -- Storage Details
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,

  -- Versioning
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  is_latest_version BOOLEAN DEFAULT true,

  -- Status & Verification
  status TEXT DEFAULT 'uploaded',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Categorization
  tags TEXT[],

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT documents_document_type_check CHECK (document_type IN (
    'home_report',
    'financial_questionnaire',
    'offer_letter',
    'id_document',
    'bank_statement',
    'mortgage_in_principle',
    'survey',
    'contract',
    'searches',
    'title_deed',
    'other'
  )),
  CONSTRAINT documents_status_check CHECK (status IN ('uploaded', 'verified', 'rejected', 'archived'))
);

-- Indexes
CREATE INDEX idx_documents_matter
  ON public.documents(matter_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_documents_client
  ON public.documents(client_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_documents_property
  ON public.documents(property_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_documents_tenant
  ON public.documents(tenant_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_documents_type
  ON public.documents(tenant_id, document_type)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_documents_latest
  ON public.documents(matter_id, document_type, is_latest_version)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_documents_uploaded_by
  ON public.documents(uploaded_by)
  WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Documents are viewable by tenant members"
  ON public.documents
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Documents are insertable by tenant members"
  ON public.documents
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'member')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Documents are updatable by tenant members"
  ON public.documents
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'member')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Documents are deletable by tenant managers"
  ON public.documents
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_documents_updated_at_trigger
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();

-- Function to manage document versioning
CREATE OR REPLACE FUNCTION manage_document_versioning()
RETURNS TRIGGER AS $$
BEGIN
  -- If uploading a new version of an existing document
  IF NEW.previous_version_id IS NOT NULL THEN
    -- Mark previous version as no longer latest
    UPDATE public.documents
    SET is_latest_version = false
    WHERE id = NEW.previous_version_id;

    -- Increment version number
    SELECT version + 1 INTO NEW.version
    FROM public.documents
    WHERE id = NEW.previous_version_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for versioning
CREATE TRIGGER manage_document_versioning_trigger
  BEFORE INSERT ON public.documents
  FOR EACH ROW
  WHEN (NEW.previous_version_id IS NOT NULL)
  EXECUTE FUNCTION manage_document_versioning();

-- Create Supabase Storage bucket for matter documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'matter-documents',
  'matter-documents',
  false, -- Private bucket
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for matter-documents bucket
CREATE POLICY "Matter documents are viewable by tenant members"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'matter-documents'
    AND (storage.foldername(name))[1] IN (
      SELECT t.id::TEXT
      FROM public.tenants t
      INNER JOIN public.tenant_memberships tm ON t.id = tm.tenant_id
      WHERE tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.deleted_at IS NULL
    )
  );

CREATE POLICY "Matter documents are uploadable by tenant members"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'matter-documents'
    AND (storage.foldername(name))[1] IN (
      SELECT t.id::TEXT
      FROM public.tenants t
      INNER JOIN public.tenant_memberships tm ON t.id = tm.tenant_id
      WHERE tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin', 'manager', 'member')
      AND tm.status = 'active'
      AND tm.deleted_at IS NULL
    )
  );

CREATE POLICY "Matter documents are updatable by tenant members"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'matter-documents'
    AND (storage.foldername(name))[1] IN (
      SELECT t.id::TEXT
      FROM public.tenants t
      INNER JOIN public.tenant_memberships tm ON t.id = tm.tenant_id
      WHERE tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin', 'manager', 'member')
      AND tm.status = 'active'
      AND tm.deleted_at IS NULL
    )
  );

CREATE POLICY "Matter documents are deletable by tenant managers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'matter-documents'
    AND (storage.foldername(name))[1] IN (
      SELECT t.id::TEXT
      FROM public.tenants t
      INNER JOIN public.tenant_memberships tm ON t.id = tm.tenant_id
      WHERE tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin', 'manager')
      AND tm.status = 'active'
      AND tm.deleted_at IS NULL
    )
  );

-- Comments
COMMENT ON TABLE public.documents IS 'Document storage metadata with Supabase Storage integration';
COMMENT ON COLUMN public.documents.storage_path IS 'Path in Supabase Storage bucket (format: tenant_id/matter_id/filename)';
COMMENT ON COLUMN public.documents.version IS 'Document version number (auto-incremented)';
COMMENT ON COLUMN public.documents.is_latest_version IS 'True if this is the latest version of the document';
COMMENT ON COLUMN public.documents.document_type IS 'Category of document for filtering and workflows';
-- Create offers table for Purchase Client Workflow (Phase 12)
-- Tracks verbal and written offers with approval workflow

CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  matter_id UUID NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,

  -- Offer Identity
  offer_number TEXT NOT NULL,
  offer_type TEXT NOT NULL DEFAULT 'written',
  offer_amount DECIMAL(12,2) NOT NULL,
  offer_status TEXT NOT NULL DEFAULT 'draft',

  -- Offer Conditions
  closing_date DATE,
  entry_date DATE,
  conditions TEXT,
  survey_required BOOLEAN DEFAULT true,

  -- Approval Workflow
  drafted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  drafted_at TIMESTAMPTZ DEFAULT NOW(),

  solicitor_approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  solicitor_approved_at TIMESTAMPTZ,

  negotiator_approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  negotiator_approved_at TIMESTAMPTZ,

  client_accepted_at TIMESTAMPTZ,
  client_acceptance_ip TEXT,

  submitted_to_agent_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Outcome
  agent_response TEXT,
  agent_response_date DATE,
  agent_notes TEXT,

  rejection_reason TEXT,
  counter_offer_amount DECIMAL(12,2),

  -- Document Link
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,

  -- Notes
  notes TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT offers_offer_type_check CHECK (offer_type IN ('verbal', 'written')),
  CONSTRAINT offers_offer_status_check CHECK (offer_status IN (
    'draft',
    'pending_solicitor',
    'pending_negotiator',
    'pending_client',
    'submitted',
    'accepted',
    'rejected',
    'withdrawn'
  )),
  CONSTRAINT offers_agent_response_check CHECK (agent_response IS NULL OR agent_response IN (
    'accepted',
    'rejected',
    'counter_offer'
  ))
);

-- Indexes
CREATE INDEX idx_offers_matter
  ON public.offers(matter_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_offers_tenant
  ON public.offers(tenant_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_offers_status
  ON public.offers(tenant_id, offer_status)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_offers_offer_number
  ON public.offers(offer_number)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_offers_submitted_by
  ON public.offers(submitted_by)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_offers_agent_response
  ON public.offers(agent_response, agent_response_date)
  WHERE deleted_at IS NULL AND agent_response IS NOT NULL;

-- Enable RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Offers are viewable by tenant members"
  ON public.offers
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Offers are insertable by tenant members"
  ON public.offers
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'member')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Offers are updatable by tenant members"
  ON public.offers
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'member')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Offers are deletable by tenant managers"
  ON public.offers
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_offers_updated_at_trigger
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION update_offers_updated_at();

-- Function to generate offer number
CREATE OR REPLACE FUNCTION generate_offer_number(p_tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_next_number INTEGER;
  v_offer_number TEXT;
BEGIN
  -- Get last 2 digits of year
  v_year := TO_CHAR(CURRENT_DATE, 'YY');

  -- Get the highest offer number for this tenant this year
  SELECT COALESCE(
    MAX(
      CAST(
        REGEXP_REPLACE(
          SPLIT_PART(offer_number, '-', 1),
          '[^0-9]',
          '',
          'g'
        ) AS INTEGER
      )
    ),
    0
  ) + 1
  INTO v_next_number
  FROM public.offers
  WHERE tenant_id = p_tenant_id
  AND offer_number LIKE 'OFF%' || v_year
  AND deleted_at IS NULL;

  -- Format: OFF00001-25
  v_offer_number := 'OFF' || LPAD(v_next_number::TEXT, 5, '0') || '-' || v_year;

  RETURN v_offer_number;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update offer status based on approvals
CREATE OR REPLACE FUNCTION auto_update_offer_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If solicitor just approved, move to pending negotiator
  IF NEW.solicitor_approved_at IS NOT NULL
     AND OLD.solicitor_approved_at IS NULL
     AND NEW.offer_status = 'pending_solicitor' THEN
    NEW.offer_status := 'pending_negotiator';
  END IF;

  -- If negotiator just approved, move to pending client
  IF NEW.negotiator_approved_at IS NOT NULL
     AND OLD.negotiator_approved_at IS NULL
     AND NEW.offer_status = 'pending_negotiator' THEN
    NEW.offer_status := 'pending_client';
  END IF;

  -- If client just accepted, keep as pending_client until submitted
  -- (Client acceptance doesn't auto-transition, requires explicit submission)

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto status updates
CREATE TRIGGER auto_update_offer_status_trigger
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  WHEN (
    NEW.solicitor_approved_at IS DISTINCT FROM OLD.solicitor_approved_at
    OR NEW.negotiator_approved_at IS DISTINCT FROM OLD.negotiator_approved_at
  )
  EXECUTE FUNCTION auto_update_offer_status();

-- Comments
COMMENT ON TABLE public.offers IS 'Verbal and written offers with multi-step approval workflow';
COMMENT ON COLUMN public.offers.offer_number IS 'Auto-generated offer reference (e.g., OFF00001-25)';
COMMENT ON COLUMN public.offers.offer_type IS 'verbal or written offer';
COMMENT ON COLUMN public.offers.offer_status IS 'Tracks progression through approval workflow';
COMMENT ON COLUMN public.offers.client_acceptance_ip IS 'IP address where client clicked to accept (audit trail)';
COMMENT ON COLUMN public.offers.agent_response IS 'Selling agent response: accepted, rejected, or counter_offer';
COMMENT ON COLUMN public.offers.survey_required IS 'Whether survey/inspection is required as condition';
-- Create financial_questionnaires table for Purchase Client Workflow (Phase 12)
-- Comprehensive financial assessment for purchase affordability

CREATE TABLE IF NOT EXISTS public.financial_questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  matter_id UUID NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

  -- Employment Details
  employment_status TEXT,
  employer_name TEXT,
  occupation TEXT,
  annual_income DECIMAL(12,2),

  -- Additional Income
  additional_income_sources TEXT[],
  additional_income_amount DECIMAL(12,2),

  -- Savings & Assets
  savings_amount DECIMAL(12,2),
  investments_amount DECIMAL(12,2),
  other_assets_description TEXT,
  other_assets_value DECIMAL(12,2),

  -- Liabilities
  existing_mortgage_balance DECIMAL(12,2),
  credit_card_debt DECIMAL(12,2),
  loan_debts DECIMAL(12,2),
  other_liabilities_description TEXT,
  other_liabilities_amount DECIMAL(12,2),

  -- Property Sale (if applicable)
  selling_property BOOLEAN DEFAULT false,
  sale_property_address TEXT,
  expected_sale_proceeds DECIMAL(12,2),
  sale_status TEXT,

  -- Mortgage Details
  mortgage_required BOOLEAN DEFAULT true,
  mortgage_amount_required DECIMAL(12,2),
  mortgage_in_principle BOOLEAN DEFAULT false,
  mortgage_lender TEXT,
  mortgage_broker_name TEXT,
  mortgage_broker_contact TEXT,

  -- Deposit
  deposit_source TEXT,
  deposit_amount DECIMAL(12,2),
  deposit_available_date DATE,

  -- ADS Check
  owns_other_properties BOOLEAN DEFAULT false,
  other_properties_count INTEGER DEFAULT 0,
  other_properties_details TEXT,
  ads_applicable BOOLEAN DEFAULT false,

  -- Completion Status
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT financial_questionnaires_employment_status_check CHECK (
    employment_status IS NULL OR employment_status IN (
      'employed',
      'self_employed',
      'retired',
      'unemployed',
      'student',
      'other'
    )
  ),
  CONSTRAINT financial_questionnaires_sale_status_check CHECK (
    sale_status IS NULL OR sale_status IN (
      'not_started',
      'marketed',
      'under_offer',
      'sold'
    )
  ),
  CONSTRAINT financial_questionnaires_deposit_source_check CHECK (
    deposit_source IS NULL OR deposit_source IN (
      'savings',
      'gift',
      'sale_proceeds',
      'inheritance',
      'investment',
      'other'
    )
  )
);

-- Indexes
CREATE INDEX idx_financial_questionnaires_matter
  ON public.financial_questionnaires(matter_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_financial_questionnaires_client
  ON public.financial_questionnaires(client_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_financial_questionnaires_tenant
  ON public.financial_questionnaires(tenant_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_financial_questionnaires_completed
  ON public.financial_questionnaires(completed_at)
  WHERE deleted_at IS NULL AND completed_at IS NOT NULL;

CREATE INDEX idx_financial_questionnaires_ads
  ON public.financial_questionnaires(ads_applicable)
  WHERE deleted_at IS NULL AND ads_applicable = true;

-- Enable RLS
ALTER TABLE public.financial_questionnaires ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Financial questionnaires are viewable by tenant members"
  ON public.financial_questionnaires
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Financial questionnaires are insertable by tenant members"
  ON public.financial_questionnaires
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'member')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Financial questionnaires are updatable by tenant members"
  ON public.financial_questionnaires
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'member')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Financial questionnaires are deletable by tenant managers"
  ON public.financial_questionnaires
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_financial_questionnaires_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_financial_questionnaires_updated_at_trigger
  BEFORE UPDATE ON public.financial_questionnaires
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_questionnaires_updated_at();

-- Function to calculate affordability
CREATE OR REPLACE FUNCTION calculate_affordability(questionnaire_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_questionnaire RECORD;
  v_matter RECORD;
  v_total_income DECIMAL(12,2);
  v_total_assets DECIMAL(12,2);
  v_total_liabilities DECIMAL(12,2);
  v_total_deposit DECIMAL(12,2);
  v_total_needed DECIMAL(12,2);
  v_shortfall DECIMAL(12,2);
  v_affordable BOOLEAN;
  v_result JSONB;
BEGIN
  -- Get questionnaire
  SELECT * INTO v_questionnaire
  FROM public.financial_questionnaires
  WHERE id = questionnaire_id;

  -- Get matter
  SELECT * INTO v_matter
  FROM public.matters
  WHERE id = v_questionnaire.matter_id;

  -- Calculate total income
  v_total_income := COALESCE(v_questionnaire.annual_income, 0) + COALESCE(v_questionnaire.additional_income_amount, 0);

  -- Calculate total assets
  v_total_assets := COALESCE(v_questionnaire.savings_amount, 0)
                  + COALESCE(v_questionnaire.investments_amount, 0)
                  + COALESCE(v_questionnaire.other_assets_value, 0)
                  + COALESCE(v_questionnaire.expected_sale_proceeds, 0);

  -- Calculate total liabilities
  v_total_liabilities := COALESCE(v_questionnaire.existing_mortgage_balance, 0)
                       + COALESCE(v_questionnaire.credit_card_debt, 0)
                       + COALESCE(v_questionnaire.loan_debts, 0)
                       + COALESCE(v_questionnaire.other_liabilities_amount, 0);

  -- Calculate available deposit
  v_total_deposit := COALESCE(v_questionnaire.deposit_amount, 0);

  -- Calculate total needed (purchase price + estimated fees - mortgage)
  v_total_needed := COALESCE(v_matter.purchase_price, 0)
                  + (COALESCE(v_matter.purchase_price, 0) * 0.05) -- Estimate 5% for fees/LBTT
                  - COALESCE(v_questionnaire.mortgage_amount_required, 0);

  -- Calculate shortfall
  v_shortfall := v_total_needed - v_total_deposit;

  -- Determine if affordable
  v_affordable := v_shortfall <= 0;

  -- Build result
  v_result := jsonb_build_object(
    'total_income', v_total_income,
    'total_assets', v_total_assets,
    'total_liabilities', v_total_liabilities,
    'available_deposit', v_total_deposit,
    'total_needed', v_total_needed,
    'shortfall', v_shortfall,
    'affordable', v_affordable,
    'warnings', ARRAY[]::TEXT[]
  );

  -- Add warnings
  IF v_shortfall > 0 THEN
    v_result := jsonb_set(
      v_result,
      '{warnings}',
      v_result->'warnings' || jsonb_build_array('Insufficient funds: shortfall of £' || v_shortfall::TEXT)
    );
  END IF;

  IF v_questionnaire.ads_applicable THEN
    v_result := jsonb_set(
      v_result,
      '{warnings}',
      v_result->'warnings' || jsonb_build_array('Additional Dwelling Supplement (8%) applies')
    );
  END IF;

  IF NOT v_questionnaire.mortgage_in_principle AND v_questionnaire.mortgage_required THEN
    v_result := jsonb_set(
      v_result,
      '{warnings}',
      v_result->'warnings' || jsonb_build_array('Mortgage in Principle not yet obtained')
    );
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE public.financial_questionnaires IS 'Comprehensive financial assessment for purchase affordability';
COMMENT ON COLUMN public.financial_questionnaires.ads_applicable IS 'Additional Dwelling Supplement applicable (Scottish tax on additional properties)';
COMMENT ON COLUMN public.financial_questionnaires.owns_other_properties IS 'Used to determine ADS liability';
COMMENT ON COLUMN public.financial_questionnaires.deposit_source IS 'Source of deposit funds (for AML compliance)';
COMMENT ON COLUMN public.financial_questionnaires.mortgage_in_principle IS 'Whether client has mortgage in principle approval';
-- Create fee earner tables for Purchase Client Workflow (Phase 12)
-- Manages fee earner availability and workload allocation

-- Table: fee_earner_settings
CREATE TABLE IF NOT EXISTS public.fee_earner_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  fee_earner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Capacity Limits
  max_concurrent_matters INTEGER DEFAULT 20,
  max_new_matters_per_week INTEGER DEFAULT 3,

  -- Specialization
  matter_types TEXT[] DEFAULT ARRAY['purchase', 'sale', 'remortgage'],
  max_transaction_value DECIMAL(12,2),
  min_transaction_value DECIMAL(12,2),

  -- Auto-assignment
  accepts_auto_assignment BOOLEAN DEFAULT true,
  assignment_priority INTEGER DEFAULT 100,

  -- Working Hours
  working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
  working_hours_start TIME DEFAULT '09:00',
  working_hours_end TIME DEFAULT '17:00',

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT fee_earner_settings_unique UNIQUE (tenant_id, fee_earner_id),
  CONSTRAINT fee_earner_settings_max_concurrent_check CHECK (max_concurrent_matters > 0),
  CONSTRAINT fee_earner_settings_max_weekly_check CHECK (max_new_matters_per_week > 0),
  CONSTRAINT fee_earner_settings_priority_check CHECK (assignment_priority BETWEEN 1 AND 1000),
  CONSTRAINT fee_earner_settings_working_days_check CHECK (
    working_days IS NOT NULL AND array_length(working_days, 1) > 0
  )
);

-- Indexes for fee_earner_settings
CREATE INDEX idx_fee_earner_settings_tenant
  ON public.fee_earner_settings(tenant_id);

CREATE INDEX idx_fee_earner_settings_fee_earner
  ON public.fee_earner_settings(fee_earner_id);

CREATE INDEX idx_fee_earner_settings_auto_assignment
  ON public.fee_earner_settings(tenant_id, accepts_auto_assignment, assignment_priority)
  WHERE accepts_auto_assignment = true;

-- Table: fee_earner_availability
CREATE TABLE IF NOT EXISTS public.fee_earner_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  fee_earner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Date Range
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Availability
  availability_type TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,

  -- Capacity Override (for available periods)
  max_new_matters_per_week INTEGER,
  current_workload INTEGER DEFAULT 0,

  -- Details
  reason TEXT,
  notes TEXT,

  -- Recurrence (future enhancement)
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT fee_earner_availability_dates_check CHECK (end_date >= start_date),
  CONSTRAINT fee_earner_availability_type_check CHECK (
    availability_type IN ('available', 'holiday', 'sick', 'training', 'blocked', 'reduced_capacity')
  )
);

-- Indexes for fee_earner_availability
CREATE INDEX idx_fee_earner_availability_fee_earner
  ON public.fee_earner_availability(fee_earner_id, start_date, end_date)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_fee_earner_availability_dates
  ON public.fee_earner_availability(tenant_id, start_date, end_date)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_fee_earner_availability_available
  ON public.fee_earner_availability(fee_earner_id, is_available)
  WHERE deleted_at IS NULL AND is_available = true;

-- Enable RLS on fee_earner_settings
ALTER TABLE public.fee_earner_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fee_earner_settings
CREATE POLICY "Fee earner settings are viewable by tenant members"
  ON public.fee_earner_settings
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Fee earner settings are manageable by tenant admins"
  ON public.fee_earner_settings
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

-- Enable RLS on fee_earner_availability
ALTER TABLE public.fee_earner_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fee_earner_availability
CREATE POLICY "Fee earner availability is viewable by tenant members"
  ON public.fee_earner_availability
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Fee earner availability is manageable by tenant managers"
  ON public.fee_earner_availability
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

-- Function to update updated_at for fee_earner_settings
CREATE OR REPLACE FUNCTION update_fee_earner_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for fee_earner_settings updated_at
CREATE TRIGGER update_fee_earner_settings_updated_at_trigger
  BEFORE UPDATE ON public.fee_earner_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_fee_earner_settings_updated_at();

-- Function to update updated_at for fee_earner_availability
CREATE OR REPLACE FUNCTION update_fee_earner_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for fee_earner_availability updated_at
CREATE TRIGGER update_fee_earner_availability_updated_at_trigger
  BEFORE UPDATE ON public.fee_earner_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_fee_earner_availability_updated_at();

-- Function to calculate current workload for a fee earner
CREATE OR REPLACE FUNCTION calculate_fee_earner_workload(
  p_fee_earner_id UUID,
  p_tenant_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_settings RECORD;
  v_active_matters INTEGER;
  v_new_matters_this_week INTEGER;
  v_capacity_used DECIMAL(5,2);
  v_weekly_capacity_used DECIMAL(5,2);
  v_is_available BOOLEAN;
  v_result JSONB;
BEGIN
  -- Get settings
  SELECT * INTO v_settings
  FROM public.fee_earner_settings
  WHERE fee_earner_id = p_fee_earner_id
  AND (p_tenant_id IS NULL OR tenant_id = p_tenant_id)
  LIMIT 1;

  -- If no settings, return default
  IF v_settings IS NULL THEN
    RETURN jsonb_build_object(
      'active_matters', 0,
      'new_matters_this_week', 0,
      'capacity_used', 0,
      'weekly_capacity_used', 0,
      'is_available', true,
      'settings_configured', false
    );
  END IF;

  -- Count active matters
  SELECT COUNT(*) INTO v_active_matters
  FROM public.matters
  WHERE assigned_fee_earner_id = p_fee_earner_id
  AND status IN ('new', 'active')
  AND deleted_at IS NULL;

  -- Count matters assigned this week
  SELECT COUNT(*) INTO v_new_matters_this_week
  FROM public.matters
  WHERE assigned_fee_earner_id = p_fee_earner_id
  AND assigned_at >= date_trunc('week', CURRENT_DATE)
  AND deleted_at IS NULL;

  -- Calculate capacity percentages
  v_capacity_used := (v_active_matters::DECIMAL / v_settings.max_concurrent_matters) * 100;
  v_weekly_capacity_used := (v_new_matters_this_week::DECIMAL / v_settings.max_new_matters_per_week) * 100;

  -- Check if currently available (not on holiday, etc.)
  SELECT COUNT(*) = 0 INTO v_is_available
  FROM public.fee_earner_availability
  WHERE fee_earner_id = p_fee_earner_id
  AND CURRENT_DATE BETWEEN start_date AND end_date
  AND is_available = false
  AND deleted_at IS NULL;

  -- Build result
  v_result := jsonb_build_object(
    'active_matters', v_active_matters,
    'max_concurrent_matters', v_settings.max_concurrent_matters,
    'new_matters_this_week', v_new_matters_this_week,
    'max_new_matters_per_week', v_settings.max_new_matters_per_week,
    'capacity_used', v_capacity_used,
    'weekly_capacity_used', v_weekly_capacity_used,
    'is_available', v_is_available,
    'accepts_auto_assignment', v_settings.accepts_auto_assignment,
    'assignment_priority', v_settings.assignment_priority,
    'settings_configured', true
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE public.fee_earner_settings IS 'Fee earner capacity and specialization settings for workload allocation';
COMMENT ON TABLE public.fee_earner_availability IS 'Calendar-based availability tracking for fee earners (holidays, training, etc.)';
COMMENT ON COLUMN public.fee_earner_settings.assignment_priority IS 'Higher number = higher priority for auto-assignment (1-1000)';
COMMENT ON COLUMN public.fee_earner_settings.working_days IS 'Array of working days (1=Monday, 7=Sunday)';
COMMENT ON COLUMN public.fee_earner_availability.availability_type IS 'Type of availability period (available, holiday, sick, training, blocked)';
COMMENT ON COLUMN public.fee_earner_availability.current_workload IS 'Current number of active matters (auto-calculated)';
-- Create matter_activities table for Purchase Client Workflow (Phase 12)
-- Activity timeline and audit log for all matter actions

CREATE TABLE IF NOT EXISTS public.matter_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Activity Details
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Actor
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT,

  -- Related Entities
  related_task_id UUID REFERENCES public.matter_tasks(id) ON DELETE SET NULL,
  related_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  related_offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,

  -- Changes (for audit trail)
  changes JSONB,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT matter_activities_activity_type_check CHECK (activity_type IN (
    'matter_created',
    'matter_updated',
    'stage_changed',
    'task_created',
    'task_completed',
    'task_assigned',
    'document_uploaded',
    'document_verified',
    'offer_created',
    'offer_approved_solicitor',
    'offer_approved_negotiator',
    'offer_accepted_client',
    'offer_submitted',
    'offer_outcome',
    'fee_earner_assigned',
    'client_notified',
    'note_added',
    'priority_changed',
    'closing_date_set',
    'financial_questionnaire_completed',
    'other'
  ))
);

-- Indexes
CREATE INDEX idx_matter_activities_matter
  ON public.matter_activities(matter_id, created_at DESC);

CREATE INDEX idx_matter_activities_tenant
  ON public.matter_activities(tenant_id, created_at DESC);

CREATE INDEX idx_matter_activities_type
  ON public.matter_activities(tenant_id, activity_type, created_at DESC);

CREATE INDEX idx_matter_activities_actor
  ON public.matter_activities(actor_id, created_at DESC)
  WHERE actor_id IS NOT NULL;

CREATE INDEX idx_matter_activities_related_task
  ON public.matter_activities(related_task_id)
  WHERE related_task_id IS NOT NULL;

CREATE INDEX idx_matter_activities_related_document
  ON public.matter_activities(related_document_id)
  WHERE related_document_id IS NOT NULL;

CREATE INDEX idx_matter_activities_related_offer
  ON public.matter_activities(related_offer_id)
  WHERE related_offer_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.matter_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Matter activities are viewable by tenant members"
  ON public.matter_activities
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Matter activities are insertable by tenant members"
  ON public.matter_activities
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'member')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

-- Note: No UPDATE or DELETE policies - activities are immutable once created

-- Helper function to log activity
CREATE OR REPLACE FUNCTION log_matter_activity(
  p_matter_id UUID,
  p_activity_type TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_actor_id UUID DEFAULT NULL,
  p_related_task_id UUID DEFAULT NULL,
  p_related_document_id UUID DEFAULT NULL,
  p_related_offer_id UUID DEFAULT NULL,
  p_changes JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_tenant_id UUID;
  v_actor_name TEXT;
  v_activity_id UUID;
BEGIN
  -- Get tenant_id from matter
  SELECT tenant_id INTO v_tenant_id
  FROM public.matters
  WHERE id = p_matter_id;

  -- Get actor name if actor_id provided
  IF p_actor_id IS NOT NULL THEN
    SELECT full_name INTO v_actor_name
    FROM public.profiles
    WHERE id = p_actor_id;
  END IF;

  -- Insert activity
  INSERT INTO public.matter_activities (
    matter_id,
    tenant_id,
    activity_type,
    title,
    description,
    actor_id,
    actor_name,
    related_task_id,
    related_document_id,
    related_offer_id,
    changes
  ) VALUES (
    p_matter_id,
    v_tenant_id,
    p_activity_type,
    p_title,
    p_description,
    p_actor_id,
    v_actor_name,
    p_related_task_id,
    p_related_document_id,
    p_related_offer_id,
    p_changes
  )
  RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-log matter changes
CREATE OR REPLACE FUNCTION auto_log_matter_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_changes JSONB;
BEGIN
  -- Build changes object for updates
  IF TG_OP = 'UPDATE' THEN
    v_changes := jsonb_build_object();

    -- Track stage changes
    IF NEW.current_stage IS DISTINCT FROM OLD.current_stage THEN
      v_changes := v_changes || jsonb_build_object(
        'current_stage',
        jsonb_build_object('old', OLD.current_stage, 'new', NEW.current_stage)
      );

      -- Log stage change specifically
      PERFORM log_matter_activity(
        NEW.id,
        'stage_changed',
        'Stage changed to ' || NEW.current_stage,
        'Matter progressed from ' || OLD.current_stage || ' to ' || NEW.current_stage,
        NEW.updated_by,
        NULL,
        NULL,
        NULL,
        v_changes
      );
    END IF;

    -- Track fee earner assignment
    IF NEW.assigned_fee_earner_id IS DISTINCT FROM OLD.assigned_fee_earner_id THEN
      v_changes := v_changes || jsonb_build_object(
        'assigned_fee_earner_id',
        jsonb_build_object('old', OLD.assigned_fee_earner_id, 'new', NEW.assigned_fee_earner_id)
      );

      -- Log assignment specifically
      PERFORM log_matter_activity(
        NEW.id,
        'fee_earner_assigned',
        'Fee earner assigned',
        'Matter assigned to fee earner',
        NEW.assigned_by,
        NULL,
        NULL,
        NULL,
        v_changes
      );
    END IF;

    -- Track priority changes
    IF NEW.priority IS DISTINCT FROM OLD.priority THEN
      v_changes := v_changes || jsonb_build_object(
        'priority',
        jsonb_build_object('old', OLD.priority, 'new', NEW.priority)
      );

      -- Log priority change
      PERFORM log_matter_activity(
        NEW.id,
        'priority_changed',
        'Priority changed to ' || NEW.priority,
        NULL,
        NEW.updated_by,
        NULL,
        NULL,
        NULL,
        v_changes
      );
    END IF;

    -- Track closing date changes
    IF NEW.closing_date IS DISTINCT FROM OLD.closing_date THEN
      v_changes := v_changes || jsonb_build_object(
        'closing_date',
        jsonb_build_object('old', OLD.closing_date, 'new', NEW.closing_date)
      );

      -- Log closing date change
      PERFORM log_matter_activity(
        NEW.id,
        'closing_date_set',
        'Closing date set to ' || TO_CHAR(NEW.closing_date, 'DD/MM/YYYY'),
        NULL,
        NEW.updated_by,
        NULL,
        NULL,
        NULL,
        v_changes
      );
    END IF;

    -- If we tracked any changes, log a general update
    IF jsonb_typeof(v_changes) = 'object' AND v_changes != '{}'::jsonb THEN
      -- Check if we haven't already logged a specific activity
      IF NOT (NEW.current_stage IS DISTINCT FROM OLD.current_stage
           OR NEW.assigned_fee_earner_id IS DISTINCT FROM OLD.assigned_fee_earner_id
           OR NEW.priority IS DISTINCT FROM OLD.priority
           OR NEW.closing_date IS DISTINCT FROM OLD.closing_date) THEN
        PERFORM log_matter_activity(
          NEW.id,
          'matter_updated',
          'Matter updated',
          NULL,
          NEW.updated_by,
          NULL,
          NULL,
          NULL,
          v_changes
        );
      END IF;
    END IF;
  END IF;

  -- Log matter creation
  IF TG_OP = 'INSERT' THEN
    PERFORM log_matter_activity(
      NEW.id,
      'matter_created',
      'Matter created',
      'New ' || NEW.matter_type || ' matter created: ' || NEW.matter_number,
      NEW.created_by
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-log matter changes
CREATE TRIGGER auto_log_matter_changes_trigger
  AFTER INSERT OR UPDATE ON public.matters
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NULL)
  EXECUTE FUNCTION auto_log_matter_changes();

-- Trigger function to log task completion
CREATE OR REPLACE FUNCTION auto_log_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM log_matter_activity(
      NEW.matter_id,
      'task_completed',
      'Task completed: ' || NEW.title,
      NULL,
      NEW.completed_by,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log task completion
CREATE TRIGGER auto_log_task_completion_trigger
  AFTER UPDATE ON public.matter_tasks
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION auto_log_task_completion();

-- Trigger function to log document uploads
CREATE OR REPLACE FUNCTION auto_log_document_upload()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_matter_activity(
      NEW.matter_id,
      'document_uploaded',
      'Document uploaded: ' || NEW.title,
      NEW.document_type,
      NEW.uploaded_by,
      NULL,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log document uploads
CREATE TRIGGER auto_log_document_upload_trigger
  AFTER INSERT ON public.documents
  FOR EACH ROW
  WHEN (NEW.matter_id IS NOT NULL)
  EXECUTE FUNCTION auto_log_document_upload();

-- Comments
COMMENT ON TABLE public.matter_activities IS 'Activity timeline and audit log for all matter actions';
COMMENT ON COLUMN public.matter_activities.activity_type IS 'Type of activity (predefined list for filtering)';
COMMENT ON COLUMN public.matter_activities.changes IS 'JSONB object with before/after values for audit trail';
COMMENT ON COLUMN public.matter_activities.actor_name IS 'Cached name of user who performed action';
COMMENT ON FUNCTION log_matter_activity IS 'Helper function to manually log matter activities';
