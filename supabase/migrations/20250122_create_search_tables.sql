-- ============================================================================
-- MIGRATION: Create Search Tables
-- Description: Tables for saved searches and recent searches
-- Date: 2025-11-22
-- Phase: Phase 9 - Search & Bulk Operations
-- ============================================================================

-- ============================================================================
-- SAVED SEARCHES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_created_at ON saved_searches(created_at DESC);

-- RLS Policies
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Users can only see their own saved searches
CREATE POLICY "Users can view their own saved searches"
  ON saved_searches FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own saved searches
CREATE POLICY "Users can create their own saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own saved searches
CREATE POLICY "Users can update their own saved searches"
  ON saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own saved searches
CREATE POLICY "Users can delete their own saved searches"
  ON saved_searches FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RECENT SEARCHES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS recent_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, query)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recent_searches_user_id ON recent_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_searches_searched_at ON recent_searches(searched_at DESC);

-- RLS Policies
ALTER TABLE recent_searches ENABLE ROW LEVEL SECURITY;

-- Users can only see their own recent searches
CREATE POLICY "Users can view their own recent searches"
  ON recent_searches FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own recent searches
CREATE POLICY "Users can create their own recent searches"
  ON recent_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own recent searches (for upsert)
CREATE POLICY "Users can update their own recent searches"
  ON recent_searches FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own recent searches
CREATE POLICY "Users can delete their own recent searches"
  ON recent_searches FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE saved_searches IS 'User saved search queries with filters';
COMMENT ON TABLE recent_searches IS 'User recent search history';

COMMENT ON COLUMN saved_searches.name IS 'User-defined name for the saved search';
COMMENT ON COLUMN saved_searches.query IS 'Search query string';
COMMENT ON COLUMN saved_searches.filters IS 'JSON object containing search filters';

COMMENT ON COLUMN recent_searches.query IS 'Recent search query string';
COMMENT ON COLUMN recent_searches.searched_at IS 'Timestamp of when the search was performed';
