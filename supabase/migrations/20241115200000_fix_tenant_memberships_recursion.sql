-- Fix infinite recursion in tenant_memberships INSERT policy
-- Allow users to create their first membership during onboarding

-- Drop the problematic policy
DROP POLICY IF EXISTS "Memberships are insertable by tenant admins" ON public.tenant_memberships;

-- Create new policy that allows:
-- 1. Existing tenant admins to add new members (normal flow)
-- 2. Any authenticated user to create their first membership in a new tenant (onboarding flow)
CREATE POLICY "Memberships are insertable by tenant admins or during onboarding" ON public.tenant_memberships
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
        AND
        (
            -- Allow if user is already an owner/admin in this tenant
            EXISTS (
                SELECT 1 FROM public.tenant_memberships tm
                WHERE tm.tenant_id = tenant_id
                AND tm.user_id = auth.uid()
                AND tm.role IN ('owner', 'admin')
                AND tm.status = 'active'
            )
            OR
            -- Allow if this is the first membership for a new tenant (onboarding)
            -- The user creating the membership must be the same as the one being added
            -- and they must have 'owner' role
            (
                user_id = auth.uid()
                AND role = 'owner'
                AND NOT EXISTS (
                    SELECT 1 FROM public.tenant_memberships tm
                    WHERE tm.tenant_id = tenant_id
                    AND tm.deleted_at IS NULL
                )
            )
        )
    );
