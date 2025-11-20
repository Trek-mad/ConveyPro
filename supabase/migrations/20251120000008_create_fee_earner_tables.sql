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
