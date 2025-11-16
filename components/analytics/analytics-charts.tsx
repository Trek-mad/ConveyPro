'use client'

import { Card } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface AnalyticsChartsProps {
  quotes: any[]
  totalRevenue: number
  crossSellRevenue: number
}

export function AnalyticsCharts({
  quotes,
  totalRevenue,
  crossSellRevenue,
}: AnalyticsChartsProps) {
  // Revenue trend data (mock - last 6 months)
  const revenueData = [
    { month: 'Jun', revenue: totalRevenue * 0.65, crossSell: crossSellRevenue * 0.5 },
    { month: 'Jul', revenue: totalRevenue * 0.72, crossSell: crossSellRevenue * 0.6 },
    { month: 'Aug', revenue: totalRevenue * 0.78, crossSell: crossSellRevenue * 0.7 },
    { month: 'Sep', revenue: totalRevenue * 0.85, crossSell: crossSellRevenue * 0.8 },
    { month: 'Oct', revenue: totalRevenue * 0.92, crossSell: crossSellRevenue * 0.9 },
    { month: 'Nov', revenue: totalRevenue, crossSell: crossSellRevenue },
  ]

  // Service breakdown data
  const serviceData = [
    { name: 'Residential Purchase', value: totalRevenue * 0.45, color: '#3b82f6' },
    { name: 'Sale Only', value: totalRevenue * 0.20, color: '#8b5cf6' },
    { name: 'Buy & Sell', value: totalRevenue * 0.23, color: '#10b981' },
    { name: 'Cross-Sell (Wills)', value: crossSellRevenue * 0.50, color: '#f59e0b' },
    { name: 'Cross-Sell (PoA)', value: crossSellRevenue * 0.30, color: '#ef4444' },
    { name: 'Cross-Sell (Other)', value: crossSellRevenue * 0.20, color: '#06b6d4' },
  ]

  // Conversion funnel data
  const funnelData = [
    {
      stage: 'Created',
      count: quotes.length,
      percentage: 100,
    },
    {
      stage: 'Sent',
      count: quotes.filter((q) => q.status === 'sent' || q.status === 'accepted').length,
      percentage: quotes.length > 0
        ? ((quotes.filter((q) => q.status === 'sent' || q.status === 'accepted').length / quotes.length) * 100)
        : 0,
    },
    {
      stage: 'Accepted',
      count: quotes.filter((q) => q.status === 'accepted').length,
      percentage: quotes.length > 0
        ? ((quotes.filter((q) => q.status === 'accepted').length / quotes.length) * 100)
        : 0,
    },
    {
      stage: 'Cross-Sell',
      count: Math.floor(quotes.filter((q) => q.status === 'accepted').length * 0.35 * 2.5),
      percentage: quotes.length > 0
        ? ((Math.floor(quotes.filter((q) => q.status === 'accepted').length * 0.35 * 2.5) / quotes.length) * 100)
        : 0,
    },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Revenue Trend */}
      <Card className="p-6">
        <h3 className="mb-6 text-lg font-semibold text-gray-900">
          Revenue Trend (Last 6 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              formatter={(value: number) => `£${value.toLocaleString('en-GB', { minimumFractionDigits: 0 })}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Total Revenue"
              dot={{ fill: '#3b82f6' }}
            />
            <Line
              type="monotone"
              dataKey="crossSell"
              stroke="#10b981"
              strokeWidth={2}
              name="Cross-Sell Revenue"
              dot={{ fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Service Breakdown */}
      <Card className="p-6">
        <h3 className="mb-6 text-lg font-semibold text-gray-900">
          Revenue by Service Type
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={serviceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {serviceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `£${value.toLocaleString('en-GB', { minimumFractionDigits: 0 })}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Conversion Funnel */}
      <Card className="p-6 lg:col-span-2">
        <h3 className="mb-6 text-lg font-semibold text-gray-900">
          Conversion Funnel
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnelData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" />
            <YAxis dataKey="stage" type="category" stroke="#6b7280" width={100} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'Percentage') return `${value.toFixed(1)}%`
                return value
              }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Count" />
            <Bar dataKey="percentage" fill="#10b981" name="Percentage" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-4 gap-4 text-center text-sm">
          {funnelData.map((stage) => (
            <div key={stage.stage} className="rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-900">{stage.count}</p>
              <p className="text-gray-600">{stage.stage}</p>
              <p className="text-xs text-gray-500">{stage.percentage.toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
