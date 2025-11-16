import { Metadata } from 'next'
import { getActiveTenantMembership } from '@/lib/auth'
import { getProperties } from '@/services/quote.service'
import { QuoteFormWithProperty } from '@/components/quotes/quote-form-with-property'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'New Quote | ConveyPro',
  description: 'Create a new conveyancing quote',
}

interface PageProps {
  searchParams: Promise<{
    property?: string
  }>
}

export default async function NewQuotePage({ searchParams }: PageProps) {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  // Fetch properties for the property selector
  const propertiesResult = await getProperties(membership.tenant_id)
  const properties =
    'properties' in propertiesResult ? propertiesResult.properties : []

  // Get default property ID from query parameter (Next.js 15: searchParams is now a Promise)
  const params = await searchParams
  const defaultPropertyId = params.property

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/quotes">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Quotes
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Quote</h1>
        <p className="mt-2 text-gray-600">
          Fill in the details below to generate a conveyancing quote
        </p>
      </div>

      {/* Form */}
      <Card className="p-6">
        <QuoteFormWithProperty
          tenantId={membership.tenant_id}
          properties={properties}
          defaultPropertyId={defaultPropertyId}
        />
      </Card>
    </div>
  )
}
