import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser, getUserMemberships } from '@/lib/auth'
import { OnboardingForm } from '@/components/onboarding/onboarding-form'

export const metadata: Metadata = {
  title: 'Welcome | ConveyPro',
  description: 'Set up your ConveyPro account',
}

export default async function OnboardingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user already has a tenant
  const memberships = await getUserMemberships()

  if (memberships.length > 0) {
    // User already has a tenant, redirect to dashboard
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome to ConveyPro!
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Let's set up your firm to get started
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-sm">
          <OnboardingForm userId={user.id} />
        </div>
      </div>
    </div>
  )
}
