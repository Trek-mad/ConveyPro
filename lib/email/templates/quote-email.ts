import { QuoteWithRelations } from '@/types'

interface QuoteEmailTemplateProps {
  quote: QuoteWithRelations
  tenantName: string
  viewUrl?: string
}

/**
 * Generate HTML email template for quote
 */
export function generateQuoteEmail({
  quote,
  tenantName,
  viewUrl,
}: QuoteEmailTemplateProps): { html: string; text: string } {
  const formatCurrency = (amount: number) => {
    return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      purchase: 'Purchase',
      sale: 'Sale',
      remortgage: 'Remortgage',
      transfer_of_equity: 'Transfer of Equity',
    }
    return labels[type] || type
  }

  // Parse fee breakdown
  const feeBreakdown =
    typeof quote.fee_breakdown === 'string'
      ? JSON.parse(quote.fee_breakdown)
      : quote.fee_breakdown

  const vatRate = feeBreakdown?.vat_rate || 20

  // HTML Email
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Conveyancing Quote</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 8px 0 0 0;
      color: #bfdbfe;
      font-size: 14px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      color: #1f2937;
      margin-bottom: 20px;
      line-height: 1.6;
    }
    .info-box {
      background-color: #f9fafb;
      border-left: 4px solid #2563eb;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box h3 {
      margin: 0 0 8px 0;
      color: #1f2937;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-box p {
      margin: 4px 0;
      color: #4b5563;
      font-size: 14px;
      line-height: 1.5;
    }
    .property-box {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 1px solid #93c5fd;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .property-box h3 {
      margin: 0 0 12px 0;
      color: #1e40af;
      font-size: 16px;
      font-weight: 600;
    }
    .property-box p {
      margin: 4px 0;
      color: #1f2937;
      font-size: 14px;
      line-height: 1.6;
    }
    .fee-table {
      width: 100%;
      margin: 24px 0;
      border-collapse: collapse;
    }
    .fee-table th {
      background-color: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #d1d5db;
    }
    .fee-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
      color: #1f2937;
    }
    .fee-table tr:last-child td {
      border-bottom: none;
    }
    .fee-table .total-row {
      background-color: #eff6ff;
      border-top: 2px solid #2563eb;
    }
    .fee-table .total-row td {
      font-weight: 700;
      font-size: 16px;
      color: #1f2937;
      padding: 16px 12px;
    }
    .fee-table .total-amount {
      color: #2563eb;
      font-size: 18px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 15px;
      margin: 24px 0;
      box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 8px 0;
      color: #6b7280;
      font-size: 13px;
      line-height: 1.5;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 24px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>${tenantName}</h1>
      <p>Conveyancing Quote</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">
        <p>Dear ${quote.client_name},</p>
        <p>Thank you for considering ${tenantName} for your conveyancing needs. Please find attached your quote for the ${getTransactionTypeLabel(quote.transaction_type).toLowerCase()} transaction.</p>
      </div>

      <!-- Quote Summary -->
      <div class="info-box">
        <h3>Quote Details</h3>
        <p><strong>Quote Number:</strong> ${quote.quote_number}</p>
        <p><strong>Date:</strong> ${formatDate(quote.created_at)}</p>
        <p><strong>Transaction Type:</strong> ${getTransactionTypeLabel(quote.transaction_type)}</p>
        <p><strong>Transaction Value:</strong> ${formatCurrency(Number(quote.transaction_value))}</p>
      </div>

      ${
        quote.property
          ? `
      <!-- Property Information -->
      <div class="property-box">
        <h3>📍 Property Details</h3>
        <p>${quote.property.address_line1}</p>
        ${quote.property.address_line2 ? `<p>${quote.property.address_line2}</p>` : ''}
        <p>${quote.property.city}, ${quote.property.postcode}</p>
        ${quote.property.country ? `<p>${quote.property.country}</p>` : ''}
      </div>
      `
          : ''
      }

      <!-- Fee Breakdown -->
      <h3 style="color: #1f2937; font-size: 16px; margin: 32px 0 16px 0;">Fee Breakdown</h3>
      <table class="fee-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Legal Fees</td>
            <td style="text-align: right;">${formatCurrency(Number(quote.base_fee))}</td>
          </tr>
          <tr>
            <td>Disbursements</td>
            <td style="text-align: right;">${formatCurrency(Number(quote.disbursements))}</td>
          </tr>
          <tr>
            <td>VAT (${vatRate}%)</td>
            <td style="text-align: right;">${formatCurrency(Number(quote.vat_amount))}</td>
          </tr>
          <tr class="total-row">
            <td><strong>Total Amount</strong></td>
            <td style="text-align: right;" class="total-amount"><strong>${formatCurrency(Number(quote.total_amount))}</strong></td>
          </tr>
        </tbody>
      </table>

      ${
        quote.notes
          ? `
      <div class="info-box">
        <h3>Additional Information</h3>
        <p>${quote.notes.replace(/\n/g, '<br>')}</p>
      </div>
      `
          : ''
      }

      <div class="divider"></div>

      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        A detailed PDF quote is attached to this email for your records. This quote is valid for 30 days from the date of issue.
      </p>

      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 20px;">
        If you have any questions or would like to proceed, please don't hesitate to contact us.
      </p>

      ${
        viewUrl
          ? `
      <div style="text-align: center; margin: 32px 0;">
        <a href="${viewUrl}" class="cta-button">View Quote Online</a>
      </div>
      `
          : ''
      }
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>${tenantName}</strong></p>
      <p>© ${new Date().getFullYear()} ${tenantName}. All rights reserved.</p>
      <p style="margin-top: 16px; font-size: 12px;">
        This email and any attachments are confidential and intended solely for the use of the individual to whom it is addressed.
      </p>
    </div>
  </div>
</body>
</html>
  `

  // Plain text version
  const text = `
${tenantName}
Conveyancing Quote

Dear ${quote.client_name},

Thank you for considering ${tenantName} for your conveyancing needs.

QUOTE DETAILS
Quote Number: ${quote.quote_number}
Date: ${formatDate(quote.created_at)}
Transaction Type: ${getTransactionTypeLabel(quote.transaction_type)}
Transaction Value: ${formatCurrency(Number(quote.transaction_value))}

${
  quote.property
    ? `
PROPERTY DETAILS
${quote.property.address_line1}
${quote.property.address_line2 ? quote.property.address_line2 + '\n' : ''}${quote.property.city}, ${quote.property.postcode}
${quote.property.country ? quote.property.country : ''}
`
    : ''
}

FEE BREAKDOWN
Legal Fees: ${formatCurrency(Number(quote.base_fee))}
Disbursements: ${formatCurrency(Number(quote.disbursements))}
VAT (${vatRate}%): ${formatCurrency(Number(quote.vat_amount))}
---
Total Amount: ${formatCurrency(Number(quote.total_amount))}

${quote.notes ? `\nADDITIONAL INFORMATION\n${quote.notes}\n` : ''}

A detailed PDF quote is attached to this email for your records.
This quote is valid for 30 days from the date of issue.

If you have any questions or would like to proceed, please don't hesitate to contact us.

${viewUrl ? `View Quote Online: ${viewUrl}\n` : ''}

Best regards,
${tenantName}

© ${new Date().getFullYear()} ${tenantName}. All rights reserved.
  `.trim()

  return { html, text }
}
