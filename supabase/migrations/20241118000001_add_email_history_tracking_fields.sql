-- Add additional tracking fields to email_history table for SendGrid webhooks

ALTER TABLE email_history
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS bounce_reason TEXT,
ADD COLUMN IF NOT EXISTS bounce_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS spam_reported_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;

-- Add index for bounce tracking
CREATE INDEX IF NOT EXISTS idx_email_history_bounced ON email_history(bounced_at) WHERE bounced_at IS NOT NULL;

-- Add index for spam reports
CREATE INDEX IF NOT EXISTS idx_email_history_spam ON email_history(spam_reported_at) WHERE spam_reported_at IS NOT NULL;

-- Comment the new columns
COMMENT ON COLUMN email_history.delivered_at IS 'Timestamp when email was successfully delivered';
COMMENT ON COLUMN email_history.bounced_at IS 'Timestamp when email bounced';
COMMENT ON COLUMN email_history.bounce_reason IS 'Reason for email bounce';
COMMENT ON COLUMN email_history.bounce_type IS 'Type of bounce (hard, soft, dropped)';
COMMENT ON COLUMN email_history.spam_reported_at IS 'Timestamp when email was marked as spam';
COMMENT ON COLUMN email_history.unsubscribed_at IS 'Timestamp when recipient unsubscribed from this email';
