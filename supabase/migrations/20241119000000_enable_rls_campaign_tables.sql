-- Enable Row Level Security on all campaign tables
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CAMPAIGNS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view campaigns from their tenant
CREATE POLICY "Users can view campaigns from their tenant"
ON campaigns
FOR SELECT
USING (
  tenant_id IN (
    SELECT tenant_id
    FROM tenant_membershipships
    WHERE user_id = auth.uid()
  )
);

-- Policy: Owners and admins can create campaigns
CREATE POLICY "Owners and admins can create campaigns"
ON campaigns
FOR INSERT
WITH CHECK (
  tenant_id IN (
    SELECT tenant_id
    FROM tenant_membershipships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- Policy: Owners and admins can update campaigns
CREATE POLICY "Owners and admins can update campaigns"
ON campaigns
FOR UPDATE
USING (
  tenant_id IN (
    SELECT tenant_id
    FROM tenant_memberships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- Policy: Owners can delete campaigns
CREATE POLICY "Owners can delete campaigns"
ON campaigns
FOR DELETE
USING (
  tenant_id IN (
    SELECT tenant_id
    FROM tenant_memberships
    WHERE user_id = auth.uid()
    AND role = 'owner'
  )
);

-- ============================================================================
-- EMAIL_TEMPLATES TABLE POLICIES
-- ============================================================================

-- Policy: Users can view templates from their tenant's campaigns
CREATE POLICY "Users can view templates from their tenant"
ON email_templates
FOR SELECT
USING (
  campaign_id IN (
    SELECT id
    FROM campaigns
    WHERE tenant_id IN (
      SELECT tenant_id
      FROM tenant_memberships
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy: Owners and admins can create templates
CREATE POLICY "Owners and admins can create templates"
ON email_templates
FOR INSERT
WITH CHECK (
  campaign_id IN (
    SELECT id
    FROM campaigns
    WHERE tenant_id IN (
      SELECT tenant_id
      FROM tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  )
);

-- Policy: Owners and admins can update templates
CREATE POLICY "Owners and admins can update templates"
ON email_templates
FOR UPDATE
USING (
  campaign_id IN (
    SELECT id
    FROM campaigns
    WHERE tenant_id IN (
      SELECT tenant_id
      FROM tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  )
);

-- Policy: Owners and admins can delete templates
CREATE POLICY "Owners and admins can delete templates"
ON email_templates
FOR DELETE
USING (
  campaign_id IN (
    SELECT id
    FROM campaigns
    WHERE tenant_id IN (
      SELECT tenant_id
      FROM tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  )
);

-- ============================================================================
-- CAMPAIGN_TRIGGERS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view triggers from their tenant's campaigns
CREATE POLICY "Users can view triggers from their tenant"
ON campaign_triggers
FOR SELECT
USING (
  campaign_id IN (
    SELECT id
    FROM campaigns
    WHERE tenant_id IN (
      SELECT tenant_id
      FROM tenant_memberships
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy: Owners and admins can manage triggers
CREATE POLICY "Owners and admins can manage triggers"
ON campaign_triggers
FOR ALL
USING (
  campaign_id IN (
    SELECT id
    FROM campaigns
    WHERE tenant_id IN (
      SELECT tenant_id
      FROM tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  )
);

-- ============================================================================
-- EMAIL_QUEUE TABLE POLICIES
-- ============================================================================

-- Policy: Users can view email queue from their tenant
CREATE POLICY "Users can view email queue from their tenant"
ON email_queue
FOR SELECT
USING (
  campaign_id IN (
    SELECT id
    FROM campaigns
    WHERE tenant_id IN (
      SELECT tenant_id
      FROM tenant_memberships
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy: System can insert into email queue (for automation)
CREATE POLICY "System can insert into email queue"
ON email_queue
FOR INSERT
WITH CHECK (true);

-- Policy: System can update email queue (for processing)
CREATE POLICY "System can update email queue"
ON email_queue
FOR UPDATE
USING (true);

-- Policy: Owners and admins can delete from queue
CREATE POLICY "Owners and admins can delete from queue"
ON email_queue
FOR DELETE
USING (
  campaign_id IN (
    SELECT id
    FROM campaigns
    WHERE tenant_id IN (
      SELECT tenant_id
      FROM tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  )
);

-- ============================================================================
-- EMAIL_HISTORY TABLE POLICIES
-- ============================================================================

-- Policy: Users can view email history from their tenant
CREATE POLICY "Users can view email history from their tenant"
ON email_history
FOR SELECT
USING (
  campaign_id IN (
    SELECT id
    FROM campaigns
    WHERE tenant_id IN (
      SELECT tenant_id
      FROM tenant_memberships
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy: System can insert into email history (for tracking)
CREATE POLICY "System can insert into email history"
ON email_history
FOR INSERT
WITH CHECK (true);

-- Policy: System can update email history (for webhook updates)
CREATE POLICY "System can update email history"
ON email_history
FOR UPDATE
USING (true);

-- ============================================================================
-- CAMPAIGN_SUBSCRIBERS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view subscribers from their tenant's campaigns
CREATE POLICY "Users can view subscribers from their tenant"
ON campaign_subscribers
FOR SELECT
USING (
  campaign_id IN (
    SELECT id
    FROM campaigns
    WHERE tenant_id IN (
      SELECT tenant_id
      FROM tenant_memberships
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy: Owners and admins can manage subscribers
CREATE POLICY "Owners and admins can manage subscribers"
ON campaign_subscribers
FOR ALL
USING (
  campaign_id IN (
    SELECT id
    FROM campaigns
    WHERE tenant_id IN (
      SELECT tenant_id
      FROM tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  )
);

-- ============================================================================
-- CAMPAIGN_ANALYTICS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view analytics from their tenant's campaigns
CREATE POLICY "Users can view analytics from their tenant"
ON campaign_analytics
FOR SELECT
USING (
  campaign_id IN (
    SELECT id
    FROM campaigns
    WHERE tenant_id IN (
      SELECT tenant_id
      FROM tenant_memberships
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy: System can insert/update analytics (for automation)
CREATE POLICY "System can insert analytics"
ON campaign_analytics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update analytics"
ON campaign_analytics
FOR UPDATE
USING (true);

-- ============================================================================
-- GRANT PERMISSIONS TO SERVICE ROLE
-- ============================================================================
-- This allows the cron job and webhooks to bypass RLS when using service role key

GRANT ALL ON campaigns TO service_role;
GRANT ALL ON email_templates TO service_role;
GRANT ALL ON campaign_triggers TO service_role;
GRANT ALL ON email_queue TO service_role;
GRANT ALL ON email_history TO service_role;
GRANT ALL ON campaign_subscribers TO service_role;
GRANT ALL ON campaign_analytics TO service_role;
