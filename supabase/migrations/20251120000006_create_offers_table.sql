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
