/**
 * Portal API Route - Submit Contact Form
 * POST /api/portal/[token]/contact
 * Phase 12.7 - Client Portal
 */

import { NextRequest, NextResponse } from 'next/server'
import { submitPortalContactForm } from '@/services/portal-token.service'

// Rate limiting map (in-memory, would use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(token: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(token)

  if (!limit || now > limit.resetAt) {
    // Reset or create new limit (10 messages per hour)
    rateLimitMap.set(token, {
      count: 1,
      resetAt: now + 3600000, // 1 hour
    })
    return true
  }

  if (limit.count >= 10) {
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
        { error: 'Too many messages. Please try again later.' },
        { status: 429 }
      )
    }

    // Get request body
    const body = await request.json()
    const { message, subject } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message is too long (max 5000 characters)' },
        { status: 400 }
      )
    }

    // Submit contact form
    const result = await submitPortalContactForm({
      token,
      message: message.trim(),
      subject: subject?.trim(),
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    })
  } catch (error) {
    console.error('Error in contact route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
