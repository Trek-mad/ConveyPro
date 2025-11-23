import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getActiveTenantMembership } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getFeeEarnerSettings } from '@/services/fee-earner-allocation.service'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { FeeEarnerSettingsForm } from '@/components/fee-earners/fee-earner-settings-form'
import { AvailabilityCalendar } from '@/components/fee-earners/availability-calendar'
import { WorkloadDashboard } from '@/components/fee-earners/workload-dashboard'

export const metadata: Metadata = {
  title: 'Fee Earner Management | ConveyPro',
  description: 'Manage fee earner settings and availability',
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function FeeEarnerDetailPage({ params }: PageProps) {
  const membership = await getActiveTenantMembership()
  const { id: feeEarnerId } = await params

  if (!membership) {
    return null
  }

  // Only managers+ can access fee earner management
  const canManage = ['owner', 'admin', 'manager'].includes(membership.role)

  if (!canManage) {
    notFound()
  }

  const supabase = await createClient()

  // Fetch fee earner profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', feeEarnerId)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Verify this user is a member of the tenant
  const { data: feeEarnerMembership, error: membershipError } = await supabase
    .from('tenant_memberships')
    .select('*')
    .eq('user_id', feeEarnerId)
    .eq('tenant_id', membership.tenant_id)
    .eq('role', 'member')
    .single()

  if (membershipError || !feeEarnerMembership) {
    notFound()
  }

  // Fetch current settings
  const settingsResult = await getFeeEarnerSettings(feeEarnerId)
  const currentSettings = 'settings' in settingsResult ? settingsResult.settings : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/fee-earners">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Fee Earners
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
          {profile.job_title && (
            <p className="mt-2 text-gray-600">{profile.job_title}</p>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Settings & Calendar */}
        <div className="space-y-6 lg:col-span-2">
          {/* Settings Form */}
          <FeeEarnerSettingsForm
            feeEarnerId={feeEarnerId}
            tenantId={membership.tenant_id}
            currentSettings={currentSettings}
          />

          {/* Availability Calendar */}
          <AvailabilityCalendar
            feeEarnerId={feeEarnerId}
            tenantId={membership.tenant_id}
          />
        </div>

        {/* Right Column - Workload Dashboard */}
        <div>
          <WorkloadDashboard
            feeEarnerId={feeEarnerId}
            feeEarnerName={profile.full_name || 'Fee Earner'}
          />
        </div>
      </div>
    </div>
  )
}
