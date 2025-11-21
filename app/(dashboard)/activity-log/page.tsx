import { Suspense } from 'react'
import { Metadata } from 'next'
import GlobalActivityLogViewer from '@/components/activity-log/global-activity-log-viewer'
import { getActiveTenantMembership } from '@/services/membership.service'

export const metadata: Metadata = {
  title: 'Activity Log | ConveyPro',
  description: 'View all activity history and audit trail across the system'
}

export default async function GlobalActivityLogPage() {
  const membership = await getActiveTenantMembership()

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading activity log...</div>}>
        <GlobalActivityLogViewer
          tenantId={membership.tenant_id}
          userId={membership.user_id}
        />
      </Suspense>
    </div>
  )
}
