import { Suspense } from 'react'
import { getActiveTenantMembership } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getCampaignEngagementMetrics } from '@/services/email-engagement.service'
import { EmailEngagementCharts } from '@/components/campaigns/email-engagement-charts'
import { EmailPerformanceTable } from '@/components/campaigns/email-performance-table'
import { EngagementFunnel } from '@/components/campaigns/engagement-funnel'
import Link from 'next/link'
import { ArrowLeft, Users, BarChart3 } from 'lucide-react'
import { getCampaign } from '@/services/campaign.service'

export const metadata = {
  title: 'Campaign Analytics | ConveyPro',
  description: 'Email engagement analytics and performance metrics',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CampaignAnalyticsPage({ params }: PageProps) {
  const { id } = await params
  const membership = await getActiveTenantMembership()

  if (!membership) {
    redirect('/auth/login')
  }

  // Get campaign details
  const result = await getCampaign(id)

  if (result.error || !result.campaign) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Campaign not found</h2>
          <p className="mt-2 text-gray-600">{result.error}</p>
          <Link
            href="/campaigns"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  const campaign = result.campaign

  // Get engagement metrics
  const metrics = await getCampaignEngagementMetrics(id, membership.tenant_id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/campaigns/${id}`}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">{campaign.name}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Link
            href={`/campaigns/${id}`}
            className="border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            Overview
          </Link>
          <Link
            href={`/campaigns/${id}/subscribers`}
            className="border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            <Users className="mr-2 inline h-4 w-4" />
            Subscribers
          </Link>
          <Link
            href={`/campaigns/${id}/analytics`}
            className="border-b-2 border-blue-500 px-1 pb-4 text-sm font-medium text-blue-600"
          >
            <BarChart3 className="mr-2 inline h-4 w-4" />
            Analytics
          </Link>
        </nav>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {/* Emails Sent */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">Emails Sent</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {metrics.total_sent.toLocaleString()}
          </p>
        </div>

        {/* Open Rate */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">Open Rate</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {metrics.open_rate.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {metrics.total_opens} opens
          </p>
        </div>

        {/* Click Rate */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">Click Rate</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {metrics.click_rate.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {metrics.total_clicks} clicks
          </p>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">Conversion Rate</p>
          <p className="mt-2 text-3xl font-bold text-purple-600">
            {metrics.conversion_rate.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {metrics.total_conversions} conversions
          </p>
        </div>
      </div>

      {/* Engagement Funnel */}
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-gray-100" />}>
        <EngagementFunnel metrics={metrics} />
      </Suspense>

      {/* Charts */}
      <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-gray-100" />}>
        <EmailEngagementCharts campaignId={id} tenantId={membership.tenant_id} />
      </Suspense>

      {/* Email Performance Table */}
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-gray-100" />}>
        <EmailPerformanceTable campaignId={id} tenantId={membership.tenant_id} />
      </Suspense>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 gap-4">
        {/* Bounce Rate */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">Bounce Rate</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {metrics.bounce_rate.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {metrics.total_bounces} bounces
          </p>
        </div>

        {/* Unsubscribe Rate */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">Unsubscribe Rate</p>
          <p className="mt-2 text-2xl font-bold text-orange-600">
            {metrics.unsubscribe_rate.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {metrics.total_unsubscribes} unsubscribes
          </p>
        </div>

        {/* Spam Reports */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">Spam Reports</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {metrics.spam_reports}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {metrics.spam_report_rate.toFixed(2)}% rate
          </p>
        </div>
      </div>

      {/* Best Performing Time */}
      {metrics.best_send_time && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="text-sm font-semibold text-blue-900">
            📊 Optimal Send Time
          </h3>
          <p className="mt-2 text-sm text-blue-800">
            Based on open rates, the best time to send emails for this campaign is{' '}
            <strong>{metrics.best_send_time}</strong> UTC.
          </p>
        </div>
      )}
    </div>
  )
}
