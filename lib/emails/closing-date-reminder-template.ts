import type { Matter } from '@/types'

interface ClosingDateReminderEmailProps {
  userName: string
  matter: Matter
  daysUntilClosing: number
  appUrl: string
}

export function generateClosingDateReminderEmail({
  userName,
  matter,
  daysUntilClosing,
  appUrl,
}: ClosingDateReminderEmailProps): { subject: string; html: string } {
  const urgencyText =
    daysUntilClosing === 1
      ? 'tomorrow'
      : daysUntilClosing === 0
      ? 'today'
      : `in ${daysUntilClosing} days`

  const subject = `Closing Date Reminder: ${matter.matter_number} - ${urgencyText}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Closing Date Reminder</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Closing Date Reminder</h1>
        </div>

        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-top: 0;">Hi ${userName},</p>

          <p style="font-size: 16px;">This is a reminder that the closing date for the following matter is <strong>${urgencyText}</strong>:</p>

          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #f59e0b;">${matter.matter_number}</h2>
            <p style="margin: 10px 0; color: #666;"><strong>Closing Date:</strong> ${new Date(matter.closing_date!).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 10px 0; color: #666;"><strong>Current Stage:</strong> ${matter.current_stage?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</p>
            ${matter.purchase_price ? `<p style="margin: 10px 0; color: #666;"><strong>Purchase Price:</strong> £${Number(matter.purchase_price).toLocaleString('en-GB')}</p>` : ''}
            ${matter.priority ? `<p style="margin: 10px 0;"><span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: ${matter.priority === 'urgent' ? '#dc2626' : matter.priority === 'high' ? '#ea580c' : matter.priority === 'normal' ? '#2563eb' : '#6b7280'}; color: white;">${matter.priority.toUpperCase()} PRIORITY</span></p>` : ''}
          </div>

          ${
            daysUntilClosing <= 3
              ? `
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⚠️ Action Required:</strong> Please ensure all necessary documents and tasks are completed before the closing date.
            </p>
          </div>
          `
              : ''
          }

          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/matters/${matter.id}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View Matter</a>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 30px;">Best regards,<br>ConveyPro Team</p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="font-size: 12px; color: #999; text-align: center;">
            You're receiving this email because you have closing date reminder notifications enabled.<br>
            <a href="${appUrl}/settings/notifications" style="color: #f59e0b; text-decoration: none;">Manage notification preferences</a>
          </p>
        </div>
      </body>
    </html>
  `

  return { subject, html }
}
