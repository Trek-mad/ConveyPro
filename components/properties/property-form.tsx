'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createProperty } from '@/services/quote.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const propertySchema = z.object({
  // Address
  address_line1: z.string().min(1, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  country: z.string().optional(),

  // Property details
  property_type: z.enum(['residential', 'commercial', 'land', 'mixed']),
  tenure: z.enum(['freehold', 'leasehold', 'commonhold']).optional(),

  // Land Registry
  title_number: z.string().optional(),
  uprn: z.string().optional(),

  // Additional info
  description: z.string().optional(),
})

type PropertyFormData = z.infer<typeof propertySchema>

interface PropertyFormProps {
  tenantId: string
}

export function PropertyForm({ tenantId }: PropertyFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      property_type: 'residential',
      country: 'Scotland',
    },
  })

  const onSubmit = async (data: PropertyFormData) => {
    setIsLoading(true)
    setError(null)

    const result = await createProperty({
      tenant_id: tenantId,
      address_line1: data.address_line1,
      address_line2: data.address_line2 || null,
      city: data.city,
      postcode: data.postcode,
      country: data.country || 'Scotland',
      property_type: data.property_type,
      tenure: data.tenure || null,
      title_number: data.title_number || null,
      uprn: data.uprn || null,
      metadata: data.description
        ? { description: data.description }
        : null,
    })

    if ('error' in result) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    // Redirect to property detail page
    router.push(`/properties/${result.property.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Address Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Address Information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="address_line1">
              Address Line 1 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address_line1"
              placeholder="123 High Street"
              {...register('address_line1')}
              className="mt-1"
            />
            {errors.address_line1 && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address_line1.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="address_line2">Address Line 2</Label>
            <Input
              id="address_line2"
              placeholder="Apartment 4B"
              {...register('address_line2')}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="city">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              placeholder="Edinburgh"
              {...register('city')}
              className="mt-1"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="postcode">
              Postcode <span className="text-red-500">*</span>
            </Label>
            <Input
              id="postcode"
              placeholder="EH1 1AA"
              {...register('postcode')}
              className="mt-1"
            />
            {errors.postcode && (
              <p className="mt-1 text-sm text-red-600">
                {errors.postcode.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="Scotland"
              {...register('country')}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Property Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="property_type">
              Property Type <span className="text-red-500">*</span>
            </Label>
            <Select
              defaultValue="residential"
              onValueChange={(value) =>
                setValue(
                  'property_type',
                  value as PropertyFormData['property_type']
                )
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="land">Land</SelectItem>
                <SelectItem value="mixed">Mixed Use</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tenure">Tenure</Label>
            <Select
              onValueChange={(value) =>
                setValue('tenure', value as PropertyFormData['tenure'])
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select tenure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="freehold">Freehold</SelectItem>
                <SelectItem value="leasehold">Leasehold</SelectItem>
                <SelectItem value="commonhold">Commonhold</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-gray-500">
              Ownership type (freehold, leasehold, etc.)
            </p>
          </div>
        </div>
      </div>

      {/* Land Registry Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Land Registry Information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="title_number">Title Number</Label>
            <Input
              id="title_number"
              placeholder="ABC123456"
              {...register('title_number')}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">
              Official Land Registry title number
            </p>
          </div>

          <div>
            <Label htmlFor="uprn">UPRN</Label>
            <Input
              id="uprn"
              placeholder="100012345678"
              {...register('uprn')}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">
              Unique Property Reference Number
            </p>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Additional Information
        </h2>
        <div>
          <Label htmlFor="description">Description / Notes</Label>
          <textarea
            id="description"
            rows={4}
            placeholder="Any additional notes about this property..."
            {...register('description')}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/properties')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Property'}
        </Button>
      </div>
    </form>
  )
}
