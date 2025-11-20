-- Create documents table for Purchase Client Workflow (Phase 12)
-- Document storage metadata with Supabase Storage integration

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Document Identity
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Relationships
  matter_id UUID REFERENCES public.matters(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,

  -- Storage Details
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,

  -- Versioning
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  is_latest_version BOOLEAN DEFAULT true,

  -- Status & Verification
  status TEXT DEFAULT 'uploaded',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Categorization
  tags TEXT[],

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT documents_document_type_check CHECK (document_type IN (
    'home_report',
    'financial_questionnaire',
    'offer_letter',
    'id_document',
    'bank_statement',
    'mortgage_in_principle',
    'survey',
    'contract',
    'searches',
    'title_deed',
    'other'
  )),
  CONSTRAINT documents_status_check CHECK (status IN ('uploaded', 'verified', 'rejected', 'archived'))
);

-- Indexes
CREATE INDEX idx_documents_matter
  ON public.documents(matter_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_documents_client
  ON public.documents(client_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_documents_property
  ON public.documents(property_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_documents_tenant
  ON public.documents(tenant_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_documents_type
  ON public.documents(tenant_id, document_type)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_documents_latest
  ON public.documents(matter_id, document_type, is_latest_version)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_documents_uploaded_by
  ON public.documents(uploaded_by)
  WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Documents are viewable by tenant members"
  ON public.documents
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Documents are insertable by tenant members"
  ON public.documents
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'member')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Documents are updatable by tenant members"
  ON public.documents
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'member')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Documents are deletable by tenant managers"
  ON public.documents
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager')
      AND status = 'active'
      AND deleted_at IS NULL
    )
  );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_documents_updated_at_trigger
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();

-- Function to manage document versioning
CREATE OR REPLACE FUNCTION manage_document_versioning()
RETURNS TRIGGER AS $$
BEGIN
  -- If uploading a new version of an existing document
  IF NEW.previous_version_id IS NOT NULL THEN
    -- Mark previous version as no longer latest
    UPDATE public.documents
    SET is_latest_version = false
    WHERE id = NEW.previous_version_id;

    -- Increment version number
    SELECT version + 1 INTO NEW.version
    FROM public.documents
    WHERE id = NEW.previous_version_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for versioning
CREATE TRIGGER manage_document_versioning_trigger
  BEFORE INSERT ON public.documents
  FOR EACH ROW
  WHEN (NEW.previous_version_id IS NOT NULL)
  EXECUTE FUNCTION manage_document_versioning();

-- Create Supabase Storage bucket for matter documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'matter-documents',
  'matter-documents',
  false, -- Private bucket
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for matter-documents bucket
CREATE POLICY "Matter documents are viewable by tenant members"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'matter-documents'
    AND (storage.foldername(name))[1] IN (
      SELECT t.id::TEXT
      FROM public.tenants t
      INNER JOIN public.tenant_memberships tm ON t.id = tm.tenant_id
      WHERE tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.deleted_at IS NULL
    )
  );

CREATE POLICY "Matter documents are uploadable by tenant members"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'matter-documents'
    AND (storage.foldername(name))[1] IN (
      SELECT t.id::TEXT
      FROM public.tenants t
      INNER JOIN public.tenant_memberships tm ON t.id = tm.tenant_id
      WHERE tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin', 'manager', 'member')
      AND tm.status = 'active'
      AND tm.deleted_at IS NULL
    )
  );

CREATE POLICY "Matter documents are updatable by tenant members"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'matter-documents'
    AND (storage.foldername(name))[1] IN (
      SELECT t.id::TEXT
      FROM public.tenants t
      INNER JOIN public.tenant_memberships tm ON t.id = tm.tenant_id
      WHERE tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin', 'manager', 'member')
      AND tm.status = 'active'
      AND tm.deleted_at IS NULL
    )
  );

CREATE POLICY "Matter documents are deletable by tenant managers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'matter-documents'
    AND (storage.foldername(name))[1] IN (
      SELECT t.id::TEXT
      FROM public.tenants t
      INNER JOIN public.tenant_memberships tm ON t.id = tm.tenant_id
      WHERE tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin', 'manager')
      AND tm.status = 'active'
      AND tm.deleted_at IS NULL
    )
  );

-- Comments
COMMENT ON TABLE public.documents IS 'Document storage metadata with Supabase Storage integration';
COMMENT ON COLUMN public.documents.storage_path IS 'Path in Supabase Storage bucket (format: tenant_id/matter_id/filename)';
COMMENT ON COLUMN public.documents.version IS 'Document version number (auto-incremented)';
COMMENT ON COLUMN public.documents.is_latest_version IS 'True if this is the latest version of the document';
COMMENT ON COLUMN public.documents.document_type IS 'Category of document for filtering and workflows';
