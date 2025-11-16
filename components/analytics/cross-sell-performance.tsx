'use client'

import { Card } from '@/components/ui/card'
import { TrendingUp, AlertCircle } from 'lucide-react'

interface CrossSellPerformanceProps {
  crossSellOpportunities: number
  crossSellAccepted: number
  crossSellRevenue: number
}

export function CrossSellPerformance({
  crossSellOpportunities,
  crossSellAccepted,
  crossSellRevenue,
}: CrossSellPerformanceProps) {
  // Mock cross-sell service data (Phase 3 feature - for demo)
  const crossSellServices = [
    {
      service: 'Wills & Testament',
      offers: Math.floor(crossSellOpportunities * 0.35),
      accepted: Math.floor(crossSellAccepted * 0.40),
      rate: 40,
      revenue: crossSellRevenue * 0.45,
      avgValue: 750,
    },
    {
      service: 'Power of Attorney',
      offers: Math.floor(crossSellOpportunities * 0.28),
      accepted: Math.floor(crossSellAccepted * 0.30),
      rate: 35,
      revenue: crossSellRevenue * 0.28,
      avgValue: 500,
    },
    {
      service: 'Estate Planning',
      offers: Math.floor(crossSellOpportunities * 0.20),
      accepted: Math.floor(crossSellAccepted * 0.20),
      rate: 45,
      revenue: crossSellRevenue * 0.20,
      avgValue: 1200,
    },
    {
      service: 'Remortgage Advice',
      offers: Math.floor(crossSellOpportunities * 0.17),
      accepted: Math.floor(crossSellAccepted * 0.10),
      rate: 25,
      revenue: crossSellRevenue * 0.07,
      avgValue: 350,
    },
  ]

  const totalOffers = crossSellServices.reduce((sum, s) => sum + s.offers, 0)
  const totalAccepted = crossSellServices.reduce((sum, s) => sum + s.accepted, 0)
  const overallConversionRate = totalOffers > 0 ? (totalAccepted / totalOffers) * 100 : 0

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Cross-Sell Performance
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Revenue generated from additional services (Phase 3 Preview)
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-semibold text-blue-600">
            {overallConversionRate.toFixed(1)}% conversion
          </span>
        </div>
      </div>

      {/* Cross-Sell Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Service
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Offers Sent
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Accepted
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Conv. Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Avg Value
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {crossSellServices.map((service) => (
              <tr key={service.service} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                  {service.service}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                  {service.offers}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                  {service.accepted}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      service.rate >= 40
                        ? 'bg-green-100 text-green-800'
                        : service.rate >= 30
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {service.rate}%
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                  £{service.avgValue.toLocaleString('en-GB')}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-gray-900">
                  £{service.revenue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                {totalOffers}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                {totalAccepted}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                {overallConversionRate.toFixed(1)}%
              </td>
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3 text-sm font-bold text-gray-900">
                £{crossSellRevenue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Info Banner */}
      <div className="mt-6 flex items-start gap-3 rounded-lg bg-blue-50 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-900">
            Phase 3: Automated Cross-Selling
          </h4>
          <p className="mt-1 text-sm text-blue-700">
            This feature will automatically identify cross-sell opportunities based on client data and send
            personalized email sequences. The analytics shown here demonstrate the revenue potential when
            Phase 3 is implemented.
          </p>
        </div>
      </div>
    </Card>
  )
}
