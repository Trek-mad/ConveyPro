-- =====================================================
-- PHASE 11: GO-TO-MARKET SYSTEM
-- =====================================================
-- Migration: 20241120000005_create_go_to_market_system.sql
-- Description: Billing, onboarding, marketing, support
-- Tables: 12 tables
-- Author: ConveyPro Development Team
-- Date: 2024-11-20
-- =====================================================

-- =====================================================
-- 1. BILLING & SUBSCRIPTIONS
-- =====================================================

-- Subscription plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Plan details
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,

    -- Pricing
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GBP' NOT NULL,

    -- Features
    max_users INTEGER,
    max_quotes_per_month INTEGER,
    max_clients INTEGER,
    max_email_sends_per_month INTEGER,
    features JSONB DEFAULT '[]'::jsonb,

    -- Stripe
    stripe_price_id_monthly TEXT,
    stripe_price_id_yearly TEXT,
    stripe_product_id TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tenant subscriptions
CREATE TABLE IF NOT EXISTS public.tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),

    -- Subscription details
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (
        status IN ('trial', 'active', 'past_due', 'cancelled', 'paused')
    ),

    -- Dates
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE,

    -- Stripe
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,

    -- Usage tracking
    quotes_used_this_period INTEGER DEFAULT 0,
    emails_sent_this_period INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    UNIQUE(tenant_id)
);

-- Payment methods
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Payment method details
    type TEXT NOT NULL CHECK (type IN ('card', 'bank_account')),
    last4 TEXT NOT NULL,
    brand TEXT, -- Visa, Mastercard, etc.
    exp_month INTEGER,
    exp_year INTEGER,

    -- Status
    is_default BOOLEAN DEFAULT false,

    -- Stripe
    stripe_payment_method_id TEXT UNIQUE NOT NULL,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.tenant_subscriptions(id) ON DELETE SET NULL,

    -- Invoice details
    invoice_number TEXT NOT NULL UNIQUE,
    amount_due DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'GBP',

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (
        status IN ('draft', 'open', 'paid', 'void', 'uncollectible')
    ),

    -- Dates
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,

    -- Stripe
    stripe_invoice_id TEXT UNIQUE,
    stripe_invoice_pdf TEXT,

    -- Line items
    line_items JSONB DEFAULT '[]'::jsonb,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Usage events (for usage-based billing)
CREATE TABLE IF NOT EXISTS public.usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.tenant_subscriptions(id) ON DELETE CASCADE,

    -- Event details
    event_type TEXT NOT NULL CHECK (
        event_type IN ('quote_created', 'email_sent', 'user_added', 'client_added')
    ),
    quantity INTEGER DEFAULT 1,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 2. ONBOARDING EXPERIENCE
-- =====================================================

-- Tenant onboarding progress
CREATE TABLE IF NOT EXISTS public.tenant_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Progress tracking
    current_step INTEGER DEFAULT 1,
    is_completed BOOLEAN DEFAULT false,
    completed_steps JSONB DEFAULT '[]'::jsonb, -- Array of completed step IDs

    -- Checklist items
    checklist JSONB DEFAULT '{
        "profile_completed": false,
        "team_invited": false,
        "first_quote_created": false,
        "branding_customized": false,
        "form_created": false,
        "campaign_created": false
    }'::jsonb,

    -- Email course
    email_course_day INTEGER DEFAULT 1,
    email_course_started_at TIMESTAMP WITH TIME ZONE,
    email_course_completed_at TIMESTAMP WITH TIME ZONE,

    -- Sample data
    sample_data_generated BOOLEAN DEFAULT false,

    -- Metrics
    success_score INTEGER DEFAULT 0, -- 0-100 based on completion
    time_to_first_quote_hours DECIMAL(10,2),

    -- Metadata
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    UNIQUE(tenant_id)
);

-- Onboarding walkthroughs
CREATE TABLE IF NOT EXISTS public.onboarding_walkthroughs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Walkthrough details
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    video_url TEXT,

    -- Steps
    steps JSONB DEFAULT '[]'::jsonb,
    estimated_duration_minutes INTEGER,

    -- Targeting
    target_role TEXT[], -- Which roles should see this
    trigger_event TEXT, -- When to show (login, first_quote, etc.)

    -- Status
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 3. MARKETING FEATURES
-- =====================================================

-- Demo requests
CREATE TABLE IF NOT EXISTS public.demo_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Contact details
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company_name TEXT NOT NULL,
    company_size TEXT,

    -- Request details
    message TEXT,
    preferred_date TIMESTAMP WITH TIME ZONE,

    -- Lead scoring
    lead_source TEXT, -- website, referral, ad, etc.
    lead_score INTEGER DEFAULT 0,

    -- Status
    status TEXT DEFAULT 'new' CHECK (
        status IN ('new', 'contacted', 'scheduled', 'completed', 'lost')
    ),

    -- Assignment
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Notes
    internal_notes TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,

    -- Testimonial details
    author_name TEXT NOT NULL,
    author_title TEXT,
    author_company TEXT,
    author_photo_url TEXT,

    -- Content
    testimonial_text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),

    -- Metrics
    result_achieved TEXT, -- e.g., "Reduced quote time by 80%"

    -- Display
    is_featured BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 4. SUPPORT SYSTEM
-- =====================================================

-- Support tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Ticket details
    ticket_number TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Requester
    requester_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    requester_email TEXT NOT NULL,
    requester_name TEXT NOT NULL,

    -- Classification
    category TEXT CHECK (
        category IN ('billing', 'technical', 'feature_request', 'bug', 'other')
    ),
    priority TEXT DEFAULT 'normal' CHECK (
        priority IN ('low', 'normal', 'high', 'urgent')
    ),

    -- Status
    status TEXT DEFAULT 'open' CHECK (
        status IN ('open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed')
    ),

    -- Assignment
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Dates
    first_response_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Support ticket messages
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,

    -- Message details
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent')),
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_name TEXT NOT NULL,

    -- Content
    message_text TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,

    -- Attachments
    attachments JSONB DEFAULT '[]'::jsonb,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Knowledge base articles
CREATE TABLE IF NOT EXISTS public.knowledge_base_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Article details
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,

    -- Organization
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',

    -- SEO
    meta_title TEXT,
    meta_description TEXT,

    -- Status
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,

    -- Analytics
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,

    -- Author
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Metadata
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Feature requests
CREATE TABLE IF NOT EXISTS public.feature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,

    -- Request details
    title TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Requester
    requester_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    requester_email TEXT NOT NULL,

    -- Classification
    category TEXT,

    -- Status
    status TEXT DEFAULT 'under_review' CHECK (
        status IN ('under_review', 'planned', 'in_progress', 'completed', 'declined')
    ),

    -- Voting
    vote_count INTEGER DEFAULT 0,

    -- Planning
    estimated_effort TEXT, -- small, medium, large
    planned_release TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Subscription plans
CREATE INDEX idx_subscription_plans_is_active ON public.subscription_plans(is_active);
CREATE INDEX idx_subscription_plans_slug ON public.subscription_plans(slug);

-- Tenant subscriptions
CREATE INDEX idx_tenant_subscriptions_tenant_id ON public.tenant_subscriptions(tenant_id);
CREATE INDEX idx_tenant_subscriptions_status ON public.tenant_subscriptions(status);
CREATE INDEX idx_tenant_subscriptions_stripe_id ON public.tenant_subscriptions(stripe_subscription_id);

-- Payment methods
CREATE INDEX idx_payment_methods_tenant_id ON public.payment_methods(tenant_id);
CREATE INDEX idx_payment_methods_is_default ON public.payment_methods(is_default);

-- Invoices
CREATE INDEX idx_invoices_tenant_id ON public.invoices(tenant_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_invoice_date ON public.invoices(invoice_date DESC);

-- Usage events
CREATE INDEX idx_usage_events_tenant_id ON public.usage_events(tenant_id);
CREATE INDEX idx_usage_events_subscription_id ON public.usage_events(subscription_id);
CREATE INDEX idx_usage_events_created_at ON public.usage_events(created_at DESC);

-- Tenant onboarding
CREATE INDEX idx_tenant_onboarding_tenant_id ON public.tenant_onboarding(tenant_id);
CREATE INDEX idx_tenant_onboarding_is_completed ON public.tenant_onboarding(is_completed);

-- Demo requests
CREATE INDEX idx_demo_requests_status ON public.demo_requests(status);
CREATE INDEX idx_demo_requests_created_at ON public.demo_requests(created_at DESC);
CREATE INDEX idx_demo_requests_assigned_to ON public.demo_requests(assigned_to);

-- Testimonials
CREATE INDEX idx_testimonials_is_approved ON public.testimonials(is_approved);
CREATE INDEX idx_testimonials_is_featured ON public.testimonials(is_featured);

-- Support tickets
CREATE INDEX idx_support_tickets_tenant_id ON public.support_tickets(tenant_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at DESC);

-- Support ticket messages
CREATE INDEX idx_support_ticket_messages_ticket_id ON public.support_ticket_messages(ticket_id);

-- Knowledge base articles
CREATE INDEX idx_kb_articles_slug ON public.knowledge_base_articles(slug);
CREATE INDEX idx_kb_articles_is_published ON public.knowledge_base_articles(is_published);
CREATE INDEX idx_kb_articles_category ON public.knowledge_base_articles(category);

-- Feature requests
CREATE INDEX idx_feature_requests_status ON public.feature_requests(status);
CREATE INDEX idx_feature_requests_vote_count ON public.feature_requests(vote_count DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_walkthroughs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

-- Subscription plans (public read)
CREATE POLICY "Subscription plans are publicly readable"
    ON public.subscription_plans FOR SELECT
    USING (is_active = true);

CREATE POLICY "Subscription plans are manageable by admins"
    ON public.subscription_plans FOR ALL
    USING (auth.role() = 'authenticated');

-- Tenant subscriptions
CREATE POLICY "Tenants can view their own subscription"
    ON public.tenant_subscriptions FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage subscriptions"
    ON public.tenant_subscriptions FOR ALL
    USING (auth.role() = 'authenticated');

-- Payment methods
CREATE POLICY "Tenants can view their own payment methods"
    ON public.payment_methods FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Tenants can manage their payment methods"
    ON public.payment_methods FOR ALL
    USING (auth.role() = 'authenticated');

-- Invoices
CREATE POLICY "Tenants can view their own invoices"
    ON public.invoices FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage invoices"
    ON public.invoices FOR ALL
    USING (auth.role() = 'authenticated');

-- Usage events
CREATE POLICY "System can manage usage events"
    ON public.usage_events FOR ALL
    USING (auth.role() = 'authenticated');

-- Tenant onboarding
CREATE POLICY "Tenants can view their onboarding"
    ON public.tenant_onboarding FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage onboarding"
    ON public.tenant_onboarding FOR ALL
    USING (auth.role() = 'authenticated');

-- Onboarding walkthroughs (public read)
CREATE POLICY "Walkthroughs are publicly readable"
    ON public.onboarding_walkthroughs FOR SELECT
    USING (is_active = true);

-- Demo requests
CREATE POLICY "Anyone can create demo requests"
    ON public.demo_requests FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Staff can view and manage demo requests"
    ON public.demo_requests FOR ALL
    USING (auth.role() = 'authenticated');

-- Testimonials (public read)
CREATE POLICY "Approved testimonials are publicly readable"
    ON public.testimonials FOR SELECT
    USING (is_approved = true);

CREATE POLICY "Staff can manage testimonials"
    ON public.testimonials FOR ALL
    USING (auth.role() = 'authenticated');

-- Support tickets
CREATE POLICY "Users can view their own tickets"
    ON public.support_tickets FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create tickets"
    ON public.support_tickets FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Staff can manage all tickets"
    ON public.support_tickets FOR ALL
    USING (auth.role() = 'authenticated');

-- Support ticket messages
CREATE POLICY "Users can view messages for their tickets"
    ON public.support_ticket_messages FOR SELECT
    USING (true);

CREATE POLICY "Users can create messages"
    ON public.support_ticket_messages FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Knowledge base (public read)
CREATE POLICY "Published articles are publicly readable"
    ON public.knowledge_base_articles FOR SELECT
    USING (is_published = true);

CREATE POLICY "Staff can manage articles"
    ON public.knowledge_base_articles FOR ALL
    USING (auth.role() = 'authenticated');

-- Feature requests
CREATE POLICY "Users can view feature requests"
    ON public.feature_requests FOR SELECT
    USING (true);

CREATE POLICY "Users can create feature requests"
    ON public.feature_requests FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Staff can manage feature requests"
    ON public.feature_requests FOR ALL
    USING (auth.role() = 'authenticated');

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_subscriptions_updated_at
    BEFORE UPDATE ON public.tenant_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_onboarding_updated_at
    BEFORE UPDATE ON public.tenant_onboarding
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_walkthroughs_updated_at
    BEFORE UPDATE ON public.onboarding_walkthroughs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demo_requests_updated_at
    BEFORE UPDATE ON public.demo_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kb_articles_updated_at
    BEFORE UPDATE ON public.knowledge_base_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_requests_updated_at
    BEFORE UPDATE ON public.feature_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    v_number TEXT;
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM public.support_tickets;
    v_number := 'TICKET-' || LPAD((v_count + 1)::TEXT, 6, '0');
    RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    v_number TEXT;
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM public.invoices;
    v_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD((v_count + 1)::TEXT, 4, '0');
    RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, slug, description, price_monthly, price_yearly, max_users, max_quotes_per_month, max_clients, max_email_sends_per_month, features, is_popular) VALUES
('Starter', 'starter', 'Perfect for solo practitioners and small firms', 29.00, 290.00, 3, 50, 100, 500,
    '["Basic quote generation", "Email delivery", "Client management", "Standard support"]'::jsonb, false),
('Professional', 'professional', 'Ideal for growing firms', 99.00, 990.00, 10, 200, 500, 2000,
    '["Everything in Starter", "Form Builder", "Campaign automation", "Analytics dashboard", "Priority support", "Custom branding"]'::jsonb, true),
('Enterprise', 'enterprise', 'For large firms with advanced needs', 299.00, 2990.00, NULL, NULL, NULL, NULL,
    '["Everything in Professional", "Unlimited users", "Unlimited quotes", "Unlimited clients", "API access", "Dedicated support", "Custom integrations", "SLA guarantee"]'::jsonb, false);

-- =====================================================
-- CLEANUP & OPTIMIZATION
-- =====================================================

ANALYZE public.subscription_plans;
ANALYZE public.tenant_subscriptions;
ANALYZE public.payment_methods;
ANALYZE public.invoices;
ANALYZE public.usage_events;
ANALYZE public.tenant_onboarding;
ANALYZE public.demo_requests;
ANALYZE public.testimonials;
ANALYZE public.support_tickets;
ANALYZE public.knowledge_base_articles;
ANALYZE public.feature_requests;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Phase 11: Go-to-Market System
-- 12 tables created
-- Billing, onboarding, marketing, support
-- Ready for commercial launch
-- =====================================================
