import { redirect } from 'next/navigation'
import { getCurrentUser, getActiveTenantMembership } from '@/lib/auth'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { UserMenu } from '@/components/dashboard/user-menu'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const membership = await getActiveTenantMembership()

  if (!membership) {
    // User doesn't have a tenant, redirect to onboarding
    redirect('/onboarding')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardNav tenantId={membership.tenant_id} role={membership.role} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">ConveyPro</h1>
          </div>
          <UserMenu user={user} tenantId={membership.tenant_id} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
