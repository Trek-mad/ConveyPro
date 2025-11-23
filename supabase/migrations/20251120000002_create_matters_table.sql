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
