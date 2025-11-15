import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getActiveTenantMembership } from '@/lib/auth'
import { usePathname } from 'next/navigation'
import { SettingsNav } from '@/components/settings/settings-nav'

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const membership = await getActiveTenantMembership()

  if (!user || !membership) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account and firm preferences
        </p>
      </div>

      {/* Navigation and Content */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3">
          <SettingsNav role={membership.role} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9">{children}</div>
      </div>
    </div>
  )
}
