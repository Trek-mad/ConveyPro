'use client'

import { Card } from '@/components/ui/card'
import { Trophy, TrendingUp } from 'lucide-react'

interface StaffPerformanceProps {
  quotes: any[]
}

export function StaffPerformance({ quotes }: StaffPerformanceProps) {
  // Group quotes by staff member (using created_by or mock data)
  const staffStats = quotes.reduce((acc: any, quote) => {
    const staffName = quote.created_by_name || 'Unknown Staff'

    if (!acc[staffName]) {
      acc[staffName] = {
        name: staffName,
        quotesCreated: 0,
        quotesAccepted: 0,
        revenue: 0,
        crossSells: 0, // Mock for demo
      }
    }

    acc[staffName].quotesCreated++

    if (quote.status === 'accepted') {
      acc[staffName].quotesAccepted++
      acc[staffName].revenue += Number(quote.total_amount)
      // Mock cross-sell data (35% of accepted quotes generate cross-sell)
      if (Math.random() > 0.65) {
        acc[staffName].crossSells++
      }
    }

    return acc
  }, {})

  // Convert to array and sort by revenue
  const staffArray = Object.values(staffStats)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 5) // Top 5

  // If no staff data, show mock data for demo
  const displayData = staffArray.length > 0 ? staffArray : [
    {
      name: 'Sarah McDonald',
      quotesCreated: 18,
      quotesAccepted: 12,
      revenue: 42500,
      crossSells: 4,
    },
    {
      name: 'James Anderson',
      quotesCreated: 15,
      quotesAccepted: 10,
      revenue: 38000,
      crossSells: 3,
    },
    {
      name: 'Emma Davidson',
      quotesCreated: 14,
      quotesAccepted: 9,
      revenue: 32000,
      crossSells: 2,
    },
  ]

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Staff Performance
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Top performers this month
          </p>
        </div>
        <Trophy className="h-6 w-6 text-yellow-500" />
      </div>

      <div className="space-y-4">
        {displayData.map((staff: any, index: number) => {
          const conversionRate = staff.quotesCreated > 0
            ? (staff.quotesAccepted / staff.quotesCreated) * 100
            : 0

          return (
            <div
              key={staff.name}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    index === 0
                      ? 'bg-yellow-100 text-yellow-700'
                      : index === 1
                        ? 'bg-gray-100 text-gray-700'
                        : index === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  #{index + 1}
                </div>

                {/* Staff Info */}
                <div>
                  <p className="font-semibold text-gray-900">{staff.name}</p>
                  <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                    <span>{staff.quotesCreated} quotes</span>
                    <span className="text-gray-400">•</span>
                    <span>{staff.quotesAccepted} accepted</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-medium text-green-600">
                      {staff.crossSells} cross-sells
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  £{staff.revenue.toLocaleString('en-GB', { minimumFractionDigits: 0 })}
                </p>
                <div className="mt-1 flex items-center justify-end gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-600">
                    {conversionRate.toFixed(0)}%
                  </span>
                  <span className="text-gray-500">conversion</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {staffArray.length === 0 && (
        <p className="mt-4 text-center text-sm text-gray-500">
          This is demo data. Real staff performance will appear as quotes are created.
        </p>
      )}
    </Card>
  )
}
