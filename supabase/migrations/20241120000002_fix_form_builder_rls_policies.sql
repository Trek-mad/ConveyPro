-- Fix RLS policies for form builder tables
-- Add INSERT/UPDATE/DELETE policies for platform admins

-- Form Fields: Add management policy
CREATE POLICY "Form fields are manageable by platform admins" ON public.form_fields
    FOR ALL
    USING (
        -- TODO: Add platform_admin check when implemented
        auth.role() = 'authenticated'
    );

-- Form Field Options: Add management policy
CREATE POLICY "Form field options are manageable by platform admins" ON public.form_field_options
    FOR ALL
    USING (
        -- TODO: Add platform_admin check when implemented
        auth.role() = 'authenticated'
    );

-- Form Pricing Rules: Add management policy
CREATE POLICY "Form pricing rules are manageable by platform admins" ON public.form_pricing_rules
    FOR ALL
    USING (
        -- TODO: Add platform_admin check when implemented
        auth.role() = 'authenticated'
    );

-- Form Pricing Tiers: Add management policy
CREATE POLICY "Form pricing tiers are manageable by platform admins" ON public.form_pricing_tiers
    FOR ALL
    USING (
        -- TODO: Add platform_admin check when implemented
        auth.role() = 'authenticated'
    );

-- Form Steps: Add management policy
CREATE POLICY "Form steps are manageable by platform admins" ON public.form_steps
    FOR ALL
    USING (
        -- TODO: Add platform_admin check when implemented
        auth.role() = 'authenticated'
    );
