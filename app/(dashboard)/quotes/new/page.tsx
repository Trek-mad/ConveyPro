import { Metadata } from 'next'
import { getActiveTenantMembership } from '@/lib/auth'
import { QuoteForm } from '@/components/quotes/quote-form'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'New Quote | ConveyPro',
  description: 'Create a new conveyancing quote',
}

export default async function NewQuotePage() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

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
        <QuoteForm tenantId={membership.tenant_id} />
      </Card>
    </div>
  )
}
