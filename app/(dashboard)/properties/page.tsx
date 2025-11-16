import { Metadata } from 'next'
import Link from 'next/link'
import { getActiveTenantMembership } from '@/lib/auth'
import { getProperties } from '@/services/quote.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { PropertiesTable } from '@/components/properties/properties-table'
import { PropertiesFilters } from '@/components/properties/properties-filters'

export const metadata: Metadata = {
  title: 'Properties | ConveyPro',
  description: 'Manage your property records',
}

interface PageProps {
  searchParams: Promise<{
    type?: string
    search?: string
  }>
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams

  // Fetch all properties
  const propertiesResult = await getProperties(membership.tenant_id)
  let properties =
    'properties' in propertiesResult ? propertiesResult.properties : []

  // Apply filters
  if (params.type && params.type !== 'all') {
    properties = properties.filter((p) => p.property_type === params.type)
  }

  if (params.search) {
    const search = params.search.toLowerCase()
    properties = properties.filter(
      (p) =>
        p.address_line1.toLowerCase().includes(search) ||
        p.city.toLowerCase().includes(search) ||
        p.postcode.toLowerCase().includes(search) ||
        p.title_number?.toLowerCase().includes(search)
    )
  }

  // Calculate stats
  const stats = {
    total: properties.length,
    residential: properties.filter((p) => p.property_type === 'residential')
      .length,
    commercial: properties.filter((p) => p.property_type === 'commercial')
      .length,
    land: properties.filter((p) => p.property_type === 'land').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="mt-2 text-gray-600">
            Manage property records for conveyancing transactions
          </p>
        </div>
        <Link href="/properties/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Total Properties</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Residential</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {stats.residential}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Commercial</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {stats.commercial}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Land</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">
            {stats.land}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <PropertiesFilters currentType={params.type} />

      {/* Properties table */}
      <Card className="p-6">
        {properties.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600">No properties found</p>
            <p className="mt-2 text-sm text-gray-500">
              {params.type || params.search
                ? 'Try adjusting your filters'
                : 'Add your first property to get started'}
            </p>
            {!params.type && !params.search && (
              <Link href="/properties/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <PropertiesTable properties={properties} />
        )}
      </Card>
    </div>
  )
}
