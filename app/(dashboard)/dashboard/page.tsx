import { Metadata } from 'next'
import { getActiveTenantMembership, getCurrentUser } from '@/lib/auth'
import { getTenant } from '@/services/tenant.service'
import { getQuotes } from '@/services/quote.service'
import { FileText, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

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

  // Calculate stats
  const stats = {
    total: quotes.length,
    draft: quotes.filter((q) => q.status === 'draft').length,
    sent: quotes.filter((q) => q.status === 'sent').length,
    accepted: quotes.filter((q) => q.status === 'accepted').length,
  }

  const totalValue = quotes.reduce((sum, q) => sum + Number(q.total_amount), 0)

  return (
    <div className="space-y-8">
      {/* Welcome header */}
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

      {/* Total value card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Total Quote Value
        </h3>
        <p className="mt-2 text-4xl font-bold text-blue-600">
          £{totalValue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Across all {stats.total} quotes
        </p>
      </Card>

      {/* Recent quotes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Quotes</h3>
        {quotes.length === 0 ? (
          <div className="mt-6 text-center">
            <p className="text-gray-600">No quotes yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Create your first quote to get started
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden">
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
    </div>
  )
}
