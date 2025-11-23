import { Metadata } from 'next'
import { getActiveTenantMembership } from '@/lib/auth'
import { getQuotes } from '@/services/quote.service'
import { Card } from '@/components/ui/card'
import {
  TrendingUp,
  DollarSign,
  Target,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { AnalyticsCharts } from '@/components/analytics/analytics-charts'
import { CrossSellPerformance } from '@/components/analytics/cross-sell-performance'
import { StaffPerformance } from '@/components/analytics/staff-performance'

export const metadata: Metadata = {
  title: 'Analytics | ConveyPro',
  description: 'Business analytics and performance metrics',
}

export default async function AnalyticsPage() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  // Fetch quotes data
  const quotesResult = await getQuotes(membership.tenant_id)
  const quotes = 'quotes' in quotesResult ? quotesResult.quotes : []

  // Calculate metrics
  const totalRevenue = quotes
    .filter((q) => q.status === 'accepted')
    .reduce((sum, q) => sum + Number(q.total_amount), 0)

  const totalQuotes = quotes.length
  const sentQuotes = quotes.filter((q) => q.status === 'sent' || q.status === 'accepted').length
  const acceptedQuotes = quotes.filter((q) => q.status === 'accepted').length
  const conversionRate = sentQuotes > 0 ? (acceptedQuotes / sentQuotes) * 100 : 0

  // Mock cross-sell data (Phase 3 - for demo purposes)
  const crossSellRevenue = totalRevenue * 0.12 // 12% of revenue from cross-selling
  const crossSellOpportunities = Math.floor(acceptedQuotes * 2.5) // Average 2.5 opportunities per client
  const crossSellAccepted = Math.floor(crossSellOpportunities * 0.35) // 35% conversion on cross-sells

  // Average quote value
  const avgQuoteValue = acceptedQuotes > 0 ? totalRevenue / acceptedQuotes : 0

  // Previous period comparison (mock for demo)
  const revenueGrowth = 15.3 // 15.3% growth
  const conversionGrowth = 8.2 // 8.2% improvement

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">
          Track your business performance and cross-sell opportunities
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                £{totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <div className="mt-2 flex items-center text-sm">
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">
                  +{revenueGrowth}%
                </span>
                <span className="ml-1 text-gray-500">vs last month</span>
              </div>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Conversion Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {conversionRate.toFixed(1)}%
              </p>
              <div className="mt-2 flex items-center text-sm">
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">
                  +{conversionGrowth}%
                </span>
                <span className="ml-1 text-gray-500">vs last month</span>
              </div>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Cross-Sell Revenue */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Cross-Sell Revenue</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                £{crossSellRevenue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <div className="mt-2 flex items-center text-sm">
                <span className="font-medium text-blue-600">
                  {crossSellAccepted} services
                </span>
                <span className="ml-1 text-gray-500">accepted</span>
              </div>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Avg Quote Value */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Avg Quote Value</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                £{avgQuoteValue.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <div className="mt-2 flex items-center text-sm">
                <span className="font-medium text-gray-600">
                  {acceptedQuotes} quotes
                </span>
                <span className="ml-1 text-gray-500">accepted</span>
              </div>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <AnalyticsCharts
        quotes={quotes}
        totalRevenue={totalRevenue}
        crossSellRevenue={crossSellRevenue}
      />

      {/* Cross-Sell Performance */}
      <CrossSellPerformance
        crossSellOpportunities={crossSellOpportunities}
        crossSellAccepted={crossSellAccepted}
        crossSellRevenue={crossSellRevenue}
      />

      {/* Staff Performance */}
      <StaffPerformance quotes={quotes} />
    </div>
  )
}
