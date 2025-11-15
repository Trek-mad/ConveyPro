'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Tenant } from '@/types'
import { updateTenant } from '@/services/tenant.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const firmSchema = z.object({
  name: z.string().min(2, 'Firm name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
})

type FirmFormData = z.infer<typeof firmSchema>

interface FirmSettingsFormProps {
  tenant: Tenant
  userRole: 'owner' | 'admin'
}

export function FirmSettingsForm({ tenant, userRole }: FirmSettingsFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FirmFormData>({
    resolver: zodResolver(firmSchema),
    defaultValues: {
      name: tenant.name,
      email: tenant.email || '',
      phone: tenant.phone || '',
      address_line1: tenant.address_line1 || '',
      address_line2: tenant.address_line2 || '',
      city: tenant.city || '',
      postcode: tenant.postcode || '',
    },
  })

  const onSubmit = async (data: FirmFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const result = await updateTenant(tenant.id, {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address_line1: data.address_line1 || null,
      address_line2: data.address_line2 || null,
      city: data.city || null,
      postcode: data.postcode || null,
    })

    if ('error' in result) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)
    router.refresh()

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3">
          <p className="text-sm text-green-800">
            ✓ Firm settings updated successfully
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="name">
          Firm Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Smith & Associates Solicitors"
          {...register('name')}
          className="mt-1"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="info@smithassociates.co.uk"
            {...register('email')}
            className="mt-1"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="0131 123 4567"
            {...register('phone')}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address_line1">Address Line 1</Label>
        <Input
          id="address_line1"
          placeholder="123 High Street"
          {...register('address_line1')}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="address_line2">Address Line 2</Label>
        <Input
          id="address_line2"
          placeholder="Suite 200"
          {...register('address_line2')}
          className="mt-1"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="Edinburgh"
            {...register('city')}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="postcode">Postcode</Label>
          <Input
            id="postcode"
            placeholder="EH1 1AA"
            {...register('postcode')}
            className="mt-1"
          />
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isLoading || !isDirty}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
