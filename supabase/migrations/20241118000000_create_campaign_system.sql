-- =====================================================
-- Phase 3: Automated Cross-Selling Campaign System
-- =====================================================
-- Creates tables for email automation, campaigns, triggers, and analytics

-- =====================================================
-- 1. CAMPAIGNS TABLE
-- =====================================================
-- Stores campaign definitions (e.g., "Wills for Property Buyers")
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Campaign details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) NOT NULL, -- 'wills', 'power_of_attorney', 'estate_planning', 'remortgage', 'custom'
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed', 'archived'

  -- Targeting
  target_life_stages TEXT[], -- ['first-time-buyer', 'moving-up', 'investor', 'retired', 'downsizing']
  target_client_types TEXT[], -- ['individual', 'couple', 'business', 'estate']
  target_services_used TEXT[], -- Services client has already used

  -- Settings
  send_delay_days INTEGER DEFAULT 0, -- Days to wait after trigger before sending
  max_emails_per_campaign INTEGER DEFAULT 5, -- Max emails in this campaign sequence

  -- Metrics
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_converted INTEGER DEFAULT 0,
  estimated_revenue DECIMAL(10, 2) DEFAULT 0,

  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ, -- When campaign was activated
  ended_at TIMESTAMPTZ, -- When campaign was completed/archived

  CONSTRAINT campaigns_tenant_name_unique UNIQUE(tenant_id, name)
);

-- Indexes
CREATE INDEX idx_campaigns_tenant ON campaigns(tenant_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_type ON campaigns(campaign_type);

-- =====================================================
-- 2. EMAIL TEMPLATES TABLE
-- =====================================================
-- Stores email templates with variables for personalization
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Template details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sequence_order INTEGER DEFAULT 1, -- Order in campaign sequence (1st email, 2nd email, etc.)

  -- Email content
  subject_line VARCHAR(500) NOT NULL,
  preview_text VARCHAR(255), -- Email preview text
  body_html TEXT NOT NULL, -- HTML email body
  body_text TEXT, -- Plain text fallback

  -- Variables available: {{client_name}}, {{firm_name}}, {{service_name}}, {{quote_value}}, etc.
  -- Personalization
  from_name VARCHAR(255), -- Override default sender name
  from_email VARCHAR(255), -- Override default sender email
  reply_to VARCHAR(255),

  -- Settings
  send_delay_days INTEGER DEFAULT 0, -- Days after previous email (for sequences)
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT email_templates_campaign_sequence_unique UNIQUE(campaign_id, sequence_order)
);

-- Indexes
CREATE INDEX idx_email_templates_tenant ON email_templates(tenant_id);
CREATE INDEX idx_email_templates_campaign ON email_templates(campaign_id);
CREATE INDEX idx_email_templates_active ON email_templates(is_active);

-- =====================================================
-- 3. CAMPAIGN TRIGGERS TABLE
-- =====================================================
-- Defines when campaigns should be triggered
CREATE TABLE IF NOT EXISTS campaign_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Trigger definition
  trigger_type VARCHAR(50) NOT NULL, -- 'quote_accepted', 'quote_sent', 'client_created', 'service_completed', 'date_based', 'manual'
  trigger_condition JSONB, -- Additional conditions (e.g., {"quote_value": ">= 50000"})

  -- Settings
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1, -- Higher priority triggers fire first

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_campaign_triggers_tenant ON campaign_triggers(tenant_id);
CREATE INDEX idx_campaign_triggers_campaign ON campaign_triggers(campaign_id);
CREATE INDEX idx_campaign_triggers_type ON campaign_triggers(trigger_type);
CREATE INDEX idx_campaign_triggers_active ON campaign_triggers(is_active);

-- =====================================================
-- 4. EMAIL QUEUE TABLE
-- =====================================================
-- Emails scheduled to be sent
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,

  -- Email details
  to_email VARCHAR(255) NOT NULL,
  to_name VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,

  -- Metadata
  personalization_data JSONB, -- Data used for variable replacement

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL, -- When to send
  sent_at TIMESTAMPTZ, -- When actually sent

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sending', 'sent', 'failed', 'cancelled'
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Tracking
  sendgrid_message_id VARCHAR(255), -- External email service ID

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_email_queue_tenant ON email_queue(tenant_id);
CREATE INDEX idx_email_queue_campaign ON email_queue(campaign_id);
CREATE INDEX idx_email_queue_client ON email_queue(client_id);
CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_scheduled ON email_queue(scheduled_for) WHERE status = 'pending';

-- =====================================================
-- 5. EMAIL HISTORY TABLE
-- =====================================================
-- Complete history of all sent emails with engagement tracking
CREATE TABLE IF NOT EXISTS email_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  queue_id UUID REFERENCES email_queue(id) ON DELETE SET NULL,

  -- Email details
  to_email VARCHAR(255) NOT NULL,
  to_name VARCHAR(255),
  subject VARCHAR(500) NOT NULL,

  -- Engagement tracking
  sent_at TIMESTAMPTZ NOT NULL,
  opened_at TIMESTAMPTZ, -- First open
  open_count INTEGER DEFAULT 0,
  last_opened_at TIMESTAMPTZ,

  clicked_at TIMESTAMPTZ, -- First click
  click_count INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,

  -- Conversion tracking
  converted_at TIMESTAMPTZ, -- When client took desired action
  conversion_value DECIMAL(10, 2), -- Revenue from conversion
  conversion_type VARCHAR(50), -- 'quote_requested', 'service_booked', etc.

  -- Bounces and errors
  bounced BOOLEAN DEFAULT false,
  bounce_type VARCHAR(50), -- 'hard', 'soft', 'spam'
  unsubscribed BOOLEAN DEFAULT false,
  unsubscribed_at TIMESTAMPTZ,

  -- Metadata
  sendgrid_message_id VARCHAR(255),
  metadata JSONB, -- Additional tracking data

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_email_history_tenant ON email_history(tenant_id);
CREATE INDEX idx_email_history_campaign ON email_history(campaign_id);
CREATE INDEX idx_email_history_client ON email_history(client_id);
CREATE INDEX idx_email_history_sent ON email_history(sent_at DESC);
CREATE INDEX idx_email_history_opened ON email_history(opened_at) WHERE opened_at IS NOT NULL;
CREATE INDEX idx_email_history_converted ON email_history(converted_at) WHERE converted_at IS NOT NULL;

-- =====================================================
-- 6. CAMPAIGN SUBSCRIBERS TABLE
-- =====================================================
-- Tracks which clients are enrolled in which campaigns
CREATE TABLE IF NOT EXISTS campaign_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'completed', 'unsubscribed'
  current_email_sequence INTEGER DEFAULT 0, -- Which email in sequence they're on

  -- Metrics
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  converted BOOLEAN DEFAULT false,
  conversion_value DECIMAL(10, 2),

  -- Dates
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,

  -- Metadata
  enrollment_source VARCHAR(50), -- 'automatic', 'manual', 'trigger'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT campaign_subscribers_unique UNIQUE(campaign_id, client_id)
);

-- Indexes
CREATE INDEX idx_campaign_subscribers_tenant ON campaign_subscribers(tenant_id);
CREATE INDEX idx_campaign_subscribers_campaign ON campaign_subscribers(campaign_id);
CREATE INDEX idx_campaign_subscribers_client ON campaign_subscribers(client_id);
CREATE INDEX idx_campaign_subscribers_status ON campaign_subscribers(status);

-- =====================================================
-- 7. CAMPAIGN ANALYTICS TABLE
-- =====================================================
-- Daily aggregated analytics for campaigns
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Date
  analytics_date DATE NOT NULL,

  -- Metrics
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,

  -- Conversions
  conversions INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10, 2) DEFAULT 0,

  -- Subscriber changes
  new_subscribers INTEGER DEFAULT 0,
  unsubscribers INTEGER DEFAULT 0,

  -- Rates (calculated)
  open_rate DECIMAL(5, 2), -- Percentage
  click_rate DECIMAL(5, 2),
  conversion_rate DECIMAL(5, 2),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT campaign_analytics_unique UNIQUE(campaign_id, analytics_date)
);

-- Indexes
CREATE INDEX idx_campaign_analytics_tenant ON campaign_analytics(tenant_id);
CREATE INDEX idx_campaign_analytics_campaign ON campaign_analytics(campaign_id);
CREATE INDEX idx_campaign_analytics_date ON campaign_analytics(analytics_date DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
CREATE POLICY "Users can view campaigns in their tenant"
  ON campaigns FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage campaigns"
  ON campaigns FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Email templates policies
CREATE POLICY "Users can view templates in their tenant"
  ON email_templates FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage templates"
  ON email_templates FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Campaign triggers policies
CREATE POLICY "Users can view triggers in their tenant"
  ON campaign_triggers FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage triggers"
  ON campaign_triggers FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Email queue policies
CREATE POLICY "Users can view queue in their tenant"
  ON email_queue FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships
      WHERE user_id = auth.uid()
    )
  );

-- Email history policies
CREATE POLICY "Users can view history in their tenant"
  ON email_history FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships
      WHERE user_id = auth.uid()
    )
  );

-- Campaign subscribers policies
CREATE POLICY "Users can view subscribers in their tenant"
  ON campaign_subscribers FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage subscribers"
  ON campaign_subscribers FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Campaign analytics policies
CREATE POLICY "Users can view analytics in their tenant"
  ON campaign_analytics FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Campaigns
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_updated_at();

-- Email templates
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();

-- Campaign triggers
CREATE OR REPLACE FUNCTION update_campaign_triggers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_campaign_triggers_updated_at
  BEFORE UPDATE ON campaign_triggers
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_triggers_updated_at();

-- Email queue
CREATE OR REPLACE FUNCTION update_email_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_email_queue_updated_at
  BEFORE UPDATE ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_email_queue_updated_at();

-- Campaign subscribers
CREATE OR REPLACE FUNCTION update_campaign_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_campaign_subscribers_updated_at
  BEFORE UPDATE ON campaign_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_subscribers_updated_at();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Composite indexes for common queries
CREATE INDEX idx_email_queue_pending_scheduled ON email_queue(tenant_id, status, scheduled_for)
  WHERE status = 'pending';

CREATE INDEX idx_email_history_campaign_date ON email_history(campaign_id, sent_at DESC);

CREATE INDEX idx_campaign_subscribers_active ON campaign_subscribers(campaign_id, status)
  WHERE status = 'active';

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE campaigns IS 'Email marketing campaigns for cross-selling services';
COMMENT ON TABLE email_templates IS 'Email templates with personalization variables';
COMMENT ON TABLE campaign_triggers IS 'Automation triggers for starting campaigns';
COMMENT ON TABLE email_queue IS 'Scheduled emails waiting to be sent';
COMMENT ON TABLE email_history IS 'Complete history of sent emails with engagement tracking';
COMMENT ON TABLE campaign_subscribers IS 'Clients enrolled in campaigns';
COMMENT ON TABLE campaign_analytics IS 'Daily aggregated campaign performance metrics';

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Function to increment campaign metrics atomically
CREATE OR REPLACE FUNCTION increment_campaign_metric(
  p_campaign_id UUID,
  p_metric TEXT
)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('
    UPDATE campaigns
    SET %I = %I + 1
    WHERE id = $1
  ', p_metric, p_metric)
  USING p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
