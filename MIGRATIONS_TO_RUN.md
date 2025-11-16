# Phase 2 Migrations - Copy and Paste into Supabase

Go to: https://app.supabase.com/project/xnfxgdxwolbqbewfrnzd/sql/new

Run each migration below in order by copying the SQL and pasting into the SQL Editor.

---

## Migration 1: Tenants Table

```sql
-- Create tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    email TEXT,
    phone TEXT,
    website TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    postcode TEXT,
    country TEXT DEFAULT 'Scotland',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
    subscription_tier TEXT DEFAULT 'standard' CHECK (subscription_tier IN ('trial', 'standard', 'professional', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_deleted_at ON public.tenants(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER set_updated_at_tenants
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants are viewable by members" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "Tenants are insertable by authenticated users" ON public.tenants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Tenants are updatable by tenant admins" ON public.tenants FOR UPDATE USING (true) WITH CHECK (true);
```

---

## Migration 2: Profiles Table

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    job_title TEXT,
    law_society_number TEXT,
    email_notifications BOOLEAN DEFAULT true,
    timezone TEXT DEFAULT 'Europe/London',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

---

## Migration 3: Tenant Memberships Table

```sql
-- Create tenant_memberships table
CREATE TABLE IF NOT EXISTS public.tenant_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
    invited_by UUID REFERENCES auth.users(id),
    invitation_token TEXT,
    invitation_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT tenant_memberships_unique UNIQUE (tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_memberships_tenant_id ON public.tenant_memberships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user_id ON public.tenant_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_role ON public.tenant_memberships(role);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_status ON public.tenant_memberships(status);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_deleted_at ON public.tenant_memberships(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER set_updated_at_tenant_memberships
    BEFORE UPDATE ON public.tenant_memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Memberships are viewable by tenant members" ON public.tenant_memberships
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_memberships.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Memberships are insertable by tenant admins" ON public.tenant_memberships
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
        AND
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin')
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Memberships are updatable by tenant admins" ON public.tenant_memberships
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_memberships.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin')
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_memberships.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin')
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Memberships are deletable by tenant owners" ON public.tenant_memberships
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = tenant_memberships.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role = 'owner'
            AND tm.status = 'active'
        )
    );
```

---

## Migration 4: Properties Table

```sql
-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    postcode TEXT NOT NULL,
    country TEXT DEFAULT 'Scotland',
    property_type TEXT CHECK (property_type IN ('residential', 'commercial', 'land', 'mixed')),
    tenure TEXT CHECK (tenure IN ('freehold', 'leasehold', 'commonhold')),
    bedrooms INTEGER,
    bathrooms INTEGER,
    floor_area_sqm DECIMAL(10,2),
    estimated_value DECIMAL(12,2),
    purchase_price DECIMAL(12,2),
    title_number TEXT,
    uprn TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_properties_tenant_id ON public.properties(tenant_id);
CREATE INDEX IF NOT EXISTS idx_properties_postcode ON public.properties(postcode);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_title_number ON public.properties(title_number);
CREATE INDEX IF NOT EXISTS idx_properties_deleted_at ON public.properties(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_properties_metadata ON public.properties USING gin(metadata);

CREATE TRIGGER set_updated_at_properties
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Properties are viewable by tenant members" ON public.properties
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = properties.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Properties are insertable by tenant members" ON public.properties
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

CREATE POLICY "Properties are updatable by tenant members" ON public.properties
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = properties.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin', 'manager', 'member')
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = properties.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin', 'manager', 'member')
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Properties are deletable by tenant managers and above" ON public.properties
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_memberships tm
            WHERE tm.tenant_id = properties.tenant_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin', 'manager')
            AND tm.status = 'active'
        )
    );
```

---

## Migration 5: Quotes Table

```sql
-- Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    quote_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'sent', 'accepted', 'rejected', 'expired', 'cancelled')),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'remortgage', 'transfer_of_equity')),
    transaction_value DECIMAL(12,2) NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    base_fee DECIMAL(10,2) NOT NULL,
    disbursements DECIMAL(10,2) DEFAULT 0,
    vat_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    fee_breakdown JSONB DEFAULT '[]'::jsonb,
    valid_until DATE,
    estimated_completion_weeks INTEGER,
    notes TEXT,
    terms_and_conditions TEXT,
    internal_notes TEXT,
    cross_sell_opportunities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    sent_at TIMESTAMP WITH TIME ZONE,
    sent_by UUID REFERENCES auth.users(id),
    accepted_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

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

CREATE TRIGGER set_updated_at_quotes
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    year_suffix TEXT;
    sequence_num INTEGER;
BEGIN
    year_suffix := TO_CHAR(NOW(), 'YY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 'Q(\d+)-' || year_suffix) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.quotes
    WHERE quote_number LIKE 'Q%-' || year_suffix;
    new_number := 'Q' || LPAD(sequence_num::TEXT, 5, '0') || '-' || year_suffix;
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

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

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

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
```

---

## After Running All 5 Migrations

Verify the tables were created by running:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see: `feature_flags`, `profiles`, `properties`, `quotes`, `tenant_memberships`, `tenant_settings`, `tenants`
