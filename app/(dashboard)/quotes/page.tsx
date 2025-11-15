import { Metadata } from 'next'
import Link from 'next/link'
import { getActiveTenantMembership } from '@/lib/auth'
import { getQuotes } from '@/services/quote.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { QuotesTable } from '@/components/quotes/quotes-table'
import { QuotesFilters } from '@/components/quotes/quotes-filters'

export const metadata: Metadata = {
  title: 'Quotes | ConveyPro',
  description: 'Manage your conveyancing quotes',
}

interface PageProps {
  searchParams: {
    status?: string
    search?: string
  }
}

export default async function QuotesPage({ searchParams }: PageProps) {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  // Fetch all quotes
  const quotesResult = await getQuotes(membership.tenant_id)
  let quotes = 'quotes' in quotesResult ? quotesResult.quotes : []

  // Apply filters
  if (searchParams.status && searchParams.status !== 'all') {
    quotes = quotes.filter((q) => q.status === searchParams.status)
  }

  if (searchParams.search) {
    const search = searchParams.search.toLowerCase()
    quotes = quotes.filter(
      (q) =>
        q.quote_number.toLowerCase().includes(search) ||
        q.client_name.toLowerCase().includes(search) ||
        q.client_email?.toLowerCase().includes(search)
    )
  }

  // Calculate stats
  const stats = {
    total: quotes.length,
    draft: quotes.filter((q) => q.status === 'draft').length,
    sent: quotes.filter((q) => q.status === 'sent').length,
    accepted: quotes.filter((q) => q.status === 'accepted').length,
    rejected: quotes.filter((q) => q.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
          <p className="mt-2 text-gray-600">
            Manage your conveyancing quotes and proposals
          </p>
        </div>
        <Link href="/quotes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Total</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Draft</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">
            {stats.draft}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Sent</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{stats.sent}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Accepted</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {stats.accepted}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Rejected</p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {stats.rejected}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <QuotesFilters currentStatus={searchParams.status} />

      {/* Quotes table */}
      <Card className="p-6">
        {quotes.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600">No quotes found</p>
            <p className="mt-2 text-sm text-gray-500">
              {searchParams.status || searchParams.search
                ? 'Try adjusting your filters'
                : 'Create your first quote to get started'}
            </p>
            {!searchParams.status && !searchParams.search && (
              <Link href="/quotes/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Quote
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <QuotesTable quotes={quotes} />
        )}
      </Card>
    </div>
  )
}
