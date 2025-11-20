import { NextResponse } from 'next/server'
import { sendMagicLink, verifyMagicLink } from '@/lib/services/client-portal.service'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.action === 'send') {
      const { link, error } = await sendMagicLink(body.email, body.purpose || 'login')

      if (error) {
        return NextResponse.json({ error }, { status: 400 })
      }

      // In production, email would be sent here
      // For now, return the link (only for development)
      return NextResponse.json({
        success: true,
        message: 'Magic link sent to your email',
        // link, // Remove in production
      })
    }

    if (body.action === 'verify') {
      const { user, error } = await verifyMagicLink(body.token)

      if (error) {
        return NextResponse.json({ error }, { status: 400 })
      }

      // Create session (simplified for now)
      return NextResponse.json({
        success: true,
        user,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in POST /api/portal/auth/magic-link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
