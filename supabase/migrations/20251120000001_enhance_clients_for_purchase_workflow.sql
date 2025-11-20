-- Enhance clients table for Purchase Client Workflow (Phase 12)
-- Adds additional fields needed for purchase conveyancing matters

-- Add title field
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS title TEXT;

COMMENT ON COLUMN public.clients.title IS 'Title (Mr, Mrs, Ms, Dr, etc.)';

-- Add company name for business clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS company_name TEXT;

COMMENT ON COLUMN public.clients.company_name IS 'Company name for business/corporate clients';

-- Add mobile phone (separate from phone)
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS mobile TEXT;

COMMENT ON COLUMN public.clients.mobile IS 'Mobile phone number';

-- Add preferred contact method
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'email';

COMMENT ON COLUMN public.clients.preferred_contact_method IS 'Preferred contact method: email, phone, mobile';

-- Add date of birth for ID verification
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

COMMENT ON COLUMN public.clients.date_of_birth IS 'Date of birth for ID verification';

-- Add National Insurance number
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS national_insurance_number TEXT;

COMMENT ON COLUMN public.clients.national_insurance_number IS 'National Insurance number (UK)';

-- Add passport number
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS passport_number TEXT;

COMMENT ON COLUMN public.clients.passport_number IS 'Passport number for ID verification';

-- Add updated_by tracking
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN public.clients.updated_by IS 'User who last updated this record';

-- Add check constraint for client_type values
ALTER TABLE public.clients
  DROP CONSTRAINT IF EXISTS clients_client_type_check;

ALTER TABLE public.clients
  ADD CONSTRAINT clients_client_type_check
  CHECK (client_type IS NULL OR client_type IN ('individual', 'couple', 'company', 'estate', 'business'));

-- Add check constraint for preferred_contact_method
ALTER TABLE public.clients
  ADD CONSTRAINT clients_preferred_contact_method_check
  CHECK (preferred_contact_method IN ('email', 'phone', 'mobile'));

-- Add index for company name (for business client searches)
CREATE INDEX IF NOT EXISTS idx_clients_company_name
  ON public.clients(company_name)
  WHERE deleted_at IS NULL AND company_name IS NOT NULL;

-- Add index for date of birth (for age-based segmentation)
CREATE INDEX IF NOT EXISTS idx_clients_date_of_birth
  ON public.clients(date_of_birth)
  WHERE deleted_at IS NULL AND date_of_birth IS NOT NULL;

-- Update table comment
COMMENT ON TABLE public.clients IS 'Client contact information and relationship management (enhanced for Purchase Workflow)';
