import { Metadata } from 'next'
import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Sign Up | ConveyPro',
  description: 'Create your ConveyPro account',
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            ConveyPro
          </h1>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start managing your conveyancing quotes today
          </p>
        </div>

        <SignupForm />

        <div className="text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
