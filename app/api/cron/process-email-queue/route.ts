import { NextRequest, NextResponse } from 'next/server'
import { processEmailQueue } from '@/services/email-automation.service'

/**
 * Email Queue Processing Cron Job
 *
 * This endpoint should be called periodically (every 5 minutes) by a cron service
 * to process pending emails in the queue.
 *
 * Setup: See vercel.json for Vercel Cron configuration
 * Security: Uses CRON_SECRET environment variable for authorization
 * Pass header: Authorization: Bearer CRON_SECRET
 */

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret) {
      const expectedAuth = `Bearer ${cronSecret}`
      if (authHeader !== expectedAuth) {
        console.error('[Email Queue Cron] Unauthorized access attempt')
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    } else {
      // If no CRON_SECRET is set, allow access (for development)
      console.warn('[Email Queue Cron] No CRON_SECRET set - allowing access')
    }

    console.log('[Email Queue Cron] Starting email queue processing...')

    const startTime = Date.now()
    const result = await processEmailQueue()
    const duration = Date.now() - startTime

    console.log(
      `[Email Queue Cron] Processed ${result.processed} emails, ${result.errors} errors in ${duration}ms`
    )

    return NextResponse.json({
      success: true,
      processed: result.processed,
      errors: result.errors,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[Email Queue Cron] Fatal error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for manual testing and health checks
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Email queue cron endpoint is active',
    instructions: 'POST to this endpoint to process the email queue',
    setup: {
      vercel: 'Add to vercel.json crons configuration',
      github_actions: 'Create .github/workflows/email-queue.yml',
      external: 'Schedule POST requests every 5 minutes',
    },
    security: {
      required: !!process.env.CRON_SECRET,
      header: 'Authorization: Bearer <CRON_SECRET>',
    },
  })
}
