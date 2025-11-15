'use client'

import Link from 'next/link'
import { Property } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PropertiesTableProps {
  properties: Property[]
}

export function PropertiesTable({ properties }: PropertiesTableProps) {
  const getPropertyTypeLabel = (type: Property['property_type']) => {
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

  const getPropertyTypeBadge = (type: Property['property_type']) => {
    switch (type) {
      case 'residential':
        return 'bg-blue-100 text-blue-800'
      case 'commercial':
        return 'bg-green-100 text-green-800'
      case 'land':
        return 'bg-yellow-100 text-yellow-800'
      case 'mixed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Address
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Title Number
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Postcode
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Added
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {properties.map((property) => (
            <tr key={property.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 text-sm text-gray-900">
                <div>
                  <p className="font-medium">{property.address_line1}</p>
                  {property.address_line2 && (
                    <p className="text-gray-500">{property.address_line2}</p>
                  )}
                  <p className="text-gray-500">{property.city}</p>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPropertyTypeBadge(property.property_type)}`}
                >
                  {getPropertyTypeLabel(property.property_type)}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                {property.title_number || '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                {property.postcode}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                {formatDistanceToNow(new Date(property.created_at), {
                  addSuffix: true,
                })}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                <Link href={`/properties/${property.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
