import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const user = await getCurrentUser()

  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-gray-900">ConveyPro</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Conveyancing Quotes
            <br />
            <span className="text-blue-600">Made Simple</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Multi-tenant SaaS platform for Scottish solicitor firms with
            intelligent cross-selling automation. Manage quotes, properties,
            and clients all in one place.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="text-lg">
                Start free trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg">
                Sign in
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="mx-auto mt-24 grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 text-4xl">📋</div>
              <h3 className="text-xl font-semibold text-gray-900">
                Quote Management
              </h3>
              <p className="mt-2 text-gray-600">
                Create, send, and track conveyancing quotes with auto-generated
                quote numbers
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 text-4xl">🏢</div>
              <h3 className="text-xl font-semibold text-gray-900">
                Multi-Tenant
              </h3>
              <p className="mt-2 text-gray-600">
                Role-based access control for your entire team with secure
                tenant isolation
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 text-4xl">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900">
                Smart Automation
              </h3>
              <p className="mt-2 text-gray-600">
                Intelligent cross-selling opportunities and workflow automation
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-600">
          © 2024 ConveyPro. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
