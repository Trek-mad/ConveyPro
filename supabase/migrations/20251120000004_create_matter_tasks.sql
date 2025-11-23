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
