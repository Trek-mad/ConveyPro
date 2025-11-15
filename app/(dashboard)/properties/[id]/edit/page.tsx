import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getActiveTenantMembership } from '@/lib/auth'
import { getProperty } from '@/services/quote.service'
import { PropertyEditForm } from '@/components/properties/property-edit-form'
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
    title: `Edit Property | ConveyPro`,
    description: 'Edit property details',
  }
}

export default async function EditPropertyPage({ params }: PageProps) {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  // Fetch the property
  const result = await getProperty(params.id, membership.tenant_id)

  if ('error' in result) {
    notFound()
  }

  const property = result.property

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/properties/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Property
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
        <p className="mt-2 text-gray-600">
          Update property details for {property.address_line1}
        </p>
      </div>

      {/* Form */}
      <Card className="p-6">
        <PropertyEditForm property={property} />
      </Card>
    </div>
  )
}
