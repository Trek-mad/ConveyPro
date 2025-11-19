import { Suspense } from 'react'
import { getActiveTenantMembership } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getHotLeads } from '@/services/lead-scoring.service'
import { Flame, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Hot Leads | ConveyPro',
  description: 'High-priority clients requiring immediate attention',
}

export default async function HotLeadsPage() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    redirect('/auth/login')
  }

  const hotLeads = await getHotLeads(membership.tenant_id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hot Leads</h1>
        <p className="mt-2 text-gray-600">
          High-priority clients requiring immediate attention based on AI scoring
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-700">Hot Leads</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-red-900">{hotLeads.length}</p>
          <p className="mt-1 text-xs text-red-600">Score 70-100</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-600" />
            <p className="text-sm font-medium text-gray-700">Avg Score</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {hotLeads.length > 0
              ? Math.round(hotLeads.reduce((sum, l) => sum + l.score, 0) / hotLeads.length)
              : 0}
          </p>
          <p className="mt-1 text-xs text-gray-500">Out of 100</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-gray-600" />
            <p className="text-sm font-medium text-gray-700">Requires Action</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {hotLeads.filter(l => l.recommendations.length > 0).length}
          </p>
          <p className="mt-1 text-xs text-gray-500">With recommendations</p>
        </div>
      </div>

      {/* Hot Leads List */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Priority Clients</h2>
          <p className="mt-1 text-sm text-gray-600">
            Clients with score 70+ requiring immediate attention
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {hotLeads.length === 0 ? (
            <div className="p-12 text-center">
              <Flame className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-sm font-medium text-gray-900">No hot leads yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Hot leads will appear here as clients engage with your campaigns
              </p>
            </div>
          ) : (
            hotLeads.map(lead => (
              <div key={lead.client_id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/clients/${lead.client_id}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                      >
                        View Client
                      </Link>
                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
                        {lead.score} pts
                      </span>
                    </div>

                    {/* Score Breakdown */}
                    <div className="mt-3 grid grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-gray-600">Engagement</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {lead.factors.engagement}/30
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Property Value</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {lead.factors.property_value}/25
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Response Time</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {lead.factors.response_time}/20
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Service History</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {lead.factors.service_history}/15
                        </p>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {lead.recommendations.length > 0 && (
                      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <p className="text-xs font-semibold text-blue-900">
                          💡 Recommended Actions:
                        </p>
                        <ul className="mt-2 space-y-1">
                          {lead.recommendations.map((rec, i) => (
                            <li key={i} className="text-xs text-blue-800">
                              • {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Scoring Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-gray-900">How Lead Scoring Works</h3>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Email Engagement (30 pts)</p>
            <p className="text-gray-600">Opens, clicks, and response rates</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Property Value (25 pts)</p>
            <p className="text-gray-600">Transaction value and potential revenue</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Response Time (20 pts)</p>
            <p className="text-gray-600">How quickly they accept quotes</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Service History (15 pts)</p>
            <p className="text-gray-600">Repeat business and loyalty</p>
          </div>
        </div>
        <div className="mt-4 flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-gray-600">70-100: Hot Lead</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            <span className="text-gray-600">40-69: Warm Lead</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-gray-600">0-39: Cold Lead</span>
          </div>
        </div>
      </div>
    </div>
  )
}
