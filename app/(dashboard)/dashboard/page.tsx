import { Metadata } from 'next'
import Link from 'next/link'
import { getActiveTenantMembership, getCurrentUser } from '@/lib/auth'
import { getTenant } from '@/services/tenant.service'
import { getQuotes, getProperties } from '@/services/quote.service'
import {
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  Building2,
  UserPlus,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { OverdueTasksWidget } from '@/components/dashboard/overdue-tasks-widget'
import { UpcomingDeadlinesWidget } from '@/components/dashboard/upcoming-deadlines-widget'
import { MattersRequiringAttentionWidget } from '@/components/dashboard/matters-requiring-attention-widget'

export const metadata: Metadata = {
  title: 'Dashboard | ConveyPro',
  description: 'Your ConveyPro dashboard',
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const membership = await getActiveTenantMembership()

  if (!user || !membership) {
    return null
  }

  // Fetch tenant data
  const tenantResult = await getTenant(membership.tenant_id)
  const tenant = 'tenant' in tenantResult ? tenantResult.tenant : null

  // Fetch quotes stats
  const quotesResult = await getQuotes(membership.tenant_id)
  const quotes = 'quotes' in quotesResult ? quotesResult.quotes : []

  // Fetch properties count
  const propertiesResult = await getProperties(membership.tenant_id)
  const properties =
    'properties' in propertiesResult ? propertiesResult.properties : []

  // Calculate stats
  const stats = {
    total: quotes.length,
    draft: quotes.filter((q) => q.status === 'draft').length,
    sent: quotes.filter((q) => q.status === 'sent').length,
    accepted: quotes.filter((q) => q.status === 'accepted').length,
    properties: properties.length,
  }

  const totalValue = quotes.reduce((sum, q) => sum + Number(q.total_amount), 0)
  const acceptedValue = quotes
    .filter((q) => q.status === 'accepted')
    .reduce((sum, q) => sum + Number(q.total_amount), 0)

  const conversionRate = stats.sent > 0 ? (stats.accepted / stats.sent) * 100 : 0

  return (
    <div className="space-y-8">
      {/* Welcome header with quick actions */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back,{' '}
            {user.user_metadata?.full_name || user.email?.split('@')[0]}!
          </h1>
          <p className="mt-2 text-gray-600">
            {tenant ? (
              <>
                Managing {tenant.name} •{' '}
                <span className="capitalize">{membership.role}</span>
              </>
            ) : (
              'Your dashboard overview'
            )}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link href="/quotes/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Quote
            </Button>
          </Link>
          {['owner', 'admin', 'manager', 'member'].includes(membership.role) && (
            <Link href="/properties/new">
              <Button variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </Link>
          )}
          {['owner', 'admin'].includes(membership.role) && (
            <Link href="/team">
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Team
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Quotes</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.total}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Draft Quotes</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.draft}
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sent Quotes</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.sent}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.accepted}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Alert Widgets */}
      <div className="grid gap-6 lg:grid-cols-3">
        <OverdueTasksWidget tenantId={membership.tenant_id} maxDisplay={3} />
        <UpcomingDeadlinesWidget tenantId={membership.tenant_id} daysAhead={7} maxDisplay={3} />
        <MattersRequiringAttentionWidget tenantId={membership.tenant_id} maxDisplay={3} />
      </div>

      {/* Insights Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Quote Value */}
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Quote Value</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            £{totalValue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-gray-500">Across all {stats.total} quotes</p>
        </Card>

        {/* Accepted Value */}
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Accepted Value</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            £{acceptedValue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-gray-500">From {stats.accepted} accepted quotes</p>
        </Card>

        {/* Conversion Rate */}
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Conversion Rate</h3>
          <p className="mt-2 text-3xl font-bold text-purple-600">
            {conversionRate.toFixed(0)}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {stats.accepted} accepted of {stats.sent} sent
          </p>
        </Card>
      </div>

      {/* Recent quotes and activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent quotes */}
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Quotes
            </h3>
            <Link href="/quotes">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          {quotes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No quotes yet</p>
              <p className="mt-2 text-sm text-gray-500">
                Create your first quote to get started
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Quote #
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Client
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Amount
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {quotes.slice(0, 5).map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                        {quote.quote_number}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {quote.client_name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        £{Number(quote.total_amount).toLocaleString('en-GB')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            quote.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : quote.status === 'sent'
                                ? 'bg-blue-100 text-blue-800'
                                : quote.status === 'draft'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {quote.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Recent activity */}
        <Card className="p-6">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
          <RecentActivity />
        </Card>
      </div>
    </div>
  )
}
