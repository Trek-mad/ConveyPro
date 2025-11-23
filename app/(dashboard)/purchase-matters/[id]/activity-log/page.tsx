import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ActivityLogViewer from '@/components/activity-log/activity-log-viewer'
import { getActiveTenantMembership } from '@/services/membership.service'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Activity Log | ConveyPro',
  description: 'View matter activity history and audit trail'
}

async function getMatter(matterId: string, tenantId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('matters')
    .select(`
      id,
      matter_number,
      status,
      properties:property_id (
        address_line1,
        city,
        postcode
      )
    `)
    .eq('id', matterId)
    .eq('tenant_id', tenantId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function ActivityLogPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const membership = await getActiveTenantMembership()

  if (!membership) {
    notFound()
  }

  const matter = await getMatter(id, membership.tenantId)

  if (!matter) {
    notFound()
  }

  const property = matter.properties as any
  const propertyAddress = property
    ? `${property.address_line1 || ''}, ${property.city || ''}, ${property.postcode || ''}`.replace(/^,\s*|,\s*,/g, ',').trim()
    : 'No property linked'

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading activity log...</div>}>
        <ActivityLogViewer
          matterId={id}
          tenantId={membership.tenantId}
          matterNumber={matter.matter_number}
          propertyAddress={propertyAddress}
        />
      </Suspense>
    </div>
  )
}
