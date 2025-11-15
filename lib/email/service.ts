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
      console.warn('SendGrid not configured - email would be sent:', {
        to: options.to,
        subject: options.subject,
      })
      return {
        success: false,
        error: 'SendGrid not configured. Please add SENDGRID_API_KEY to .env.local',
      }
    }

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@conveypro.co.uk'

    const msg = {
      to: options.to,
      from: fromEmail,
      subject: options.subject,
      html: options.html,
      text: options.text || '',
      attachments: options.attachments,
    }

    await sgMail.send(msg)

    console.log('Email sent successfully to:', options.to)
    return { success: true }
  } catch (error) {
    console.error('Failed to send email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}
