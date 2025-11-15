import { NextRequest, NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { getQuote } from '@/services/quote.service'
import { getTenant } from '@/services/tenant.service'
import { getActiveTenantMembership } from '@/lib/auth'
import { QuotePDF } from '@/lib/pdf/quote-template'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const membership = await getActiveTenantMembership()
    if (!membership) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Await params in Next.js 15
    const { id } = await params

    // Fetch the quote with relations
    const quoteResult = await getQuote(id)
    if ('error' in quoteResult) {
      return new NextResponse('Quote not found', { status: 404 })
    }

    const quote = quoteResult.quote

    // Fetch tenant information
    const tenantResult = await getTenant(membership.tenant_id)
    const tenantName =
      'tenant' in tenantResult ? tenantResult.tenant.name : 'ConveyPro'

    // Generate PDF stream
    const stream = await renderToStream(
      QuotePDF({ quote, tenantName })
    )

    // Convert stream to buffer
    const chunks: Uint8Array[] = []

    return new Promise<NextResponse>((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('end', () => {
        const buffer = Buffer.concat(chunks)

        // Create response with PDF
        const response = new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Quote-${quote.quote_number}.pdf"`,
          },
        })

        resolve(response)
      })
      stream.on('error', (error) => {
        console.error('PDF generation error:', error)
        reject(new NextResponse('Failed to generate PDF', { status: 500 }))
      })
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
