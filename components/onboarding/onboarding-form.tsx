'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createTenant } from '@/services/tenant.service'

const onboardingSchema = z.object({
  firmName: z.string().min(2, 'Firm name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

interface OnboardingFormProps {
  userId: string
}

export function OnboardingForm({ userId }: OnboardingFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  })

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true)
    setError(null)

    // Generate slug from firm name
    const slug = data.firmName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const result = await createTenant({
      name: data.firmName,
      slug,
      email: data.email || null,
      phone: data.phone || null,
      address_line1: data.addressLine1 || null,
      city: data.city || null,
      postcode: data.postcode || null,
      country: 'Scotland',
      status: 'active',
      subscription_tier: 'trial',
    })

    if ('error' in result) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    // Success! Redirect to dashboard
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Firm Information
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Tell us about your solicitor firm
          </p>
        </div>

        <div>
          <Label htmlFor="firmName">
            Firm name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firmName"
            type="text"
            placeholder="Acme Solicitors Ltd"
            {...register('firmName')}
            className="mt-1"
          />
          {errors.firmName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.firmName.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="email">Firm email</Label>
            <Input
              id="email"
              type="email"
              placeholder="info@acmesolicitors.co.uk"
              {...register('email')}
              className="mt-1"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone number</Label>
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
          <h3 className="text-lg font-medium text-gray-900">Address</h3>
          <p className="mt-1 text-sm text-gray-500">Optional</p>
        </div>

        <div>
          <Label htmlFor="addressLine1">Address line 1</Label>
          <Input
            id="addressLine1"
            type="text"
            placeholder="123 High Street"
            {...register('addressLine1')}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              type="text"
              placeholder="Edinburgh"
              {...register('city')}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="postcode">Postcode</Label>
            <Input
              id="postcode"
              type="text"
              placeholder="EH1 1AA"
              {...register('postcode')}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? 'Setting up...' : 'Complete setup'}
        </Button>
      </div>
    </form>
  )
}
