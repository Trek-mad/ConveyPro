import { NextRequest, NextResponse } from 'next/server'
import { getActiveTenantMembership } from '@/lib/auth'
import { updateBrandingSettings, getBrandingSettings } from '@/services/branding.service'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const membership = await getActiveTenantMembership()
    if (!membership) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get branding settings
    const settings = await getBrandingSettings(membership.tenant_id)

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching branding settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const membership = await getActiveTenantMembership()
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const { tenantId, settings } = await request.json()

    if (!tenantId || !settings) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify tenant ID matches user's membership
    if (tenantId !== membership.tenant_id) {
      return NextResponse.json(
        { error: 'Unauthorized - Tenant mismatch' },
        { status: 403 }
      )
    }

    // Update settings
    const result = await updateBrandingSettings(tenantId, settings)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating branding settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
