import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getActiveTenantMembership } from '@/lib/auth'
import { getClient, getClientStats } from '@/services/client.service'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Mail,
  Phone,
  MapPin,
  Tag,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Edit,
  ArrowLeft,
} from 'lucide-react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Client Details | ConveyPro`,
    description: 'View client details and cross-sell opportunities',
  }
}

export default async function ClientDetailPage({ params }: PageProps) {
  const membership = await getActiveTenantMembership()
  const { id } = await params

  if (!membership) {
    return null
  }

  // Fetch client data
  const clientResult = await getClient(id)
  if ('error' in clientResult) {
    notFound()
  }

  const { client } = clientResult

  // Type assertion for joined quotes data
  const clientWithQuotes = client as typeof client & {
    quotes: Array<{
      id: string
      quote_number: string
      transaction_type: string
      status: string
      total_amount: number
      created_at: string
    }>
  }

  // Fetch client stats
  const statsResult = await getClientStats(id)
  const stats = 'stats' in statsResult ? statsResult.stats : null

  // Identify cross-sell opportunities (Phase 3 feature)
  const servicesUsed = (clientWithQuotes.services_used as string[]) || []
  const crossSellOpportunities = [
    {
      service: 'Will & Testament',
      used: servicesUsed.includes('will'),
      priority: 'high',
      reason: clientWithQuotes.life_stage === 'first-time-buyer' ? 'New homeowner' : 'Asset protection',
      estimatedValue: 750,
    },
    {
      service: 'Power of Attorney',
      used: servicesUsed.includes('poa'),
      priority: 'high',
      reason: 'Financial planning',
      estimatedValue: 500,
    },
    {
      service: 'Estate Planning',
      used: servicesUsed.includes('estate'),
      priority: clientWithQuotes.life_stage === 'retired' ? 'high' : 'medium',
      reason: 'Wealth management',
      estimatedValue: 1200,
    },
    {
      service: 'Remortgage',
      used: servicesUsed.includes('remortgage'),
      priority: 'medium',
      reason: 'Better rates available',
      estimatedValue: 350,
    },
  ]

  const unusedOpportunities = crossSellOpportunities.filter((opp) => !opp.used)
  const potentialRevenue = unusedOpportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clients
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {clientWithQuotes.first_name} {clientWithQuotes.last_name}
            </h1>
            {clientWithQuotes.life_stage && (
              <p className="mt-1 text-gray-600">
                {clientWithQuotes.life_stage.replace(/-/g, ' ').charAt(0).toUpperCase() + clientWithQuotes.life_stage.replace(/-/g, ' ').slice(1)}
              </p>
            )}
          </div>
        </div>
        <Link href={`/clients/${clientWithQuotes.id}/edit`}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Client
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quotes</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalQuotes}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted Quotes</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.acceptedQuotes}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  £{stats.totalValue.toLocaleString('en-GB', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client Information */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact Information */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Contact Information
            </h2>
            <div className="space-y-3">
              {clientWithQuotes.email && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <a href={`mailto:${clientWithQuotes.email}`} className="hover:text-blue-600">
                    {clientWithQuotes.email}
                  </a>
                </div>
              )}
              {clientWithQuotes.phone && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <a href={`tel:${clientWithQuotes.phone}`} className="hover:text-blue-600">
                    {clientWithQuotes.phone}
                  </a>
                </div>
              )}
              {(clientWithQuotes.address_line1 || clientWithQuotes.city) && (
                <div className="flex items-start gap-3 text-gray-700">
                  <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    {clientWithQuotes.address_line1 && <p>{clientWithQuotes.address_line1}</p>}
                    {clientWithQuotes.address_line2 && <p>{clientWithQuotes.address_line2}</p>}
                    {(clientWithQuotes.city || clientWithQuotes.postcode) && (
                      <p>
                        {clientWithQuotes.city}
                        {clientWithQuotes.city && clientWithQuotes.postcode && ', '}
                        {clientWithQuotes.postcode}
                      </p>
                    )}
                    {clientWithQuotes.country && <p>{clientWithQuotes.country}</p>}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Cross-Sell Opportunities */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Cross-Sell Opportunities
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Phase 3 feature - Automated opportunity identification
                </p>
              </div>
              {unusedOpportunities.length > 0 && (
                <div className="rounded-lg bg-green-100 px-3 py-1.5">
                  <p className="text-sm font-semibold text-green-800">
                    £{potentialRevenue.toLocaleString('en-GB')} potential
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {crossSellOpportunities.map((opportunity) => (
                <div
                  key={opportunity.service}
                  className={`flex items-start justify-between rounded-lg border p-4 ${
                    opportunity.used
                      ? 'border-gray-200 bg-gray-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {opportunity.service}
                      </h3>
                      {opportunity.used ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{opportunity.reason}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Est. value: £{opportunity.estimatedValue.toLocaleString('en-GB')}
                    </p>
                  </div>
                  <div>
                    {opportunity.used ? (
                      <span className="text-sm font-medium text-green-700">Used</span>
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          opportunity.priority === 'high'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }`}
                      >
                        {opportunity.priority.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {unusedOpportunities.length > 0 && (
              <div className="mt-4 rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                  <strong>Phase 3:</strong> Automated email sequences will be sent to this
                  client based on their profile and transaction history.
                </p>
              </div>
            )}
          </Card>

          {/* Recent Quotes */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Recent Quotes
            </h2>
            {clientWithQuotes.quotes && clientWithQuotes.quotes.length > 0 ? (
              <div className="space-y-3">
                {clientWithQuotes.quotes.slice(0, 5).map((quote: any) => (
                  <Link
                    key={quote.id}
                    href={`/quotes/${quote.id}`}
                    className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {quote.quote_number}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {quote.transaction_type.charAt(0).toUpperCase() +
                            quote.transaction_type.slice(1)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          £{Number(quote.total_amount).toLocaleString('en-GB')}
                        </p>
                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            quote.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : quote.status === 'sent'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {quote.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No quotes yet</p>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Details */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Client Details
            </h2>
            <div className="space-y-3">
              {clientWithQuotes.client_type && (
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {clientWithQuotes.client_type.charAt(0).toUpperCase() + clientWithQuotes.client_type.slice(1)}
                  </p>
                </div>
              )}
              {clientWithQuotes.source && (
                <div>
                  <p className="text-xs text-gray-500">Source</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {clientWithQuotes.source.charAt(0).toUpperCase() + clientWithQuotes.source.slice(1)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Client Since</p>
                <p className="mt-1 font-medium text-gray-900">
                  {new Date(clientWithQuotes.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </Card>

          {/* Tags */}
          {clientWithQuotes.tags && clientWithQuotes.tags.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {clientWithQuotes.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          {client.notes && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Notes</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
