-- Create tenant_settings table
-- Purpose: Store per-tenant configuration as key-value pairs with JSONB values
-- This allows flexible tenant customization without schema changes

CREATE TABLE IF NOT EXISTS public.tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID,

    -- Ensure unique key per tenant
    CONSTRAINT tenant_settings_tenant_key_unique UNIQUE (tenant_id, key)
);

-- Add index for faster tenant lookups
CREATE INDEX IF NOT EXISTS idx_tenant_settings_tenant_id
    ON public.tenant_settings(tenant_id);

-- Add index for key lookups
CREATE INDEX IF NOT EXISTS idx_tenant_settings_key
    ON public.tenant_settings(key);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.tenant_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (TODO: Update when auth is implemented in Phase 2+)
-- For now, allow all operations - will be restricted per tenant later
CREATE POLICY "Enable all access for now"
    ON public.tenant_settings
    FOR ALL
    USING (true);

-- Add comments for documentation
COMMENT ON TABLE public.tenant_settings IS 'Stores per-tenant configuration settings as flexible key-value pairs';
COMMENT ON COLUMN public.tenant_settings.key IS 'Setting key (e.g., "branding_color", "email_signature")';
COMMENT ON COLUMN public.tenant_settings.value IS 'JSONB value allowing complex nested structures';
