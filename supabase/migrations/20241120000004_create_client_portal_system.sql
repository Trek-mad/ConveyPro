-- =====================================================
-- PHASE 9: CLIENT PORTAL SYSTEM
-- =====================================================
-- Migration: 20241120000004_create_client_portal_system.sql
-- Description: Client authentication, dashboard, communication, self-service
-- Tables: 7 tables
-- Author: ConveyPro Development Team
-- Date: 2024-11-20
-- =====================================================

-- =====================================================
-- 1. CLIENT AUTHENTICATION
-- =====================================================

-- Client users (separate from staff auth.users)
CREATE TABLE IF NOT EXISTS public.client_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

    -- Authentication
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT, -- NULL for magic link only users

    -- Profile
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,

    -- Verification
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified BOOLEAN DEFAULT false,

    -- Two-factor authentication
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret TEXT,
    backup_codes TEXT[] DEFAULT '{}',

    -- Status
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Magic link tokens for passwordless auth
CREATE TABLE IF NOT EXISTS public.magic_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_user_id UUID NOT NULL REFERENCES public.client_users(id) ON DELETE CASCADE,

    -- Token
    token TEXT NOT NULL UNIQUE,
    token_hash TEXT NOT NULL,

    -- Purpose
    purpose TEXT NOT NULL CHECK (
        purpose IN ('login', 'verification', 'password_reset')
    ),

    -- Expiry
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Client sessions
CREATE TABLE IF NOT EXISTS public.client_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_user_id UUID NOT NULL REFERENCES public.client_users(id) ON DELETE CASCADE,

    -- Session details
    session_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Device/browser info
    ip_address INET,
    user_agent TEXT,
    device_type TEXT, -- 'desktop', 'mobile', 'tablet'
    browser TEXT,
    location TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 2. CLIENT COMMUNICATION
-- =====================================================

-- Client messages (secure messaging)
CREATE TABLE IF NOT EXISTS public.client_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Participants
    sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'staff')),
    sender_id UUID NOT NULL, -- client_user_id or auth.users.id

    -- Message content
    subject TEXT,
    message_text TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,

    -- Thread
    parent_message_id UUID REFERENCES public.client_messages(id) ON DELETE SET NULL,
    thread_id UUID, -- First message ID in thread

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    is_archived BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Client preferences & consent
CREATE TABLE IF NOT EXISTS public.client_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Email preferences
    email_marketing BOOLEAN DEFAULT false,
    email_notifications BOOLEAN DEFAULT true,
    email_reminders BOOLEAN DEFAULT true,
    email_newsletters BOOLEAN DEFAULT false,

    -- SMS preferences
    sms_notifications BOOLEAN DEFAULT false,
    sms_reminders BOOLEAN DEFAULT false,

    -- Communication preferences
    preferred_contact_method TEXT DEFAULT 'email' CHECK (
        preferred_contact_method IN ('email', 'phone', 'sms', 'portal')
    ),

    -- Consent tracking
    marketing_consent_date TIMESTAMP WITH TIME ZONE,
    marketing_consent_ip INET,
    gdpr_consent_date TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    UNIQUE(client_id, tenant_id)
);

-- =====================================================
-- 3. CLIENT DOCUMENTS & UPLOADS
-- =====================================================

-- Client documents (uploaded by clients)
CREATE TABLE IF NOT EXISTS public.client_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Document details
    document_name TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (
        document_type IN ('id', 'proof_of_address', 'contract', 'other')
    ),
    file_path TEXT NOT NULL,
    file_size_bytes INTEGER,
    mime_type TEXT,

    -- Categorization
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',

    -- Status
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    uploaded_by UUID NOT NULL REFERENCES public.client_users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 4. SELF-SERVICE FEATURES
-- =====================================================

-- Consultation bookings
CREATE TABLE IF NOT EXISTS public.consultation_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Booking details
    booking_type TEXT NOT NULL CHECK (
        booking_type IN ('phone', 'video', 'in_person')
    ),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,

    -- Assignment
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Client details
    client_notes TEXT,
    reason TEXT,

    -- Status
    status TEXT DEFAULT 'pending' CHECK (
        status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')
    ),
    confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,

    -- Outcome
    staff_notes TEXT,
    follow_up_required BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Client users
CREATE INDEX idx_client_users_client_id ON public.client_users(client_id);
CREATE INDEX idx_client_users_email ON public.client_users(email);
CREATE INDEX idx_client_users_is_active ON public.client_users(is_active);

-- Magic links
CREATE INDEX idx_magic_links_client_user_id ON public.magic_links(client_user_id);
CREATE INDEX idx_magic_links_token_hash ON public.magic_links(token_hash);
CREATE INDEX idx_magic_links_expires_at ON public.magic_links(expires_at);

-- Client sessions
CREATE INDEX idx_client_sessions_client_user_id ON public.client_sessions(client_user_id);
CREATE INDEX idx_client_sessions_session_token ON public.client_sessions(session_token);
CREATE INDEX idx_client_sessions_is_active ON public.client_sessions(is_active);

-- Client messages
CREATE INDEX idx_client_messages_client_id ON public.client_messages(client_id);
CREATE INDEX idx_client_messages_tenant_id ON public.client_messages(tenant_id);
CREATE INDEX idx_client_messages_thread_id ON public.client_messages(thread_id);
CREATE INDEX idx_client_messages_created_at ON public.client_messages(created_at DESC);

-- Client preferences
CREATE INDEX idx_client_preferences_client_id ON public.client_preferences(client_id);
CREATE INDEX idx_client_preferences_tenant_id ON public.client_preferences(tenant_id);

-- Client documents
CREATE INDEX idx_client_documents_client_id ON public.client_documents(client_id);
CREATE INDEX idx_client_documents_tenant_id ON public.client_documents(tenant_id);
CREATE INDEX idx_client_documents_quote_id ON public.client_documents(quote_id);
CREATE INDEX idx_client_documents_uploaded_by ON public.client_documents(uploaded_by);

-- Consultation bookings
CREATE INDEX idx_consultation_bookings_client_id ON public.consultation_bookings(client_id);
CREATE INDEX idx_consultation_bookings_tenant_id ON public.consultation_bookings(tenant_id);
CREATE INDEX idx_consultation_bookings_assigned_to ON public.consultation_bookings(assigned_to);
CREATE INDEX idx_consultation_bookings_scheduled_at ON public.consultation_bookings(scheduled_at);
CREATE INDEX idx_consultation_bookings_status ON public.consultation_bookings(status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;

-- Client users policies (staff can see all, clients can see only themselves)
CREATE POLICY "Staff can view all client users"
    ON public.client_users FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Client users can view themselves"
    ON public.client_users FOR SELECT
    USING (id = current_setting('app.current_client_user_id', true)::uuid);

CREATE POLICY "Staff and system can manage client users"
    ON public.client_users FOR ALL
    USING (auth.role() = 'authenticated');

-- Magic links policies
CREATE POLICY "System can manage magic links"
    ON public.magic_links FOR ALL
    USING (true);

-- Client sessions policies
CREATE POLICY "Users can view their own sessions"
    ON public.client_sessions FOR SELECT
    USING (
        client_user_id = current_setting('app.current_client_user_id', true)::uuid
        OR auth.role() = 'authenticated'
    );

CREATE POLICY "System can manage sessions"
    ON public.client_sessions FOR ALL
    USING (true);

-- Client messages policies
CREATE POLICY "Participants can view messages"
    ON public.client_messages FOR SELECT
    USING (
        client_id IN (
            SELECT id FROM public.clients
            WHERE id = (
                SELECT client_id FROM public.client_users
                WHERE id = current_setting('app.current_client_user_id', true)::uuid
            )
        )
        OR auth.role() = 'authenticated'
    );

CREATE POLICY "Users can send messages"
    ON public.client_messages FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own messages"
    ON public.client_messages FOR UPDATE
    USING (
        sender_id = current_setting('app.current_client_user_id', true)::uuid
        OR auth.role() = 'authenticated'
    );

-- Client preferences policies
CREATE POLICY "Clients can view their own preferences"
    ON public.client_preferences FOR SELECT
    USING (
        client_id IN (
            SELECT id FROM public.clients
            WHERE id = (
                SELECT client_id FROM public.client_users
                WHERE id = current_setting('app.current_client_user_id', true)::uuid
            )
        )
        OR auth.role() = 'authenticated'
    );

CREATE POLICY "Clients and staff can update preferences"
    ON public.client_preferences FOR ALL
    USING (true);

-- Client documents policies
CREATE POLICY "Clients and staff can view documents"
    ON public.client_documents FOR SELECT
    USING (
        client_id IN (
            SELECT id FROM public.clients
            WHERE id = (
                SELECT client_id FROM public.client_users
                WHERE id = current_setting('app.current_client_user_id', true)::uuid
            )
        )
        OR auth.role() = 'authenticated'
    );

CREATE POLICY "Clients and staff can manage documents"
    ON public.client_documents FOR ALL
    USING (true);

-- Consultation bookings policies
CREATE POLICY "Clients and staff can view bookings"
    ON public.consultation_bookings FOR SELECT
    USING (
        client_id IN (
            SELECT id FROM public.clients
            WHERE id = (
                SELECT client_id FROM public.client_users
                WHERE id = current_setting('app.current_client_user_id', true)::uuid
            )
        )
        OR auth.role() = 'authenticated'
    );

CREATE POLICY "Users can manage bookings"
    ON public.consultation_bookings FOR ALL
    USING (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_client_users_updated_at
    BEFORE UPDATE ON public.client_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_preferences_updated_at
    BEFORE UPDATE ON public.client_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_bookings_updated_at
    BEFORE UPDATE ON public.consultation_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate magic link token
CREATE OR REPLACE FUNCTION generate_magic_link(
    p_client_user_id UUID,
    p_purpose TEXT,
    p_expires_in_minutes INTEGER DEFAULT 60
)
RETURNS TEXT AS $$
DECLARE
    v_token TEXT;
    v_token_hash TEXT;
BEGIN
    -- Generate random token
    v_token := encode(gen_random_bytes(32), 'base64');
    v_token_hash := encode(digest(v_token, 'sha256'), 'hex');

    -- Insert magic link
    INSERT INTO public.magic_links (
        client_user_id,
        token,
        token_hash,
        purpose,
        expires_at
    ) VALUES (
        p_client_user_id,
        v_token,
        v_token_hash,
        p_purpose,
        NOW() + (p_expires_in_minutes || ' minutes')::INTERVAL
    );

    RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CLEANUP & OPTIMIZATION
-- =====================================================

ANALYZE public.client_users;
ANALYZE public.magic_links;
ANALYZE public.client_sessions;
ANALYZE public.client_messages;
ANALYZE public.client_preferences;
ANALYZE public.client_documents;
ANALYZE public.consultation_bookings;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Phase 9: Client Portal System
-- 7 tables created
-- Authentication, dashboard, communication, self-service
-- Ready for use
-- =====================================================
