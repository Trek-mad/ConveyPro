import { Suspense } from 'react'
import { getActiveTenantMembership } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getConversionFunnel } from '@/services/analytics.service'
import { TrendingDown } from 'lucide-react'

export const metadata = {
  title: 'Conversion Funnel | ConveyPro',
  description: 'Client acquisition to conversion funnel',
}

export default async function ConversionFunnelPage() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    redirect('/auth/login')
  }

  const funnel = await getConversionFunnel(membership.tenant_id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Conversion Funnel</h1>
        <p className="mt-2 text-gray-600">
          Track client journey from acquisition to conversion
        </p>
      </div>

      {/* Funnel Visualization */}
      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <div className="space-y-6">
          {funnel.map((stage, index) => {
            const width = stage.percentage
            const color =
              index === 0 ? 'bg-blue-500' :
              index === 1 ? 'bg-green-500' :
              index === 2 ? 'bg-purple-500' :
              'bg-orange-500'

            return (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold text-gray-900">{stage.stage}</span>
                    {stage.dropoff > 0 && (
                      <span className="ml-2 text-red-600">
                        (-{stage.dropoff} dropoff)
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{stage.count}</span>
                    <span className="ml-2 text-gray-600">({stage.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="h-12 w-full rounded-lg bg-gray-100">
                  <div
                    className={`flex h-full items-center justify-center rounded-lg ${color} text-white font-semibold transition-all`}
                    style={{ width: `${width}%` }}
                  >
                    {width > 15 && `${stage.percentage.toFixed(0)}%`}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Conversion Insights */}
      <div className="grid grid-cols-2 gap-4">
        {/* Overall Conversion Rate */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">Overall Conversion Rate</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {funnel.length > 0 && funnel[0].count > 0
              ? ((funnel[funnel.length - 1].count / funnel[0].count) * 100).toFixed(1)
              : '0'}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Clients to Accepted Quotes
          </p>
        </div>

        {/* Biggest Dropoff */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <p className="text-sm text-gray-600">Biggest Dropoff</p>
          </div>
          {(() => {
            const maxDropoff = funnel.reduce((max, stage) =>
              stage.dropoff > max.dropoff ? stage : max
            , { stage: 'N/A', dropoff: 0 })

            return (
              <>
                <p className="mt-2 text-xl font-bold text-gray-900">{maxDropoff.stage}</p>
                <p className="mt-1 text-sm text-red-600">
                  {maxDropoff.dropoff} clients lost
                </p>
              </>
            )
          })()}
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="text-sm font-semibold text-blue-900">💡 Optimization Tips</h3>
        <ul className="mt-3 space-y-2 text-sm text-blue-800">
          <li>• Focus on stages with highest dropoff to improve conversion</li>
          <li>• Send follow-up emails to clients who received quotes but haven't accepted</li>
          <li>• Use campaign automation to nurture leads through the funnel</li>
          <li>• Track time-to-conversion to identify bottlenecks</li>
        </ul>
      </div>
    </div>
  )
}
