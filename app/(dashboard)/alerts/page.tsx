import { Metadata } from 'next'
import { getActiveTenantMembership } from '@/lib/auth'
import { getAlertsSummary } from '@/services/reminder.service'
import { OverdueTasksWidget } from '@/components/dashboard/overdue-tasks-widget'
import { UpcomingDeadlinesWidget } from '@/components/dashboard/upcoming-deadlines-widget'
import { MattersRequiringAttentionWidget } from '@/components/dashboard/matters-requiring-attention-widget'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, AlertCircle, Clock, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Alerts & Reminders | ConveyPro',
  description: 'View all alerts, reminders, and matters requiring attention',
}

export default async function AlertsPage() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  // Get summary counts for the header
  const summary = await getAlertsSummary(membership.tenant_id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-3">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alerts & Reminders</h1>
            <p className="mt-1 text-gray-600">
              Stay on top of important deadlines and matters requiring attention
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Overdue Tasks</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.summary.overdueTasksCount}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming Tasks</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.summary.upcomingTasksCount}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-100 p-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Need Attention</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.summary.mattersRequiringAttentionCount}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-2">
              <Bell className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Closing Soon</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.summary.upcomingClosingDatesCount}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alert Widgets Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <OverdueTasksWidget tenantId={membership.tenant_id} />
          <UpcomingDeadlinesWidget tenantId={membership.tenant_id} />
        </div>

        {/* Right Column */}
        <div>
          <MattersRequiringAttentionWidget tenantId={membership.tenant_id} />
        </div>
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 p-6">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">About Alerts & Reminders</h3>
            <div className="mt-2 space-y-1 text-sm text-blue-800">
              <p>• <strong>Overdue Tasks:</strong> Tasks that have passed their due date and require immediate attention</p>
              <p>• <strong>Upcoming Deadlines:</strong> Tasks and closing dates due within the next 7 days</p>
              <p>• <strong>Matters Requiring Attention:</strong> Matters with issues such as unassigned fee earners, overdue tasks, or stalled progress</p>
              <p className="mt-3">
                Configure your notification preferences in{' '}
                <a href="/settings/notifications" className="font-semibold underline">
                  Settings → Notifications
                </a>
                {' '}to receive email reminders for these alerts.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
