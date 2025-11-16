-- Create quotes table
-- Conveyancing quotes for property transactions

CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,

    -- Quote identification
    quote_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (
        status IN ('draft', 'pending', 'sent', 'accepted', 'rejected', 'expired', 'cancelled')
    ),

    -- Transaction details
    transaction_type TEXT NOT NULL CHECK (
        transaction_type IN ('purchase', 'sale', 'remortgage', 'transfer_of_equity')
    ),
    transaction_value DECIMAL(12,2) NOT NULL,

    -- Client information
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,

    -- Quote details
    base_fee DECIMAL(10,2) NOT NULL,
    disbursements DECIMAL(10,2) DEFAULT 0,
    vat_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,

    -- Fee breakdown (JSONB for flexibility)
    fee_breakdown JSONB DEFAULT '[]'::jsonb,

    -- Timeline
    valid_until DATE,
    estimated_completion_weeks INTEGER,

    -- Notes and attachments
    notes TEXT,
    terms_and_conditions TEXT,
    internal_notes TEXT, -- Private notes for staff only

    -- Cross-sell opportunities (Phase 3+ feature)
    cross_sell_opportunities JSONB DEFAULT '[]'::jsonb,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    sent_at TIMESTAMP WITH TIME ZONE,
    sent_by UUID REFERENCES auth.users(id),
    accepted_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quotes_tenant_id ON public.quotes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quotes_property_id ON public.quotes(property_id);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON public.quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_transaction_type ON public.quotes(transaction_type);
CREATE INDEX IF NOT EXISTS idx_quotes_client_email ON public.quotes(client_email);
CREATE INDEX IF NOT EXISTS idx_quotes_created_by ON public.quotes(created_by);
CREATE INDEX IF NOT EXISTS idx_quotes_deleted_at ON public.quotes(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_fee_breakdown ON public.quotes USING gin(fee_breakdown);
CREATE INDEX IF NOT EXISTS idx_quotes_cross_sell ON public.quotes USING gin(cross_sell_opportunities);

-- Updated at trigger
CREATE TRIGGER set_updated_at_quotes
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to generate quote number
CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    year_suffix TEXT;
    sequence_num INTEGER;
BEGIN
    year_suffix := TO_CHAR(NOW(), 'YY');

    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(quote_number FROM 'Q(\d+)-' || year_suffix)
            AS INTEGER
        )
    ), 0) + 1
    INTO sequence_num
    FROM public.quotes
    WHERE quote_number LIKE 'Q%-' || year_suffix;

    new_number := 'Q' || LPAD(sequence_num::TEXT, 5, '0') || '-' || year_suffix;

    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate quote number
CREATE OR REPLACE FUNCTION public.set_quote_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
        NEW.quote_number := public.generate_quote_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_quote_number_trigger
    BEFORE INSERT ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_quote_number();

-- Row Level Security
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Quotes are viewable by tenant members" ON public.quotes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = quotes.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Quotes are insertable by tenant members" ON public.quotes
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin', 'manager', 'member')
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Quotes are updatable by tenant members" ON public.quotes
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = quotes.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin', 'manager', 'member')
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = quotes.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin', 'manager', 'member')
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Quotes are deletable by tenant managers and above" ON public.quotes
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = quotes.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin', 'manager')
            AND tm.status = 'active'
        )
    );

COMMENT ON TABLE public.quotes IS 'Conveyancing quotes for property transactions';
COMMENT ON COLUMN public.quotes.quote_number IS 'Auto-generated unique quote number (format: Q00001-24)';
COMMENT ON COLUMN public.quotes.fee_breakdown IS 'Detailed breakdown of fees in JSON format';
COMMENT ON COLUMN public.quotes.cross_sell_opportunities IS 'Identified cross-sell opportunities (Phase 3+ feature)';
COMMENT ON COLUMN public.quotes.internal_notes IS 'Private notes visible only to tenant staff';
