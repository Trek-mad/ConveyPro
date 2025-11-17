-- Create clients table for Client Management System
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Basic Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postcode TEXT,
  country TEXT DEFAULT 'Scotland',

  -- Client Classification (for cross-selling)
  client_type TEXT, -- 'individual', 'couple', 'business', 'estate'
  life_stage TEXT, -- 'first-time-buyer', 'moving-up', 'downsizing', 'investor', 'retired'

  -- Tracking
  source TEXT, -- 'website', 'referral', 'repeat', 'marketing'
  tags TEXT[], -- ['first-time-buyer', 'mortgage', 'young-professional']
  notes TEXT,

  -- Services Used (for cross-sell opportunities)
  services_used JSONB DEFAULT '[]'::jsonb, -- ['purchase', 'sale', 'will', 'poa']

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ
);

-- Add index for tenant lookups
CREATE INDEX idx_clients_tenant_id ON public.clients(tenant_id) WHERE deleted_at IS NULL;

-- Add index for email lookups
CREATE INDEX idx_clients_email ON public.clients(email) WHERE deleted_at IS NULL;

-- Add index for search
CREATE INDEX idx_clients_name ON public.clients(first_name, last_name) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Clients are viewable by tenant members"
  ON public.clients
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Clients are insertable by tenant members"
  ON public.clients
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Clients are updatable by tenant members"
  ON public.clients
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Clients are deletable by tenant admins"
  ON public.clients
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

-- Add client_id to quotes table
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Create index for client quotes lookup
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON public.quotes(client_id) WHERE deleted_at IS NULL;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_clients_updated_at_trigger
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION update_clients_updated_at();

-- Comments
COMMENT ON TABLE public.clients IS 'Client contact information and relationship management';
COMMENT ON COLUMN public.clients.life_stage IS 'Client life stage for cross-sell targeting';
COMMENT ON COLUMN public.clients.services_used IS 'Array of services client has used (for cross-sell opportunities)';
