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
