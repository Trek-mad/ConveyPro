import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getActiveTenantMembership } from '@/lib/auth'
import { getQuote, getProperties } from '@/services/quote.service'
import { QuoteEditForm } from '@/components/quotes/quote-edit-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Edit Quote | ConveyPro`,
    description: 'Edit quote details',
  }
}

export default async function EditQuotePage({ params }: PageProps) {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  // Fetch the quote
  const result = await getQuote(params.id)

  if ('error' in result) {
    notFound()
  }

  const quote = result.quote

  // Check if quote can be edited (only drafts)
  if (quote.status !== 'draft') {
    // Redirect to quote detail page with message
    redirect(`/quotes/${params.id}`)
  }

  // Fetch properties for the property selector
  const propertiesResult = await getProperties(membership.tenant_id)
  const properties =
    'properties' in propertiesResult ? propertiesResult.properties : []

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/quotes/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Quote
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Quote</h1>
        <p className="mt-2 text-gray-600">
          Update quote details for {quote.quote_number}
        </p>
      </div>

      {/* Form */}
      <Card className="p-6">
        <QuoteEditForm quote={quote} properties={properties} />
      </Card>
    </div>
  )
}
