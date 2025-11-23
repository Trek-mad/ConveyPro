import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { getQuote, updateQuoteStatus } from '@/services/quote.service'
import { getTenant } from '@/services/tenant.service'
import { getActiveTenantMembership } from '@/lib/auth'
import { QuotePDF } from '@/lib/pdf/quote-template'
import { sendEmail } from '@/lib/email/service'
import { generateQuoteEmail } from '@/lib/email/templates/quote-email'
import { getBrandingSettings } from '@/services/branding.service'

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

    // Fetch branding settings
    const brandingSettings = await getBrandingSettings(membership.tenant_id)

    // Convert logo URL to base64 if present
    let logoBase64: string | undefined
    if (brandingSettings.logo_url) {
      try {
        const logoResponse = await fetch(brandingSettings.logo_url)
        if (logoResponse.ok) {
          const logoBuffer = await logoResponse.arrayBuffer()
          const logoBytes = Buffer.from(logoBuffer)
          const contentType = logoResponse.headers.get('content-type') || 'image/png'
          logoBase64 = `data:${contentType};base64,${logoBytes.toString('base64')}`
        } else {
          console.error('Failed to fetch logo:', logoResponse.status, logoResponse.statusText)
        }
      } catch (logoError) {
        console.error('Error fetching logo for PDF:', logoError)
        // Continue without logo rather than failing the entire operation
      }
    }

    // Generate PDF with branding
    const pdfBuffer = await renderToBuffer(
      QuotePDF({
        quote,
        tenantName,
        branding: {
          primary_color: brandingSettings.primary_color,
          logo_url: logoBase64 || brandingSettings.logo_url,
          firm_name: brandingSettings.firm_name,
          tagline: brandingSettings.tagline,
        }
      }) as any
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
