'use client'

import { CampaignEngagementMetrics } from '@/services/email-engagement.service'

export function EngagementFunnel({ metrics }: { metrics: CampaignEngagementMetrics }) {
  const stages = [
    { name: 'Sent', value: metrics.total_sent, color: 'bg-blue-500' },
    { name: 'Opened', value: metrics.total_opens, color: 'bg-green-500' },
    { name: 'Clicked', value: metrics.total_clicks, color: 'bg-purple-500' },
    { name: 'Converted', value: metrics.total_conversions, color: 'bg-orange-500' },
  ]

  const maxValue = metrics.total_sent

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Engagement Funnel</h3>
      <div className="mt-6 space-y-4">
        {stages.map((stage, index) => {
          const percentage = maxValue > 0 ? (stage.value / maxValue) * 100 : 0
          return (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{stage.name}</span>
                <span className="text-gray-600">
                  {stage.value} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-8 w-full rounded-lg bg-gray-100">
                <div
                  className={`h-full rounded-lg ${stage.color} transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
