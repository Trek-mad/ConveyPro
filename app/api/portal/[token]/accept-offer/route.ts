/**
 * Portal API Route - Accept Offer
 * POST /api/portal/[token]/accept-offer
 * Phase 12.7 - Client Portal
 */

import { NextRequest, NextResponse } from 'next/server'
import { acceptOfferViaPortal } from '@/services/portal-token.service'

// Rate limiting map (in-memory, would use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(token: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(token)

  if (!limit || now > limit.resetAt) {
    // Reset or create new limit (5 attempts per hour)
    rateLimitMap.set(token, {
      count: 1,
      resetAt: now + 3600000, // 1 hour
    })
    return true
  }

  if (limit.count >= 5) {
    return false // Rate limit exceeded
  }

  limit.count++
  return true
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Check rate limit
    if (!checkRateLimit(token)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Get request body
    const body = await request.json()
    const { offer_id } = body

    if (!offer_id) {
      return NextResponse.json({ error: 'offer_id is required' }, { status: 400 })
    }

    // Get client IP address for tracking
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Accept offer
    const result = await acceptOfferViaPortal({
      token,
      offer_id,
      ip_address: ip,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Offer accepted successfully',
    })
  } catch (error) {
    console.error('Error in accept-offer route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
