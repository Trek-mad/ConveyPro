import { NextRequest, NextResponse } from 'next/server'
import { getActiveTenantMembership } from '@/lib/auth'
import { uploadFirmLogo } from '@/services/branding.service'

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

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const tenantId = formData.get('tenantId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
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

    // Upload logo
    const result = await uploadFirmLogo(tenantId, file)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
