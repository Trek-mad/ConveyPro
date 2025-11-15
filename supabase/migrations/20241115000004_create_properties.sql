-- Create properties table
-- Property information for conveyancing quotes

CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Property identification
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    postcode TEXT NOT NULL,
    country TEXT DEFAULT 'Scotland',

    -- Property details
    property_type TEXT CHECK (property_type IN ('residential', 'commercial', 'land', 'mixed')),
    tenure TEXT CHECK (tenure IN ('freehold', 'leasehold', 'commonhold')),
    bedrooms INTEGER,
    bathrooms INTEGER,
    floor_area_sqm DECIMAL(10,2),

    -- Valuation
    estimated_value DECIMAL(12,2),
    purchase_price DECIMAL(12,2),

    -- Legal identifiers
    title_number TEXT,
    uprn TEXT, -- Unique Property Reference Number

    -- Additional data
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_properties_tenant_id ON public.properties(tenant_id);
CREATE INDEX IF NOT EXISTS idx_properties_postcode ON public.properties(postcode);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_title_number ON public.properties(title_number);
CREATE INDEX IF NOT EXISTS idx_properties_deleted_at ON public.properties(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_properties_metadata ON public.properties USING gin(metadata);

-- Updated at trigger
CREATE TRIGGER set_updated_at_properties
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Properties are viewable by tenant members" ON public.properties
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = properties.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Properties are insertable by tenant members" ON public.properties
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin', 'manager', 'member')
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Properties are updatable by tenant members" ON public.properties
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = properties.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin', 'manager', 'member')
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = properties.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin', 'manager', 'member')
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Properties are deletable by tenant managers and above" ON public.properties
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = properties.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin', 'manager')
            AND tm.status = 'active'
        )
    );

COMMENT ON TABLE public.properties IS 'Property information for conveyancing quotes';
COMMENT ON COLUMN public.properties.uprn IS 'Unique Property Reference Number from Ordnance Survey';
COMMENT ON COLUMN public.properties.tenure IS 'Type of property ownership';
