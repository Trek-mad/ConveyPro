-- Create tenants table
-- Represents solicitor firms in the multi-tenant system

CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,

    -- Contact information
    email TEXT,
    phone TEXT,
    website TEXT,

    -- Address
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    postcode TEXT,
    country TEXT DEFAULT 'Scotland',

    -- Status and metadata
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
    subscription_tier TEXT DEFAULT 'standard' CHECK (subscription_tier IN ('trial', 'standard', 'professional', 'enterprise')),

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_deleted_at ON public.tenants(deleted_at) WHERE deleted_at IS NULL;

-- Updated at trigger
CREATE TRIGGER set_updated_at_tenants
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- RLS Policies (to be refined when auth is implemented)
CREATE POLICY "Tenants are viewable by members" ON public.tenants
    FOR SELECT
    USING (true); -- TODO: Restrict to tenant members in Phase 2

CREATE POLICY "Tenants are insertable by authenticated users" ON public.tenants
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Tenants are updatable by tenant admins" ON public.tenants
    FOR UPDATE
    USING (true) -- TODO: Restrict to tenant admins in Phase 2
    WITH CHECK (true);

COMMENT ON TABLE public.tenants IS 'Solicitor firms using the ConveyPro platform';
COMMENT ON COLUMN public.tenants.slug IS 'URL-friendly unique identifier for the tenant';
COMMENT ON COLUMN public.tenants.subscription_tier IS 'Subscription level determining feature access';
