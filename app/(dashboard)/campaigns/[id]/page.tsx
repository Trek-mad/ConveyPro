import { redirect } from 'next/navigation'
import { getActiveTenantMembership } from '@/lib/auth'
import { getCampaign, getCampaignMetrics } from '@/services/campaign.service'
import { getCampaignSubscribers } from '@/services/campaign.service'
import { CampaignActions } from '@/components/campaigns/campaign-actions'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  Mail,
  Users,
  BarChart3,
  FileText,
  TrendingUp,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params
  const membership = await getActiveTenantMembership()

  if (!membership) {
    redirect('/login')
  }

  const result = await getCampaign(id)

  if (result.error || !result.campaign) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Campaign not found
          </h2>
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
  const metricsResult = await getCampaignMetrics(id)
  const metrics = metricsResult.metrics
  const subscribersResult = await getCampaignSubscribers(id, 'active')
  const activeSubscribers = subscribersResult.subscribers || []

  // Calculate engagement rates
  const openRate = metrics && metrics.emails_sent > 0
    ? (campaign.total_opened / metrics.emails_sent) * 100
    : 0
  const clickRate = metrics && metrics.emails_sent > 0
    ? (campaign.total_clicked / metrics.emails_sent) * 100
    : 0

  // Get status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/campaigns"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {campaign.name}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(campaign.status)}`}
              >
                {campaign.status}
              </span>
            </div>
            {campaign.description && (
              <p className="mt-1 text-sm text-gray-500">
                {campaign.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CampaignActions
            campaignId={id}
            status={campaign.status}
            canEdit={['owner', 'admin'].includes(membership.role)}
          />

          {['owner', 'admin'].includes(membership.role) && (
            <Link
              href={`/campaigns/${id}/edit`}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Link
            href={`/campaigns/${id}`}
            className="border-b-2 border-blue-500 px-1 pb-4 text-sm font-medium text-blue-600"
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
            className="border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            <BarChart3 className="mr-2 inline h-4 w-4" />
            Analytics
          </Link>
        </nav>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-blue-100 p-3">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaign.total_sent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-green-100 p-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {openRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaign.subscriber_count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-amber-100 p-3">
              <BarChart3 className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                £{Number(campaign.estimated_revenue).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Campaign Type
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {campaign.campaign_type.replace('_', ' ')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Status
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {campaign.status}
                  </dd>
                </div>
                {campaign.started_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Started
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(campaign.started_at).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {campaign.target_life_stages && campaign.target_life_stages.length > 0 && (
                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Target Life Stages
                    </dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {campaign.target_life_stages.map((stage) => (
                        <span
                          key={stage}
                          className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                        >
                          {stage.replace('_', ' ')}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Email Templates */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Email Templates
              </h2>
              {['owner', 'admin'].includes(membership.role) && (
                <Link
                  href={`/campaigns/${id}/templates/new`}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <FileText className="mr-1 h-4 w-4" />
                  Add Template
                </Link>
              )}
            </div>

            {!campaign.templates || campaign.templates.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">
                  No templates yet
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Get started by creating your first email template.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {campaign.templates.map((template) => (
                  <div
                    key={template.id}
                    className="px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {template.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {template.subject_line}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span>Sequence: {template.sequence_order}</span>
                          {template.description && (
                            <span className="text-gray-400">
                              {template.description}
                            </span>
                          )}
                        </div>
                      </div>
                      {['owner', 'admin'].includes(membership.role) && (
                        <Link
                          href={`/campaigns/${id}/templates/${template.id}/edit`}
                          className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performance Summary */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900">
              Performance
            </h3>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-xs text-gray-500">Open Rate</dt>
                <dd className="mt-1 flex items-baseline">
                  <span className="text-2xl font-semibold text-gray-900">
                    {Math.round(openRate)}%
                  </span>
                  <div className="ml-2 flex-1">
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${Math.min(openRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </dd>
              </div>

              <div>
                <dt className="text-xs text-gray-500">Click Rate</dt>
                <dd className="mt-1 flex items-baseline">
                  <span className="text-2xl font-semibold text-gray-900">
                    {Math.round(clickRate)}%
                  </span>
                  <div className="ml-2 flex-1">
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${Math.min(clickRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </dd>
              </div>

              <div>
                <dt className="text-xs text-gray-500">Conversions</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {campaign.total_converted}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-gray-500">Revenue</dt>
                <dd className="mt-1 text-2xl font-semibold text-green-600">
                  £{Number(campaign.estimated_revenue).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Active Subscribers */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Active Subscribers
              </h3>
              <Link
                href={`/campaigns/${id}/subscribers`}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>
            </div>
            <div className="p-6">
              {activeSubscribers.length === 0 ? (
                <p className="text-sm text-gray-500">No active subscribers</p>
              ) : (
                <ul className="space-y-3">
                  {activeSubscribers.slice(0, 5).map((subscriber) => (
                    <li
                      key={subscriber.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {subscriber.client ? `${subscriber.client.first_name} ${subscriber.client.last_name}` : 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {subscriber.emails_sent || 0} sent,{' '}
                          {subscriber.emails_opened || 0} opened
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {activeSubscribers.length > 5 && (
                <Link
                  href={`/campaigns/${id}/subscribers`}
                  className="mt-4 block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View {activeSubscribers.length - 5} more
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
