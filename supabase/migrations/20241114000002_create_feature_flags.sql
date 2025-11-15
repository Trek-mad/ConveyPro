-- Create feature_flags table
-- Purpose: Enable/disable features per tenant for gradual rollouts and A/B testing
-- This allows safe feature deployment and easy rollback without code changes

CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    flag_name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT false NOT NULL,
    metadata JSONB,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID,

    -- Ensure unique flag per tenant
    CONSTRAINT feature_flags_tenant_flag_unique UNIQUE (tenant_id, flag_name)
);

-- Add index for faster tenant lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_tenant_id
    ON public.feature_flags(tenant_id);

-- Add index for flag_name lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_flag_name
    ON public.feature_flags(flag_name);

-- Add index for enabled flags (common query pattern)
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled
    ON public.feature_flags(tenant_id, enabled)
    WHERE enabled = true;

-- Add updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies (TODO: Update when auth is implemented in Phase 2+)
-- For now, allow all operations - will be restricted per tenant later
CREATE POLICY "Enable all access for now"
    ON public.feature_flags
    FOR ALL
    USING (true);

-- Add comments for documentation
COMMENT ON TABLE public.feature_flags IS 'Per-tenant feature toggles for gradual rollouts and A/B testing';
COMMENT ON COLUMN public.feature_flags.flag_name IS 'Feature identifier (e.g., "enable_cross_sell", "new_quote_ui")';
COMMENT ON COLUMN public.feature_flags.enabled IS 'Whether the feature is enabled for this tenant';
COMMENT ON COLUMN public.feature_flags.metadata IS 'Optional metadata (e.g., rollout percentage, test group)';

-- Insert some example feature flags (commented out - uncomment when needed)
-- INSERT INTO public.feature_flags (tenant_id, flag_name, enabled, metadata) VALUES
--   ('00000000-0000-0000-0000-000000000000', 'enable_cross_sell', false, '{"rollout_percentage": 0}'),
--   ('00000000-0000-0000-0000-000000000000', 'enable_analytics', true, '{}');
