/**
 * Portal API Route - Get Matter Details
 * GET /api/portal/[token]
 * Phase 12.7 - Client Portal
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPortalMatterView } from '@/services/portal-token.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Get client IP address for tracking
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Get matter details
    const result = await getPortalMatterView(token)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      matter: result.matter,
      ip_address: ip,
    })
  } catch (error) {
    console.error('Error in portal GET route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
