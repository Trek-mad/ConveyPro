import { Metadata } from 'next'
import { getActiveTenantMembership } from '@/lib/auth'
import { PropertyForm } from '@/components/properties/property-form'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Add Property | ConveyPro',
  description: 'Add a new property record',
}

export default async function NewPropertyPage() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/properties">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
        <p className="mt-2 text-gray-600">
          Enter property details for conveyancing records
        </p>
      </div>

      {/* Form */}
      <Card className="p-6">
        <PropertyForm tenantId={membership.tenant_id} />
      </Card>
    </div>
  )
}
