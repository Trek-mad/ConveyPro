import type { Task, Matter } from '@/types'

interface TaskReminderEmailProps {
  userName: string
  task: Task & { matter?: Matter }
  daysUntilDue: number
  appUrl: string
}

export function generateTaskReminderEmail({
  userName,
  task,
  daysUntilDue,
  appUrl,
}: TaskReminderEmailProps): { subject: string; html: string } {
  const urgencyText =
    daysUntilDue === 1
      ? 'tomorrow'
      : daysUntilDue === 0
      ? 'today'
      : `in ${daysUntilDue} days`

  const subject = `Task Reminder: "${task.title}" due ${urgencyText}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Reminder</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Task Reminder</h1>
        </div>

        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-top: 0;">Hi ${userName},</p>

          <p style="font-size: 16px;">This is a reminder that you have a task due <strong>${urgencyText}</strong>:</p>

          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #667eea;">${task.title}</h2>
            ${task.description ? `<p style="margin: 10px 0; color: #666;">${task.description}</p>` : ''}
            ${task.matter ? `<p style="margin: 10px 0; color: #666;"><strong>Matter:</strong> ${task.matter.matter_number}</p>` : ''}
            <p style="margin: 10px 0; color: #666;"><strong>Due Date:</strong> ${new Date(task.due_date!).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            ${task.priority ? `<p style="margin: 10px 0;"><span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: ${task.priority === 'urgent' ? '#dc2626' : task.priority === 'high' ? '#ea580c' : task.priority === 'normal' ? '#2563eb' : '#6b7280'}; color: white;">${task.priority.toUpperCase()}</span></p>` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/tasks/${task.id}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View Task</a>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 30px;">Best regards,<br>ConveyPro Team</p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="font-size: 12px; color: #999; text-align: center;">
            You're receiving this email because you have task reminder notifications enabled.<br>
            <a href="${appUrl}/settings/notifications" style="color: #667eea; text-decoration: none;">Manage notification preferences</a>
          </p>
        </div>
      </body>
    </html>
  `

  return { subject, html }
}
