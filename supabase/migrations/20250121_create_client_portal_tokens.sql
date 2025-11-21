-- Migration: Create client_portal_tokens table
-- Purpose: Secure tokenized access for clients to view their matters
-- Phase: 12.7 - Client Portal

-- Create client_portal_tokens table
CREATE TABLE IF NOT EXISTS client_portal_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Token fields
  token VARCHAR(255) NOT NULL UNIQUE,
  token_hash VARCHAR(255) NOT NULL, -- HMAC hash for validation

  -- Expiry
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Usage tracking
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER NOT NULL DEFAULT 0,
  last_ip_address INET,

  -- Offer acceptance tracking
  offer_accepted_at TIMESTAMPTZ,
  offer_acceptance_ip INET,

  -- Purpose tracking
  purpose VARCHAR(100) NOT NULL DEFAULT 'matter_view', -- 'matter_view', 'offer_acceptance', etc.

  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_expiry CHECK (expires_at > created_at),
  CONSTRAINT valid_access_count CHECK (access_count >= 0)
);

-- Indexes for performance
CREATE INDEX idx_client_portal_tokens_tenant ON client_portal_tokens(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_client_portal_tokens_matter ON client_portal_tokens(matter_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_client_portal_tokens_client ON client_portal_tokens(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_client_portal_tokens_token ON client_portal_tokens(token) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX idx_client_portal_tokens_expires ON client_portal_tokens(expires_at) WHERE deleted_at IS NULL AND is_active = true;

-- Enable Row Level Security
ALTER TABLE client_portal_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_portal_tokens
-- Note: Token access is handled at API level, not RLS
-- Only internal staff can manage tokens

-- Policy: Select - Members can view tokens for their tenant
CREATE POLICY "client_portal_tokens_select"
  ON client_portal_tokens
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Policy: Insert - Members can create tokens for their tenant
CREATE POLICY "client_portal_tokens_insert"
  ON client_portal_tokens
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id
      FROM tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND role IN ('owner', 'admin', 'manager', 'member')
      AND deleted_at IS NULL
    )
  );

-- Policy: Update - Members can update tokens for their tenant
CREATE POLICY "client_portal_tokens_update"
  ON client_portal_tokens
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND role IN ('owner', 'admin', 'manager', 'member')
      AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Policy: Delete - Only admins/owners can hard delete (soft delete preferred)
CREATE POLICY "client_portal_tokens_delete"
  ON client_portal_tokens
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND role IN ('owner', 'admin')
      AND deleted_at IS NULL
    )
  );

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_client_portal_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at
CREATE TRIGGER client_portal_tokens_updated_at
  BEFORE UPDATE ON client_portal_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_client_portal_tokens_updated_at();

-- Function: Validate and get matter by token (for API use)
CREATE OR REPLACE FUNCTION get_matter_by_portal_token(
  p_token VARCHAR(255),
  p_ip_address INET DEFAULT NULL
)
RETURNS TABLE (
  matter_id UUID,
  client_id UUID,
  tenant_id UUID,
  token_id UUID,
  is_valid BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  v_token_record RECORD;
BEGIN
  -- Find active token
  SELECT
    cpt.id,
    cpt.matter_id,
    cpt.client_id,
    cpt.tenant_id,
    cpt.expires_at,
    cpt.is_active,
    cpt.access_count
  INTO v_token_record
  FROM client_portal_tokens cpt
  WHERE cpt.token = p_token
    AND cpt.deleted_at IS NULL
  LIMIT 1;

  -- Check if token exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT
      NULL::UUID, NULL::UUID, NULL::UUID, NULL::UUID,
      false,
      'Invalid token'::TEXT;
    RETURN;
  END IF;

  -- Check if token is active
  IF NOT v_token_record.is_active THEN
    RETURN QUERY SELECT
      NULL::UUID, NULL::UUID, NULL::UUID, NULL::UUID,
      false,
      'Token has been deactivated'::TEXT;
    RETURN;
  END IF;

  -- Check if token is expired
  IF v_token_record.expires_at < NOW() THEN
    -- Deactivate expired token
    UPDATE client_portal_tokens
    SET is_active = false
    WHERE id = v_token_record.id;

    RETURN QUERY SELECT
      NULL::UUID, NULL::UUID, NULL::UUID, NULL::UUID,
      false,
      'Token has expired'::TEXT;
    RETURN;
  END IF;

  -- Update access tracking
  UPDATE client_portal_tokens
  SET
    access_count = access_count + 1,
    last_accessed_at = NOW(),
    last_ip_address = p_ip_address
  WHERE id = v_token_record.id;

  -- Return valid token data
  RETURN QUERY SELECT
    v_token_record.matter_id,
    v_token_record.client_id,
    v_token_record.tenant_id,
    v_token_record.id,
    true,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Log offer acceptance via portal
CREATE OR REPLACE FUNCTION log_portal_offer_acceptance(
  p_token_id UUID,
  p_ip_address INET
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE client_portal_tokens
  SET
    offer_accepted_at = NOW(),
    offer_acceptance_ip = p_ip_address
  WHERE id = p_token_id
    AND deleted_at IS NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Revoke all tokens for a matter
CREATE OR REPLACE FUNCTION revoke_matter_portal_tokens(
  p_matter_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE client_portal_tokens
  SET is_active = false
  WHERE matter_id = p_matter_id
    AND deleted_at IS NULL
    AND is_active = true;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE client_portal_tokens IS 'Secure tokens for client portal access';
COMMENT ON COLUMN client_portal_tokens.token IS 'Unique token string (UUID v4)';
COMMENT ON COLUMN client_portal_tokens.token_hash IS 'HMAC hash for additional validation';
COMMENT ON COLUMN client_portal_tokens.expires_at IS 'Token expiration date (default: 30 days)';
COMMENT ON COLUMN client_portal_tokens.purpose IS 'Purpose of token: matter_view, offer_acceptance';
COMMENT ON FUNCTION get_matter_by_portal_token IS 'Validate token and return matter details';
COMMENT ON FUNCTION log_portal_offer_acceptance IS 'Log when client accepts offer via portal';
COMMENT ON FUNCTION revoke_matter_portal_tokens IS 'Revoke all active tokens for a matter';
