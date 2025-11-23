import { redirect } from 'next/navigation'
import { getActiveTenantMembership } from '@/lib/auth'
import { getCampaigns } from '@/services/campaign.service'
import Link from 'next/link'
import { Plus, Play, Pause, BarChart3, Mail, Users } from 'lucide-react'

export default async function CampaignsPage() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    redirect('/login')
  }

  const result = await getCampaigns(membership.tenant_id)
  const campaigns = result.campaigns || []

  // Calculate stats
  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'active').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.total_sent, 0),
    totalRevenue: campaigns.reduce(
      (sum, c) => sum + Number(c.estimated_revenue),
      0
    ),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Email Campaigns
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Automated cross-selling email campaigns
          </p>
        </div>

        {['owner', 'admin'].includes(membership.role) && (
          <Link
            href="/campaigns/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-blue-100 p-3">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total Campaigns
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-green-100 p-3">
              <Play className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Active Campaigns
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalSent.toLocaleString()}
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
              <p className="text-sm font-medium text-gray-500">Est. Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                £{stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            All Campaigns
          </h2>
        </div>

        {campaigns.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">
              No campaigns yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating your first email campaign.
            </p>
            {['owner', 'admin'].includes(membership.role) && (
              <Link
                href="/campaigns/new"
                className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-gray-900">
                        {campaign.name}
                      </h3>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          campaign.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : campaign.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-800'
                            : campaign.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : campaign.status === 'archived'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {campaign.status}
                      </span>

                      {/* Campaign Type Badge */}
                      <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                        {campaign.campaign_type.replace('_', ' ')}
                      </span>
                    </div>

                    {campaign.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                        {campaign.description}
                      </p>
                    )}

                    {/* Metrics */}
                    <div className="mt-3 flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>{campaign.total_sent} sent</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>
                          {campaign.total_sent > 0
                            ? Math.round(
                                (campaign.total_opened / campaign.total_sent) *
                                  100
                              )
                            : 0}
                          % opened
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>
                          {campaign.total_sent > 0
                            ? Math.round(
                                (campaign.total_clicked / campaign.total_sent) *
                                  100
                              )
                            : 0}
                          % clicked
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>
                          {campaign.total_converted} conversions
                        </span>
                      </div>
                      {Number(campaign.estimated_revenue) > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-green-600">
                            £{Number(campaign.estimated_revenue).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Icons */}
                  <div className="ml-4 flex items-center gap-2">
                    {campaign.status === 'active' && (
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
