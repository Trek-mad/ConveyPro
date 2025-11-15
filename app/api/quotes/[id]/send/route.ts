import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { getQuote, updateQuoteStatus } from '@/services/quote.service'
import { getTenant } from '@/services/tenant.service'
import { getActiveTenantMembership } from '@/lib/auth'
import { QuotePDF } from '@/lib/pdf/quote-template'
import { sendEmail } from '@/lib/email/service'
import { generateQuoteEmail } from '@/lib/email/templates/quote-email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const membership = await getActiveTenantMembership()
    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Await params in Next.js 15
    const { id } = await params

    // Fetch the quote with relations
    const quoteResult = await getQuote(id)
    if ('error' in quoteResult) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    const quote = quoteResult.quote

    // Check if quote has client email
    if (!quote.client_email) {
      return NextResponse.json(
        { error: 'Quote has no client email address' },
        { status: 400 }
      )
    }

    // Fetch tenant information
    const tenantResult = await getTenant(membership.tenant_id)
    const tenantName =
      'tenant' in tenantResult ? tenantResult.tenant.name : 'ConveyPro'

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      QuotePDF({ quote, tenantName })
    )

    // Convert PDF buffer to base64 for email attachment
    const pdfBase64 = pdfBuffer.toString('base64')

    // Generate email content
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const { html, text } = generateQuoteEmail({
      quote,
      tenantName,
      viewUrl: `${appUrl}/quotes/${quote.id}`, // Can be used for client portal later
    })

    // Send email with PDF attachment
    const emailResult = await sendEmail({
      to: quote.client_email,
      subject: `Conveyancing Quote ${quote.quote_number} from ${tenantName}`,
      html,
      text,
      attachments: [
        {
          content: pdfBase64,
          filename: `Quote-${quote.quote_number}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    // Update quote status to 'sent'
    await updateQuoteStatus(id, membership.tenant_id, 'sent')

    return NextResponse.json({
      success: true,
      message: `Quote sent successfully to ${quote.client_email}`,
    })
  } catch (error) {
    console.error('Failed to send quote:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send quote email',
      },
      { status: 500 }
    )
  }
}
