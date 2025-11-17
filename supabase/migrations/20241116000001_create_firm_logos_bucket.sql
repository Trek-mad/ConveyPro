-- Create storage bucket for firm logos
-- Purpose: Store tenant logos and branding assets

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'firm-logos',
  'firm-logos',
  true, -- Public bucket so logos can be displayed
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload logos for their tenant
CREATE POLICY "Tenant admins can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'firm-logos'
  AND (storage.foldername(name))[1] IN (
    SELECT tenant_id::text FROM public.tenant_memberships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND status = 'active'
  )
);

-- Allow authenticated users to update their tenant's logos
CREATE POLICY "Tenant admins can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'firm-logos'
  AND (storage.foldername(name))[1] IN (
    SELECT tenant_id::text FROM public.tenant_memberships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND status = 'active'
  )
);

-- Allow authenticated users to delete their tenant's logos
CREATE POLICY "Tenant admins can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'firm-logos'
  AND (storage.foldername(name))[1] IN (
    SELECT tenant_id::text FROM public.tenant_memberships
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND status = 'active'
  )
);

-- Allow everyone to view logos (public bucket)
CREATE POLICY "Anyone can view logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'firm-logos');

-- Add comment
COMMENT ON POLICY "Tenant admins can upload logos" ON storage.objects IS 'Allow tenant owners and admins to upload logos to their tenant folder';
COMMENT ON POLICY "Anyone can view logos" ON storage.objects IS 'Logos are public for display on quotes and emails';
