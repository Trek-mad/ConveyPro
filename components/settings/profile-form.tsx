'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/types'
import { updateProfile } from '@/services/profile.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  law_society_number: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  user: User
  profile: Profile | null
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || user.user_metadata?.full_name || '',
      law_society_number:
        profile?.law_society_number || '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const result = await updateProfile({
      full_name: data.full_name,
      law_society_number: data.law_society_number || null,
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
            ✓ Profile updated successfully
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="full_name">
          Full Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="full_name"
          placeholder="John Smith"
          {...register('full_name')}
          className="mt-1"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.full_name.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={user.email}
          disabled
          className="mt-1 bg-gray-50"
        />
        <p className="mt-1 text-xs text-gray-500">
          Email address cannot be changed here. Contact support if you need to
          update your email.
        </p>
      </div>

      <div>
        <Label htmlFor="law_society_number">
          Scottish Law Society Number
        </Label>
        <Input
          id="law_society_number"
          placeholder="123456"
          {...register('law_society_number')}
          className="mt-1"
        />
        <p className="mt-1 text-xs text-gray-500">
          Optional. Your unique Law Society of Scotland membership number.
        </p>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isLoading || !isDirty}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
