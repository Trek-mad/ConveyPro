import { Suspense } from 'react'
import { getActiveTenantMembership } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getRevenueAttribution } from '@/services/analytics.service'
import { DollarSign, TrendingUp, Users, Briefcase } from 'lucide-react'

export const metadata = {
  title: 'Revenue Analytics | ConveyPro',
  description: 'Revenue attribution and business intelligence',
}

export default async function RevenueAnalyticsPage() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    redirect('/auth/login')
  }

  const metrics = await getRevenueAttribution(membership.tenant_id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
        <p className="mt-2 text-gray-600">
          Track revenue attribution, ROI, and business performance
        </p>
      </div>

      {/* Total Revenue */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-8">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-blue-600 p-4">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-sm text-blue-700">Total Revenue (Accepted Quotes)</p>
            <p className="text-4xl font-bold text-blue-900">
              £{metrics.total_revenue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Revenue by Source */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Revenue by Source</h2>
        </div>
        <div className="mt-6 space-y-4">
          {metrics.revenue_by_source.length === 0 ? (
            <p className="text-sm text-gray-600">No data available</p>
          ) : (
            metrics.revenue_by_source.map(source => (
              <div key={source.source} className="flex items-center justify-between">
                <div>
                  <p className="font-medium capitalize text-gray-900">{source.source}</p>
                  <p className="text-sm text-gray-600">{source.clients} clients</p>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  £{source.revenue.toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Revenue by Service */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Revenue by Service</h2>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {metrics.revenue_by_service.length === 0 ? (
            <p className="text-sm text-gray-600">No data available</p>
          ) : (
            metrics.revenue_by_service.map(service => (
              <div
                key={service.service}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <p className="text-sm text-gray-600 capitalize">
                  {service.service.replace('_', ' ')}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  £{service.revenue.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-gray-500">{service.count} quotes</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Campaign ROI (placeholder) */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Campaign ROI</h2>
        </div>
        <div className="mt-6">
          <p className="text-sm text-gray-600">
            Campaign revenue attribution coming soon. Link quotes to campaigns to track ROI.
          </p>
        </div>
      </div>
    </div>
  )
}
