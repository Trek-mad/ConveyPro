import type { Task, Matter } from '@/types'

interface OverdueTaskAlertEmailProps {
  userName: string
  tasks: (Task & { matter?: Matter })[]
  appUrl: string
}

export function generateOverdueTaskAlertEmail({
  userName,
  tasks,
  appUrl,
}: OverdueTaskAlertEmailProps): { subject: string; html: string } {
  const subject =
    tasks.length === 1
      ? `Overdue Task Alert: "${tasks[0].title}"`
      : `Overdue Task Alert: ${tasks.length} tasks require attention`

  const taskRows = tasks
    .slice(0, 10) // Limit to 10 tasks in email
    .map(
      (task) => `
      <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 15px 0;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #dc2626;">${task.title}</h3>
        ${task.description ? `<p style="margin: 8px 0; color: #666; font-size: 14px;">${task.description}</p>` : ''}
        ${task.matter ? `<p style="margin: 8px 0; color: #666; font-size: 14px;"><strong>Matter:</strong> ${task.matter.matter_number}</p>` : ''}
        <p style="margin: 8px 0; color: #dc2626; font-size: 14px; font-weight: 600;"><strong>Was Due:</strong> ${new Date(task.due_date!).toLocaleDateString('en-GB')}</p>
        ${task.priority ? `<span style="display: inline-block; padding: 3px 10px; border-radius: 10px; font-size: 11px; font-weight: 600; background: ${task.priority === 'urgent' ? '#dc2626' : task.priority === 'high' ? '#ea580c' : task.priority === 'normal' ? '#2563eb' : '#6b7280'}; color: white;">${task.priority.toUpperCase()}</span>` : ''}
      </div>
    `
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Overdue Task Alert</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚨 Overdue Task Alert</h1>
        </div>

        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-top: 0;">Hi ${userName},</p>

          <p style="font-size: 16px;">You have <strong>${tasks.length} overdue task${tasks.length !== 1 ? 's' : ''}</strong> that require immediate attention:</p>

          <div style="background: #fee2e2; border: 1px solid #dc2626; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 600;">
              ⚠️ These tasks are overdue and may impact matter progress. Please review and complete them as soon as possible.
            </p>
          </div>

          ${taskRows}

          ${
            tasks.length > 10
              ? `
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; color: #666;">
            <p style="margin: 0; font-size: 14px;">...and ${tasks.length - 10} more overdue task(s)</p>
          </div>
          `
              : ''
          }

          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/tasks?filter=overdue" style="display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View All Overdue Tasks</a>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 30px;">Best regards,<br>ConveyPro Team</p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="font-size: 12px; color: #999; text-align: center;">
            You're receiving this email because you have overdue task alert notifications enabled.<br>
            <a href="${appUrl}/settings/notifications" style="color: #dc2626; text-decoration: none;">Manage notification preferences</a>
          </p>
        </div>
      </body>
    </html>
  `

  return { subject, html }
}
