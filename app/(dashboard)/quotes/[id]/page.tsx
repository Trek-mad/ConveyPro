import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getActiveTenantMembership } from '@/lib/auth'
import { getQuote } from '@/services/quote.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, Mail, Download, Edit, Trash2, MapPin } from 'lucide-react'
import { QuoteActions } from '@/components/quotes/quote-actions'
import { formatDistanceToNow, format } from 'date-fns'

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Quote ${params.id} | ConveyPro`,
    description: 'View and manage quote',
  }
}

export default async function QuoteDetailPage({ params }: PageProps) {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  const result = await getQuote(params.id)

  if ('error' in result) {
    notFound()
  }

  const quote = result.quote

  const getStatusColor = (status: typeof quote.status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getTransactionTypeLabel = (type: typeof quote.transaction_type) => {
    switch (type) {
      case 'purchase':
        return 'Purchase'
      case 'sale':
        return 'Sale'
      case 'remortgage':
        return 'Remortgage'
      case 'transfer_of_equity':
        return 'Transfer of Equity'
      default:
        return type
    }
  }

  // Parse fee breakdown
  const feeBreakdown =
    typeof quote.fee_breakdown === 'string'
      ? JSON.parse(quote.fee_breakdown)
      : quote.fee_breakdown

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/quotes">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Quotes
            </Button>
          </Link>
        </div>
        <div className="flex gap-2">
          {quote.status === 'draft' && (
            <Link href={`/quotes/${quote.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Quote Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {quote.quote_number}
            </h1>
            <p className="mt-2 text-gray-600">
              Created {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(quote.status)}`}
          >
            {quote.status}
          </span>
        </div>
      </div>

      {/* Actions */}
      <QuoteActions quote={quote} tenantId={membership.tenant_id} />

      {/* Linked Property */}
      {quote.property && (
        <Card className="bg-blue-50 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Linked Property</h3>
                <p className="mt-1 text-gray-900">{quote.property.address_line1}</p>
                {quote.property.address_line2 && (
                  <p className="text-gray-600">{quote.property.address_line2}</p>
                )}
                <p className="text-gray-600">
                  {quote.property.city}, {quote.property.postcode}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                    {quote.property.property_type}
                  </span>
                  {quote.property.title_number && (
                    <span className="text-xs text-gray-500">
                      Title: {quote.property.title_number}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Link href={`/properties/${quote.property.id}`}>
              <Button variant="outline" size="sm">
                View Property
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Quote Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Client Information */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Client Information
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium text-gray-600">Name</dt>
              <dd className="mt-1 text-gray-900">{quote.client_name}</dd>
            </div>
            {quote.client_email && (
              <div>
                <dt className="font-medium text-gray-600">Email</dt>
                <dd className="mt-1 text-gray-900">{quote.client_email}</dd>
              </div>
            )}
            {quote.client_phone && (
              <div>
                <dt className="font-medium text-gray-600">Phone</dt>
                <dd className="mt-1 text-gray-900">{quote.client_phone}</dd>
              </div>
            )}
          </dl>
        </Card>

        {/* Transaction Information */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Transaction Information
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium text-gray-600">Transaction Type</dt>
              <dd className="mt-1 text-gray-900">
                {getTransactionTypeLabel(quote.transaction_type)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Transaction Value</dt>
              <dd className="mt-1 text-gray-900">
                £{Number(quote.transaction_value).toLocaleString('en-GB')}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Financial Breakdown */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Financial Breakdown
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Base Fee</span>
            <span className="font-medium text-gray-900">
              £{Number(quote.base_fee).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Disbursements</span>
            <span className="font-medium text-gray-900">
              £{Number(quote.disbursements).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              VAT ({feeBreakdown?.vat_rate || 20}%)
            </span>
            <span className="font-medium text-gray-900">
              £{Number(quote.vat_amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total Amount</span>
              <span className="text-xl font-bold text-blue-600">
                £{Number(quote.total_amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Additional Information */}
      {quote.notes && (
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Notes</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-700">
            {quote.notes}
          </p>
        </Card>
      )}

      {/* Timeline */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Timeline</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Created</span>
            <span className="font-medium text-gray-900">
              {format(new Date(quote.created_at), 'PPp')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Updated</span>
            <span className="font-medium text-gray-900">
              {format(new Date(quote.updated_at), 'PPp')}
            </span>
          </div>
          {quote.sent_at && (
            <div className="flex justify-between">
              <span className="text-gray-600">Sent to Client</span>
              <span className="font-medium text-gray-900">
                {format(new Date(quote.sent_at), 'PPp')}
              </span>
            </div>
          )}
          {quote.accepted_at && (
            <div className="flex justify-between">
              <span className="text-gray-600">Accepted</span>
              <span className="font-medium text-green-600">
                {format(new Date(quote.accepted_at), 'PPp')}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
