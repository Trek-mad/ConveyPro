-- =====================================================
-- FORM BUILDER DATABASE SCHEMA
-- =====================================================
-- Platform-level form builder for ConveyPro
-- Allows platform admin to create forms that firms can activate and customize pricing
-- Created: 2024-11-20
-- =====================================================

-- =====================================================
-- 1. FORM TEMPLATES
-- =====================================================
-- Main form definitions (created by platform admin)
CREATE TABLE IF NOT EXISTS public.form_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic info
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,

    -- Visibility control
    visibility TEXT NOT NULL DEFAULT 'global' CHECK (
        visibility IN ('global', 'firm_specific')
    ),

    -- For firm-specific forms, which tenants can see this form
    allowed_tenant_ids UUID[] DEFAULT '{}',

    -- Form configuration
    is_multi_step BOOLEAN DEFAULT false,
    enable_lbtt_calculation BOOLEAN DEFAULT true,
    enable_fee_calculation BOOLEAN DEFAULT true,

    -- Display settings
    success_message TEXT DEFAULT 'Thank you! Your quote request has been submitted.',
    submit_button_text TEXT DEFAULT 'Get Quote',

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (
        status IN ('draft', 'published', 'archived')
    ),
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_by_platform_admin BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_form_templates_slug ON public.form_templates(slug);
CREATE INDEX idx_form_templates_visibility ON public.form_templates(visibility);
CREATE INDEX idx_form_templates_status ON public.form_templates(status);
CREATE INDEX idx_form_templates_allowed_tenants ON public.form_templates USING GIN (allowed_tenant_ids);

-- Updated at trigger
CREATE TRIGGER set_updated_at_form_templates
    BEFORE UPDATE ON public.form_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.form_templates IS 'Form templates created by platform admin (global or firm-specific)';

-- =====================================================
-- 2. FORM STEPS
-- =====================================================
-- Multi-step form configuration
CREATE TABLE IF NOT EXISTS public.form_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_template_id UUID NOT NULL REFERENCES public.form_templates(id) ON DELETE CASCADE,

    -- Step details
    step_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,

    -- Display order
    display_order INTEGER NOT NULL,

    -- Conditional visibility (JSONB for complex rules)
    conditional_logic JSONB DEFAULT NULL,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Ensure unique step numbers per form
    CONSTRAINT unique_form_step_number UNIQUE (form_template_id, step_number)
);

-- Indexes
CREATE INDEX idx_form_steps_template_id ON public.form_steps(form_template_id);
CREATE INDEX idx_form_steps_display_order ON public.form_steps(form_template_id, display_order);

COMMENT ON TABLE public.form_steps IS 'Steps for multi-step forms';

-- =====================================================
-- 3. FORM FIELDS
-- =====================================================
-- Individual fields within forms/steps
CREATE TABLE IF NOT EXISTS public.form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_template_id UUID NOT NULL REFERENCES public.form_templates(id) ON DELETE CASCADE,
    form_step_id UUID REFERENCES public.form_steps(id) ON DELETE CASCADE,

    -- Field identification
    field_name TEXT NOT NULL, -- e.g., "property_value", "client_name"
    field_label TEXT NOT NULL, -- Display label
    field_type TEXT NOT NULL CHECK (
        field_type IN (
            'text', 'email', 'phone', 'number', 'currency',
            'textarea', 'select', 'radio', 'checkbox', 'checkbox_group',
            'date', 'file', 'address', 'yes_no'
        )
    ),

    -- Field configuration
    placeholder TEXT,
    help_text TEXT,
    default_value TEXT,

    -- Validation
    is_required BOOLEAN DEFAULT false,
    validation_rules JSONB DEFAULT '{}', -- e.g., {"min": 0, "max": 1000000, "pattern": "regex"}

    -- Display
    display_order INTEGER NOT NULL,
    width TEXT DEFAULT 'full' CHECK (width IN ('full', 'half', 'third', 'quarter')),

    -- Conditional visibility
    conditional_logic JSONB DEFAULT NULL, -- e.g., {"show_if": {"field": "property_to_sell", "equals": "yes"}}

    -- For pricing calculations
    affects_pricing BOOLEAN DEFAULT false,
    pricing_field_type TEXT CHECK (
        pricing_field_type IN (
            'property_value', 'quantity', 'selection', 'condition', null
        )
    ),

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Ensure unique field names per form
    CONSTRAINT unique_form_field_name UNIQUE (form_template_id, field_name)
);

-- Indexes
CREATE INDEX idx_form_fields_template_id ON public.form_fields(form_template_id);
CREATE INDEX idx_form_fields_step_id ON public.form_fields(form_step_id);
CREATE INDEX idx_form_fields_display_order ON public.form_fields(form_template_id, display_order);
CREATE INDEX idx_form_fields_pricing ON public.form_fields(form_template_id) WHERE affects_pricing = true;

COMMENT ON TABLE public.form_fields IS 'Individual fields within forms';

-- =====================================================
-- 4. FORM FIELD OPTIONS
-- =====================================================
-- Options for select, radio, checkbox fields
CREATE TABLE IF NOT EXISTS public.form_field_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_field_id UUID NOT NULL REFERENCES public.form_fields(id) ON DELETE CASCADE,

    -- Option details
    option_label TEXT NOT NULL,
    option_value TEXT NOT NULL,

    -- Display
    display_order INTEGER NOT NULL,
    is_default BOOLEAN DEFAULT false,

    -- Pricing impact (e.g., "Add £350 if Searches = Yes")
    has_fee BOOLEAN DEFAULT false,
    fee_amount DECIMAL(10,2) DEFAULT 0,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_form_field_options_field_id ON public.form_field_options(form_field_id);

COMMENT ON TABLE public.form_field_options IS 'Options for select/radio/checkbox fields';

-- =====================================================
-- 5. FORM PRICING RULES
-- =====================================================
-- Default pricing configuration for forms (platform admin sets defaults)
CREATE TABLE IF NOT EXISTS public.form_pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_template_id UUID NOT NULL REFERENCES public.form_templates(id) ON DELETE CASCADE,

    -- Rule identification
    rule_name TEXT NOT NULL, -- e.g., "Base Conveyancing Fee", "Searches Fee"
    rule_code TEXT NOT NULL, -- e.g., "base_conveyancing", "searches"
    description TEXT,

    -- Fee type
    fee_type TEXT NOT NULL CHECK (
        fee_type IN (
            'fixed',         -- Fixed amount (e.g., £350 for searches)
            'tiered',        -- Based on property value tiers
            'per_item',      -- Multiplied by quantity (e.g., £50 per purchaser)
            'percentage',    -- Percentage of property value
            'conditional'    -- Only applies if condition met
        )
    ),

    -- Fixed fee configuration
    fixed_amount DECIMAL(10,2) DEFAULT 0,

    -- Percentage fee configuration
    percentage_rate DECIMAL(5,4) DEFAULT 0, -- e.g., 0.0100 for 1%
    percentage_of_field TEXT, -- Field name to calculate percentage from

    -- Per-item configuration
    per_item_amount DECIMAL(10,2) DEFAULT 0,
    quantity_field TEXT, -- Field name for quantity

    -- Conditional configuration
    condition_field TEXT, -- Field to check
    condition_operator TEXT CHECK (
        condition_operator IN ('equals', 'not_equals', 'greater_than', 'less_than', 'contains', null)
    ),
    condition_value TEXT, -- Value to compare against

    -- Display settings
    display_order INTEGER NOT NULL,
    show_on_quote BOOLEAN DEFAULT true,
    category TEXT DEFAULT 'legal_fees' CHECK (
        category IN ('legal_fees', 'disbursements', 'searches', 'registration', 'other')
    ),

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Ensure unique rule codes per form
    CONSTRAINT unique_form_pricing_rule_code UNIQUE (form_template_id, rule_code)
);

-- Indexes
CREATE INDEX idx_form_pricing_rules_template_id ON public.form_pricing_rules(form_template_id);
CREATE INDEX idx_form_pricing_rules_fee_type ON public.form_pricing_rules(fee_type);

COMMENT ON TABLE public.form_pricing_rules IS 'Default pricing rules for forms (set by platform admin)';

-- =====================================================
-- 6. FORM PRICING TIERS
-- =====================================================
-- Tiered pricing brackets (for property value-based fees)
CREATE TABLE IF NOT EXISTS public.form_pricing_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pricing_rule_id UUID NOT NULL REFERENCES public.form_pricing_rules(id) ON DELETE CASCADE,

    -- Tier definition
    tier_name TEXT NOT NULL, -- e.g., "£0 - £100,000"
    min_value DECIMAL(12,2) NOT NULL,
    max_value DECIMAL(12,2), -- NULL for "above X"

    -- Fee for this tier
    tier_fee DECIMAL(10,2) NOT NULL,

    -- Display
    display_order INTEGER NOT NULL,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_form_pricing_tiers_rule_id ON public.form_pricing_tiers(pricing_rule_id);

COMMENT ON TABLE public.form_pricing_tiers IS 'Tiered pricing brackets for property value-based fees';

-- =====================================================
-- 7. FORM INSTANCES
-- =====================================================
-- Firm activations of forms (firms select forms and customize pricing)
CREATE TABLE IF NOT EXISTS public.form_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_template_id UUID NOT NULL REFERENCES public.form_templates(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Instance configuration
    is_active BOOLEAN DEFAULT true,
    custom_name TEXT, -- Firm can rename the form

    -- Branding customization
    custom_success_message TEXT,
    custom_submit_button_text TEXT,

    -- LBTT settings
    use_platform_lbtt_rates BOOLEAN DEFAULT true,
    custom_lbtt_rates_id UUID, -- References custom LBTT rate set

    -- Publishing
    is_published BOOLEAN DEFAULT false,
    public_url_slug TEXT, -- e.g., "edinburgh-solicitors/residential-purchase"

    -- Analytics
    total_submissions INTEGER DEFAULT 0,
    total_quotes_generated INTEGER DEFAULT 0,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    activated_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Ensure firms don't activate the same form twice
    CONSTRAINT unique_tenant_form_instance UNIQUE (tenant_id, form_template_id)
);

-- Indexes
CREATE INDEX idx_form_instances_template_id ON public.form_instances(form_template_id);
CREATE INDEX idx_form_instances_tenant_id ON public.form_instances(tenant_id);
CREATE INDEX idx_form_instances_active ON public.form_instances(tenant_id, is_active);
CREATE INDEX idx_form_instances_public_url ON public.form_instances(public_url_slug) WHERE is_published = true;

-- Updated at trigger
CREATE TRIGGER set_updated_at_form_instances
    BEFORE UPDATE ON public.form_instances
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.form_instances IS 'Firm activations of forms with custom pricing';

-- =====================================================
-- 8. FORM INSTANCE PRICING
-- =====================================================
-- Firm's custom pricing overrides (overrides default pricing rules)
CREATE TABLE IF NOT EXISTS public.form_instance_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_instance_id UUID NOT NULL REFERENCES public.form_instances(id) ON DELETE CASCADE,
    pricing_rule_id UUID NOT NULL REFERENCES public.form_pricing_rules(id) ON DELETE CASCADE,

    -- Custom pricing (overrides platform defaults)
    custom_fixed_amount DECIMAL(10,2),
    custom_percentage_rate DECIMAL(5,4),
    custom_per_item_amount DECIMAL(10,2),

    -- For tiered pricing, store custom tiers
    custom_tiers JSONB, -- e.g., [{"min": 0, "max": 100000, "fee": 900}, ...]

    -- Whether this rule is enabled for this firm
    is_enabled BOOLEAN DEFAULT true,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Ensure unique pricing per instance
    CONSTRAINT unique_instance_pricing_rule UNIQUE (form_instance_id, pricing_rule_id)
);

-- Indexes
CREATE INDEX idx_form_instance_pricing_instance_id ON public.form_instance_pricing(form_instance_id);
CREATE INDEX idx_form_instance_pricing_rule_id ON public.form_instance_pricing(pricing_rule_id);

COMMENT ON TABLE public.form_instance_pricing IS 'Firm custom pricing overrides for forms';

-- =====================================================
-- 9. LBTT RATES
-- =====================================================
-- Platform-managed LBTT rates with version history
CREATE TABLE IF NOT EXISTS public.lbtt_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Rate set identification
    rate_set_name TEXT NOT NULL, -- e.g., "2025-26 LBTT Rates"
    effective_from DATE NOT NULL,
    effective_until DATE, -- NULL if current

    -- Property type
    property_type TEXT NOT NULL CHECK (
        property_type IN ('residential', 'non_residential')
    ),

    -- Rate bands (JSONB for flexibility)
    rate_bands JSONB NOT NULL, -- e.g., [{"min": 0, "max": 145000, "rate": 0}, ...]

    -- Additional Dwelling Supplement
    ads_rate DECIMAL(5,4) DEFAULT 0.08, -- 8%

    -- First-time buyer relief
    ftb_relief_enabled BOOLEAN DEFAULT true,
    ftb_relief_threshold DECIMAL(12,2) DEFAULT 175000,
    ftb_rate_bands JSONB, -- Custom bands for FTB

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_platform_default BOOLEAN DEFAULT false, -- The current platform default

    -- Metadata
    source_reference TEXT, -- e.g., "Scottish Budget 2025-26"
    notes TEXT,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_lbtt_rates_effective_from ON public.lbtt_rates(effective_from);
CREATE INDEX idx_lbtt_rates_property_type ON public.lbtt_rates(property_type);
CREATE INDEX idx_lbtt_rates_is_active ON public.lbtt_rates(is_active);
CREATE INDEX idx_lbtt_rates_platform_default ON public.lbtt_rates(is_platform_default) WHERE is_platform_default = true;

COMMENT ON TABLE public.lbtt_rates IS 'LBTT rate configurations with version history';

-- =====================================================
-- 10. FORM SUBMISSIONS
-- =====================================================
-- Client form submissions (links to quotes)
CREATE TABLE IF NOT EXISTS public.form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_instance_id UUID NOT NULL REFERENCES public.form_instances(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,

    -- Submission data
    submission_data JSONB NOT NULL, -- All form field values

    -- Calculated values
    calculated_lbtt JSONB, -- LBTT breakdown
    calculated_fees JSONB, -- Fee breakdown
    total_quote_amount DECIMAL(12,2),

    -- Client info (extracted from submission)
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT,

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (
        status IN ('submitted', 'quote_generated', 'quote_sent', 'converted', 'abandoned')
    ),

    -- Metadata
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_form_submissions_instance_id ON public.form_submissions(form_instance_id);
CREATE INDEX idx_form_submissions_tenant_id ON public.form_submissions(tenant_id);
CREATE INDEX idx_form_submissions_quote_id ON public.form_submissions(quote_id);
CREATE INDEX idx_form_submissions_status ON public.form_submissions(status);
CREATE INDEX idx_form_submissions_client_email ON public.form_submissions(client_email);
CREATE INDEX idx_form_submissions_created_at ON public.form_submissions(created_at DESC);

COMMENT ON TABLE public.form_submissions IS 'Client form submissions linked to quotes';

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Form Templates: Platform admin only
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Form templates are viewable by authenticated users" ON public.form_templates
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Form templates are manageable by platform admins" ON public.form_templates
    FOR ALL
    USING (
        -- TODO: Add platform_admin check when implemented
        auth.role() = 'authenticated'
    );

-- Form Steps: Platform admin only
ALTER TABLE public.form_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Form steps are viewable by authenticated users" ON public.form_steps
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Form Fields: Platform admin only
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Form fields are viewable by authenticated users" ON public.form_fields
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Form Field Options: Platform admin only
ALTER TABLE public.form_field_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Form field options are viewable by authenticated users" ON public.form_field_options
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Form Pricing Rules: Platform admin only
ALTER TABLE public.form_pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Form pricing rules are viewable by authenticated users" ON public.form_pricing_rules
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Form Pricing Tiers: Platform admin only
ALTER TABLE public.form_pricing_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Form pricing tiers are viewable by authenticated users" ON public.form_pricing_tiers
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Form Instances: Tenant members
ALTER TABLE public.form_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Form instances are viewable by tenant members" ON public.form_instances
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = form_instances.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Form instances are insertable by tenant members" ON public.form_instances
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin', 'manager')
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Form instances are updatable by tenant admins" ON public.form_instances
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = form_instances.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin', 'manager')
            AND tm.status = 'active'
        )
    );

-- Form Instance Pricing: Tenant members
ALTER TABLE public.form_instance_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Form instance pricing is viewable by tenant members" ON public.form_instance_pricing
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.form_instances fi
            JOIN public.tenant_memberships tm ON tm.tenant_id = fi.tenant_id
            WHERE fi.id = form_instance_pricing.form_instance_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

-- LBTT Rates: Public readable
ALTER TABLE public.lbtt_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "LBTT rates are viewable by all" ON public.lbtt_rates
    FOR SELECT
    USING (true);

CREATE POLICY "LBTT rates are manageable by platform admins" ON public.lbtt_rates
    FOR ALL
    USING (
        -- TODO: Add platform_admin check when implemented
        auth.role() = 'authenticated'
    );

-- Form Submissions: Tenant members
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Form submissions are viewable by tenant members" ON public.form_submissions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = form_submissions.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get active LBTT rates for a property type
CREATE OR REPLACE FUNCTION public.get_active_lbtt_rates(
    p_property_type TEXT DEFAULT 'residential',
    p_effective_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    id UUID,
    rate_set_name TEXT,
    rate_bands JSONB,
    ads_rate DECIMAL,
    ftb_relief_enabled BOOLEAN,
    ftb_relief_threshold DECIMAL,
    ftb_rate_bands JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lr.id,
        lr.rate_set_name,
        lr.rate_bands,
        lr.ads_rate,
        lr.ftb_relief_enabled,
        lr.ftb_relief_threshold,
        lr.ftb_rate_bands
    FROM public.lbtt_rates lr
    WHERE lr.property_type = p_property_type
    AND lr.is_active = true
    AND lr.effective_from <= p_effective_date
    AND (lr.effective_until IS NULL OR lr.effective_until >= p_effective_date)
    ORDER BY lr.effective_from DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_active_lbtt_rates IS 'Get active LBTT rates for a specific property type and date';

-- =====================================================
-- INITIAL DATA: Default LBTT Rates
-- =====================================================

-- Insert current 2025-26 LBTT rates
INSERT INTO public.lbtt_rates (
    rate_set_name,
    effective_from,
    property_type,
    rate_bands,
    ads_rate,
    ftb_relief_enabled,
    ftb_relief_threshold,
    ftb_rate_bands,
    is_active,
    is_platform_default,
    source_reference,
    notes
) VALUES (
    '2025-26 LBTT Rates (Residential)',
    '2025-04-01',
    'residential',
    '[
        {"min": 0, "max": 145000, "rate": 0, "label": "Up to £145,000"},
        {"min": 145000, "max": 250000, "rate": 0.02, "label": "£145,001 to £250,000"},
        {"min": 250000, "max": 325000, "rate": 0.05, "label": "£250,001 to £325,000"},
        {"min": 325000, "max": 750000, "rate": 0.10, "label": "£325,001 to £750,000"},
        {"min": 750000, "max": null, "rate": 0.12, "label": "Above £750,000"}
    ]'::jsonb,
    0.08,
    true,
    175000,
    '[
        {"min": 0, "max": 175000, "rate": 0, "label": "Up to £175,000 (First-time buyer)"},
        {"min": 175000, "max": 250000, "rate": 0.02, "label": "£175,001 to £250,000"},
        {"min": 250000, "max": 325000, "rate": 0.05, "label": "£250,001 to £325,000"},
        {"min": 325000, "max": 750000, "rate": 0.10, "label": "£325,001 to £750,000"},
        {"min": 750000, "max": null, "rate": 0.12, "label": "Above £750,000"}
    ]'::jsonb,
    true,
    true,
    'Scottish Budget 2025-26',
    'Current residential LBTT rates with 8% Additional Dwelling Supplement'
),
(
    '2024-25 LBTT Rates (Non-Residential)',
    '2024-04-01',
    'non_residential',
    '[
        {"min": 0, "max": 150000, "rate": 0, "label": "Up to £150,000"},
        {"min": 150000, "max": 250000, "rate": 0.01, "label": "£150,001 to £250,000"},
        {"min": 250000, "max": null, "rate": 0.05, "label": "Above £250,000"}
    ]'::jsonb,
    0,
    false,
    null,
    null,
    true,
    true,
    'Revenue Scotland',
    'Non-residential property LBTT rates (no ADS applies)'
);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
