-- =====================================================
-- PHASE 8: TEAM COLLABORATION SYSTEM
-- =====================================================
-- Migration: 20241120000003_create_team_collaboration_system.sql
-- Description: Staff management, approvals, notifications, permissions
-- Tables: 8 tables
-- Author: ConveyPro Development Team
-- Date: 2024-11-20
-- =====================================================

-- =====================================================
-- 1. STAFF PROFILES & ASSIGNMENTS
-- =====================================================

-- Staff extended profiles (extends profiles table)
CREATE TABLE IF NOT EXISTS public.staff_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Profile information
    job_title TEXT,
    department TEXT,
    bio TEXT,
    avatar_url TEXT,
    phone_work TEXT,
    phone_mobile TEXT,

    -- Work settings
    max_workload INTEGER DEFAULT 10, -- Max concurrent assignments
    specializations TEXT[] DEFAULT '{}', -- Areas of expertise
    availability_status TEXT DEFAULT 'available' CHECK (
        availability_status IN ('available', 'busy', 'away', 'offline')
    ),

    -- Performance metrics
    total_quotes_handled INTEGER DEFAULT 0,
    total_clients_managed INTEGER DEFAULT 0,
    average_response_time_hours DECIMAL(10,2),
    client_satisfaction_score DECIMAL(3,2), -- Out of 5.00

    -- Settings
    notification_preferences JSONB DEFAULT '{
        "email": true,
        "push": true,
        "sms": false,
        "digest": "daily"
    }'::jsonb,

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    UNIQUE(user_id, tenant_id)
);

-- Quote assignments
CREATE TABLE IF NOT EXISTS public.quote_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Assignment details
    assignment_type TEXT DEFAULT 'primary' CHECK (
        assignment_type IN ('primary', 'secondary', 'reviewer', 'observer')
    ),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Notes
    assignment_note TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    UNIQUE(quote_id, assigned_to, assignment_type)
);

-- Client assignments (account ownership)
CREATE TABLE IF NOT EXISTS public.client_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Assignment details
    is_primary_owner BOOLEAN DEFAULT true,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    assignment_note TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    UNIQUE(client_id, assigned_to)
);

-- =====================================================
-- 2. WORKFLOW & APPROVALS
-- =====================================================

-- Approval workflows (templates)
CREATE TABLE IF NOT EXISTS public.approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Workflow details
    name TEXT NOT NULL,
    description TEXT,
    workflow_type TEXT NOT NULL CHECK (
        workflow_type IN ('quote', 'campaign', 'template', 'form', 'custom')
    ),

    -- Approval chain
    approval_steps JSONB DEFAULT '[]'::jsonb, -- Array of {role, required_approvers, order}
    auto_approve_threshold DECIMAL(10,2), -- e.g., quotes under £1000

    -- Settings
    is_active BOOLEAN DEFAULT true,
    is_required BOOLEAN DEFAULT false, -- Make this workflow mandatory

    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Approval requests
CREATE TABLE IF NOT EXISTS public.approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.approval_workflows(id) ON DELETE SET NULL,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Request details
    request_type TEXT NOT NULL CHECK (
        request_type IN ('quote', 'campaign', 'template', 'form', 'custom')
    ),
    entity_id UUID NOT NULL, -- ID of quote, campaign, etc.
    entity_data JSONB, -- Snapshot of the item for approval

    -- Submitter
    submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    submission_note TEXT,

    -- Approval status
    status TEXT DEFAULT 'pending' CHECK (
        status IN ('pending', 'approved', 'rejected', 'cancelled')
    ),
    current_step INTEGER DEFAULT 1,

    -- Decision
    decided_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    decided_at TIMESTAMP WITH TIME ZONE,
    decision_note TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Approval comments/discussion
CREATE TABLE IF NOT EXISTS public.approval_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_request_id UUID NOT NULL REFERENCES public.approval_requests(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Comment details
    commented_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT true, -- Internal notes vs client-facing

    -- Attachments
    attachments JSONB DEFAULT '[]'::jsonb,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 3. NOTIFICATIONS & ALERTS
-- =====================================================

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Recipient
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Notification details
    notification_type TEXT NOT NULL CHECK (
        notification_type IN (
            'form_submission', 'quote_accepted', 'quote_viewed',
            'campaign_milestone', 'approval_request', 'approval_decision',
            'assignment', 'mention', 'task_reminder', 'system'
        )
    ),
    title TEXT NOT NULL,
    message TEXT NOT NULL,

    -- Links
    action_url TEXT, -- Where clicking notification takes user
    entity_type TEXT, -- 'quote', 'client', 'campaign', etc.
    entity_id UUID,

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,

    -- Delivery channels
    sent_email BOOLEAN DEFAULT false,
    sent_push BOOLEAN DEFAULT false,
    sent_sms BOOLEAN DEFAULT false,

    -- Priority
    priority TEXT DEFAULT 'normal' CHECK (
        priority IN ('low', 'normal', 'high', 'urgent')
    ),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 4. PERMISSIONS & AUDIT
-- =====================================================

-- Audit log
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Actor
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT, -- Store email in case user deleted
    user_role TEXT,

    -- Action
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject', etc.
    resource_type TEXT NOT NULL, -- 'quote', 'client', 'campaign', etc.
    resource_id UUID,

    -- Details
    description TEXT,
    changes JSONB, -- Before/after snapshot
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Request info
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Staff profiles
CREATE INDEX idx_staff_profiles_user_id ON public.staff_profiles(user_id);
CREATE INDEX idx_staff_profiles_tenant_id ON public.staff_profiles(tenant_id);
CREATE INDEX idx_staff_profiles_is_active ON public.staff_profiles(is_active);

-- Quote assignments
CREATE INDEX idx_quote_assignments_quote_id ON public.quote_assignments(quote_id);
CREATE INDEX idx_quote_assignments_assigned_to ON public.quote_assignments(assigned_to);
CREATE INDEX idx_quote_assignments_tenant_id ON public.quote_assignments(tenant_id);

-- Client assignments
CREATE INDEX idx_client_assignments_client_id ON public.client_assignments(client_id);
CREATE INDEX idx_client_assignments_assigned_to ON public.client_assignments(assigned_to);
CREATE INDEX idx_client_assignments_tenant_id ON public.client_assignments(tenant_id);
CREATE INDEX idx_client_assignments_is_primary ON public.client_assignments(is_primary_owner);

-- Approval workflows
CREATE INDEX idx_approval_workflows_tenant_id ON public.approval_workflows(tenant_id);
CREATE INDEX idx_approval_workflows_type ON public.approval_workflows(workflow_type);
CREATE INDEX idx_approval_workflows_is_active ON public.approval_workflows(is_active);

-- Approval requests
CREATE INDEX idx_approval_requests_workflow_id ON public.approval_requests(workflow_id);
CREATE INDEX idx_approval_requests_tenant_id ON public.approval_requests(tenant_id);
CREATE INDEX idx_approval_requests_entity ON public.approval_requests(request_type, entity_id);
CREATE INDEX idx_approval_requests_status ON public.approval_requests(status);
CREATE INDEX idx_approval_requests_submitted_by ON public.approval_requests(submitted_by);

-- Approval comments
CREATE INDEX idx_approval_comments_request_id ON public.approval_comments(approval_request_id);
CREATE INDEX idx_approval_comments_tenant_id ON public.approval_comments(tenant_id);

-- Notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_tenant_id ON public.notifications(tenant_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON public.notifications(notification_type);

-- Audit logs
CREATE INDEX idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Staff profiles policies
CREATE POLICY "Staff profiles are viewable by authenticated users in same tenant"
    ON public.staff_profiles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Staff profiles are manageable by authenticated users"
    ON public.staff_profiles FOR ALL
    USING (auth.role() = 'authenticated');

-- Quote assignments policies
CREATE POLICY "Quote assignments are viewable by authenticated users"
    ON public.quote_assignments FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Quote assignments are manageable by authenticated users"
    ON public.quote_assignments FOR ALL
    USING (auth.role() = 'authenticated');

-- Client assignments policies
CREATE POLICY "Client assignments are viewable by authenticated users"
    ON public.client_assignments FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Client assignments are manageable by authenticated users"
    ON public.client_assignments FOR ALL
    USING (auth.role() = 'authenticated');

-- Approval workflows policies
CREATE POLICY "Approval workflows are viewable by authenticated users"
    ON public.approval_workflows FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Approval workflows are manageable by authenticated users"
    ON public.approval_workflows FOR ALL
    USING (auth.role() = 'authenticated');

-- Approval requests policies
CREATE POLICY "Approval requests are viewable by authenticated users"
    ON public.approval_requests FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Approval requests are manageable by authenticated users"
    ON public.approval_requests FOR ALL
    USING (auth.role() = 'authenticated');

-- Approval comments policies
CREATE POLICY "Approval comments are viewable by authenticated users"
    ON public.approval_comments FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Approval comments are manageable by authenticated users"
    ON public.approval_comments FOR ALL
    USING (auth.role() = 'authenticated');

-- Notifications policies (users can only see their own)
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications for users"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Audit logs policies (read-only for most users)
CREATE POLICY "Audit logs are viewable by authenticated users"
    ON public.audit_logs FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Audit logs are insertable by system"
    ON public.audit_logs FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_staff_profiles_updated_at
    BEFORE UPDATE ON public.staff_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_assignments_updated_at
    BEFORE UPDATE ON public.client_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_workflows_updated_at
    BEFORE UPDATE ON public.approval_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_requests_updated_at
    BEFORE UPDATE ON public.approval_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_comments_updated_at
    BEFORE UPDATE ON public.approval_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_action TEXT;
    v_changes JSONB;
BEGIN
    -- Determine action
    IF (TG_OP = 'DELETE') THEN
        v_action := 'delete';
        v_changes := to_jsonb(OLD);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_action := 'update';
        v_changes := jsonb_build_object(
            'before', to_jsonb(OLD),
            'after', to_jsonb(NEW)
        );
    ELSIF (TG_OP = 'INSERT') THEN
        v_action := 'create';
        v_changes := to_jsonb(NEW);
    END IF;

    -- Insert audit log (only for important tables)
    IF TG_TABLE_NAME IN ('quotes', 'clients', 'campaigns', 'approval_requests') THEN
        INSERT INTO public.audit_logs (
            tenant_id,
            user_id,
            user_email,
            action,
            resource_type,
            resource_id,
            changes
        ) VALUES (
            COALESCE(NEW.tenant_id, OLD.tenant_id),
            auth.uid(),
            (SELECT email FROM auth.users WHERE id = auth.uid()),
            v_action,
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            v_changes
        );
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send notification
CREATE OR REPLACE FUNCTION send_notification(
    p_user_id UUID,
    p_tenant_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_action_url TEXT DEFAULT NULL,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_priority TEXT DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id,
        tenant_id,
        notification_type,
        title,
        message,
        action_url,
        entity_type,
        entity_id,
        priority
    ) VALUES (
        p_user_id,
        p_tenant_id,
        p_type,
        p_title,
        p_message,
        p_action_url,
        p_entity_type,
        p_entity_id,
        p_priority
    )
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA (Optional - for development)
-- =====================================================

-- Add sample approval workflow
-- INSERT INTO public.approval_workflows (
--     tenant_id,
--     name,
--     description,
--     workflow_type,
--     approval_steps,
--     auto_approve_threshold
-- ) VALUES (
--     (SELECT id FROM public.tenants LIMIT 1),
--     'High-Value Quote Approval',
--     'Quotes over £5,000 require manager approval',
--     'quote',
--     '[{"role": "admin", "required_approvers": 1, "order": 1}]'::jsonb,
--     5000.00
-- );

-- =====================================================
-- CLEANUP & OPTIMIZATION
-- =====================================================

-- Analyze tables for query optimization
ANALYZE public.staff_profiles;
ANALYZE public.quote_assignments;
ANALYZE public.client_assignments;
ANALYZE public.approval_workflows;
ANALYZE public.approval_requests;
ANALYZE public.approval_comments;
ANALYZE public.notifications;
ANALYZE public.audit_logs;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Phase 8: Team Collaboration System
-- 8 tables created
-- Indexes, RLS policies, and triggers configured
-- Ready for use
-- =====================================================
