import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getTasksDueForReminder,
  getClosingDatesDueForReminder,
  getOverdueTasks,
} from '@/services/reminder.service'
import { getUsersForNotificationType } from '@/services/notification-preferences.service'
import {
  generateTaskReminderEmail,
} from '@/lib/emails/task-reminder-template'
import {
  generateClosingDateReminderEmail,
} from '@/lib/emails/closing-date-reminder-template'
import {
  generateOverdueTaskAlertEmail,
} from '@/lib/emails/overdue-task-alert-template'

/**
 * Cron job endpoint for processing reminders
 * This should be called daily by a cron scheduler (e.g., Vercel Cron, GitHub Actions, etc.)
 *
 * Authorization: Use a secret token in the Authorization header
 * Example: Authorization: Bearer YOUR_CRON_SECRET
 *
 * To set up Vercel Cron:
 * Add to vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/reminders",
 *       "schedule": "0 9 * * *"
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization (simple token-based auth for cron jobs)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get all tenants
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name')

    if (tenantsError) {
      console.error('Error fetching tenants:', tenantsError)
      return NextResponse.json(
        { error: 'Failed to fetch tenants' },
        { status: 500 }
      )
    }

    const results = {
      tenantsProcessed: 0,
      taskReminders: 0,
      closingDateReminders: 0,
      overdueTaskAlerts: 0,
      emailsSent: 0,
      errors: [] as string[],
    }

    // Process reminders for each tenant
    for (const tenant of tenants) {
      try {
        results.tenantsProcessed++

        // Get tasks due for reminder (1, 3, 7 days before)
        const tasksResult = await getTasksDueForReminder(tenant.id)

        if ('tasks' in tasksResult && tasksResult.tasks.length > 0) {
          for (const task of tasksResult.tasks) {
            // Get users who should receive task reminders
            const usersResult = await getUsersForNotificationType(
              tenant.id,
              'task_reminders'
            )

            if ('users' in usersResult) {
              for (const user of usersResult.users) {
                // Calculate days until due
                const dueDate = new Date(task.due_date!)
                const today = new Date()
                const diffTime = dueDate.getTime() - today.getTime()
                const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                // Generate email
                const emailContent = generateTaskReminderEmail({
                  userName: user.first_name || 'there',
                  task,
                  daysUntilDue,
                  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                })

                // TODO: Send email using your email service (e.g., Resend, SendGrid, etc.)
                // await sendEmail({
                //   to: user.email,
                //   subject: emailContent.subject,
                //   html: emailContent.html,
                // })

                console.log(`Task reminder email queued for ${user.email}: ${emailContent.subject}`)
                results.taskReminders++
                results.emailsSent++
              }
            }
          }
        }

        // Get closing dates due for reminder (1, 3, 7 days before)
        const closingDatesResult = await getClosingDatesDueForReminder(tenant.id)

        if ('matters' in closingDatesResult && closingDatesResult.matters.length > 0) {
          for (const matter of closingDatesResult.matters) {
            // Get users who should receive closing date reminders
            const usersResult = await getUsersForNotificationType(
              tenant.id,
              'closing_date_reminders'
            )

            if ('users' in usersResult) {
              for (const user of usersResult.users) {
                // Calculate days until closing
                const closingDate = new Date(matter.closing_date!)
                const today = new Date()
                const diffTime = closingDate.getTime() - today.getTime()
                const daysUntilClosing = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                // Generate email
                const emailContent = generateClosingDateReminderEmail({
                  userName: user.first_name || 'there',
                  matter,
                  daysUntilClosing,
                  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                })

                // TODO: Send email using your email service
                // await sendEmail({
                //   to: user.email,
                //   subject: emailContent.subject,
                //   html: emailContent.html,
                // })

                console.log(
                  `Closing date reminder email queued for ${user.email}: ${emailContent.subject}`
                )
                results.closingDateReminders++
                results.emailsSent++
              }
            }
          }
        }

        // Get overdue tasks
        const overdueTasksResult = await getOverdueTasks(tenant.id)

        if ('tasks' in overdueTasksResult && overdueTasksResult.tasks.length > 0) {
          // Get users who should receive overdue task alerts
          const usersResult = await getUsersForNotificationType(
            tenant.id,
            'overdue_task_alerts'
          )

          if ('users' in usersResult) {
            for (const user of usersResult.users) {
              // Group overdue tasks by assigned user
              const userTasks = overdueTasksResult.tasks.filter(
                (task) => task.assigned_to === user.user_id
              )

              if (userTasks.length > 0) {
                // Generate email
                const emailContent = generateOverdueTaskAlertEmail({
                  userName: user.first_name || 'there',
                  tasks: userTasks,
                  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                })

                // TODO: Send email using your email service
                // await sendEmail({
                //   to: user.email,
                //   subject: emailContent.subject,
                //   html: emailContent.html,
                // })

                console.log(
                  `Overdue task alert email queued for ${user.email}: ${emailContent.subject}`
                )
                results.overdueTaskAlerts++
                results.emailsSent++
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing reminders for tenant ${tenant.id}:`, error)
        results.errors.push(`Tenant ${tenant.name}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in reminders cron job:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
