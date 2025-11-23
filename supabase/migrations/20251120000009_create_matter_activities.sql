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
