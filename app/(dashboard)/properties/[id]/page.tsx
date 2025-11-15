import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getActiveTenantMembership } from '@/lib/auth'
import { getProperty, getQuotesByProperty } from '@/services/quote.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, Edit, MapPin, FileText, Plus } from 'lucide-react'
import { format } from 'date-fns'

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Property ${params.id} | ConveyPro`,
    description: 'View property details',
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  const result = await getProperty(params.id, membership.tenant_id)

  if ('error' in result) {
    notFound()
  }

  const property = result.property

  // Fetch related quotes
  const quotesResult = await getQuotesByProperty(params.id, membership.tenant_id)
  const quotes = 'quotes' in quotesResult ? quotesResult.quotes : []

  const getPropertyTypeLabel = (type: typeof property.property_type) => {
    switch (type) {
      case 'residential':
        return 'Residential'
      case 'commercial':
        return 'Commercial'
      case 'land':
        return 'Land'
      case 'mixed':
        return 'Mixed Use'
      default:
        return type
    }
  }

  const getTenureLabel = (tenure: typeof property.tenure) => {
    if (!tenure) return '—'
    return tenure.charAt(0).toUpperCase() + tenure.slice(1)
  }

  // Parse metadata
  const metadata =
    typeof property.metadata === 'string'
      ? JSON.parse(property.metadata)
      : property.metadata

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/properties">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Properties
            </Button>
          </Link>
        </div>
        <div className="flex gap-2">
          <Link href={`/properties/${property.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Property Header */}
      <div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {property.address_line1}
            </h1>
            <p className="mt-1 text-gray-600">
              {property.address_line2 && `${property.address_line2}, `}
              {property.city}, {property.postcode}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  property.property_type === 'residential'
                    ? 'bg-blue-100 text-blue-800'
                    : property.property_type === 'commercial'
                      ? 'bg-green-100 text-green-800'
                      : property.property_type === 'land'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-purple-100 text-purple-800'
                }`}
              >
                {getPropertyTypeLabel(property.property_type)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Address Details */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Address Details
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium text-gray-600">Full Address</dt>
              <dd className="mt-1 text-gray-900">
                {property.address_line1}
                {property.address_line2 && (
                  <>
                    <br />
                    {property.address_line2}
                  </>
                )}
                <br />
                {property.city}
                <br />
                {property.postcode}
                {property.country && (
                  <>
                    <br />
                    {property.country}
                  </>
                )}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Property Information */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Property Information
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium text-gray-600">Property Type</dt>
              <dd className="mt-1 text-gray-900">
                {getPropertyTypeLabel(property.property_type)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Tenure</dt>
              <dd className="mt-1 text-gray-900">
                {getTenureLabel(property.tenure)}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Land Registry Information */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Land Registry Information
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-600">Title Number</dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {property.title_number || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600">
              UPRN (Unique Property Reference Number)
            </dt>
            <dd className="mt-1 font-mono text-sm text-gray-900">
              {property.uprn || '—'}
            </dd>
          </div>
        </div>
      </Card>

      {/* Additional Information */}
      {metadata?.description && (
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Description / Notes
          </h2>
          <p className="whitespace-pre-wrap text-sm text-gray-700">
            {metadata.description}
          </p>
        </Card>
      )}

      {/* Related Quotes */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Related Quotes
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Quotes linked to this property
            </p>
          </div>
          <Link href={`/quotes/new?property=${property.id}`}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Quote
            </Button>
          </Link>
        </div>

        {quotes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-600">No quotes yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Create a quote for this property to get started
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Quote #
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Client
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                      {quote.quote_number}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      {quote.client_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      £{Number(quote.total_amount).toLocaleString('en-GB')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          quote.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : quote.status === 'sent'
                              ? 'bg-blue-100 text-blue-800'
                              : quote.status === 'draft'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {quote.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right text-sm">
                      <Link href={`/quotes/${quote.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Record Information */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Record Information
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Created</span>
            <span className="font-medium text-gray-900">
              {format(new Date(property.created_at), 'PPp')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Updated</span>
            <span className="font-medium text-gray-900">
              {format(new Date(property.updated_at), 'PPp')}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
