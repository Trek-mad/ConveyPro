import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser, getActiveTenantMembership } from '@/lib/auth'
import { getTenant } from '@/services/tenant.service'
import { Card } from '@/components/ui/card'
import { FirmSettingsForm } from '@/components/settings/firm-settings-form'

export const metadata: Metadata = {
  title: 'Firm Settings | ConveyPro',
  description: 'Manage your firm settings and preferences',
}

export default async function FirmSettingsPage() {
  const user = await getCurrentUser()
  const membership = await getActiveTenantMembership()

  if (!user || !membership) {
    redirect('/login')
  }

  // Only owners and admins can access firm settings
  if (!['owner', 'admin'].includes(membership.role)) {
    redirect('/settings/profile')
  }

  // Fetch tenant details
  const tenantResult = await getTenant(membership.tenant_id)
  const tenant = 'tenant' in tenantResult ? tenantResult.tenant : null

  if (!tenant) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      {/* Firm Information */}
      <Card className="p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Firm Information
        </h2>
        <FirmSettingsForm tenant={tenant} userRole={membership.role} />
      </Card>

      {/* Subscription Information */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Subscription
        </h2>
        <div className="space-y-3 text-sm">
          <div>
            <dt className="font-medium text-gray-600">Current Plan</dt>
            <dd className="mt-1">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                {tenant.subscription_tier?.toUpperCase() || 'TRIAL'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-600">Status</dt>
            <dd className="mt-1">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  tenant.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : tenant.status === 'suspended'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {tenant.status?.toUpperCase()}
              </span>
            </dd>
          </div>
          {tenant.subscription_tier === 'trial' && (
            <div className="mt-4 rounded-md bg-yellow-50 p-3">
              <p className="text-sm text-yellow-800">
                You're currently on a trial plan. Upgrade to unlock all features
                and remove limitations.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Danger Zone (Owner Only) */}
      {membership.role === 'owner' && (
        <Card className="border-red-200 p-6">
          <h2 className="mb-4 text-lg font-semibold text-red-900">
            Danger Zone
          </h2>
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Delete Firm
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Permanently delete this firm and all associated data. This action
                cannot be undone.
              </p>
              <button
                disabled
                className="mt-2 cursor-not-allowed rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white opacity-50"
              >
                Delete Firm (Contact Support)
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
