import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key
const apiKey = process.env.SENDGRID_API_KEY
if (apiKey && apiKey !== 'your-sendgrid-key') {
  sgMail.setApiKey(apiKey)
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    content: string
    filename: string
    type: string
    disposition: string
  }>
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Check if SendGrid is configured
    if (!apiKey || apiKey === 'your-sendgrid-key') {
      console.error('❌ SendGrid not configured!')
      console.error('API Key:', apiKey ? 'Present but placeholder' : 'Missing')
      console.warn('Email would be sent to:', options.to)
      return {
        success: false,
        error: 'SendGrid not configured. Please add SENDGRID_API_KEY to .env.local',
      }
    }

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@conveypro.co.uk'

    console.log('📧 Sending email via SendGrid...')
    console.log('  From:', fromEmail)
    console.log('  To:', options.to)
    console.log('  Subject:', options.subject)
    console.log('  Has attachments:', !!options.attachments?.length)
    console.log('  API Key (first 10 chars):', apiKey.substring(0, 10) + '...')

    const msg = {
      to: options.to,
      from: fromEmail,
      subject: options.subject,
      html: options.html,
      text: options.text || '',
      attachments: options.attachments,
    }

    const response = await sgMail.send(msg)

    console.log('✅ Email sent successfully!')
    console.log('  SendGrid response status:', response[0]?.statusCode)
    console.log('  To:', options.to)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Failed to send email via SendGrid')
    console.error('  Error:', error)
    console.error('  Error message:', error?.message)
    console.error('  Error response:', error?.response?.body)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}
