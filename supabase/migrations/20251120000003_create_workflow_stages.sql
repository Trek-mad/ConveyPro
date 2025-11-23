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
