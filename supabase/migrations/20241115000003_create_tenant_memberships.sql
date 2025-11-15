-- Create tenant_memberships table
-- Many-to-many relationship between users and tenants with roles

CREATE TABLE IF NOT EXISTS public.tenant_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Role and permissions
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),

    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
    invited_by UUID REFERENCES auth.users(id),
    invitation_token TEXT,
    invitation_expires_at TIMESTAMP WITH TIME ZONE,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Unique constraint: one membership per user per tenant
    CONSTRAINT tenant_memberships_unique UNIQUE (tenant_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_tenant_id ON public.tenant_memberships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user_id ON public.tenant_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_role ON public.tenant_memberships(role);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_status ON public.tenant_memberships(status);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_deleted_at ON public.tenant_memberships(deleted_at) WHERE deleted_at IS NULL;

-- Updated at trigger
CREATE TRIGGER set_updated_at_tenant_memberships
    BEFORE UPDATE ON public.tenant_memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security
ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Memberships are viewable by tenant members" ON public.tenant_memberships
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_memberships.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Memberships are insertable by tenant admins" ON public.tenant_memberships
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
        AND
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin')
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Memberships are updatable by tenant admins" ON public.tenant_memberships
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_memberships.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin')
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_memberships.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin')
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Memberships are deletable by tenant owners" ON public.tenant_memberships
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_memberships.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role = 'owner'
            AND tm.status = 'active'
        )
    );

COMMENT ON TABLE public.tenant_memberships IS 'User memberships in tenant organizations with role-based access';
COMMENT ON COLUMN public.tenant_memberships.role IS 'User role: owner (full control), admin (manage users), manager (manage quotes), member (create quotes), viewer (read-only)';
COMMENT ON COLUMN public.tenant_memberships.status IS 'Membership status: active, invited (pending acceptance), suspended';
