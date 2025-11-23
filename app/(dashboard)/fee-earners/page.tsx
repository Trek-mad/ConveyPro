import { Metadata } from 'next'
import Link from 'next/link'
import { getActiveTenantMembership } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { calculateFeeEarnerWorkload } from '@/services/fee-earner-allocation.service'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Users, Settings, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Fee Earners | ConveyPro',
  description: 'Manage fee earners and their workload',
}

export default async function FeeEarnersPage() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  // Only managers+ can access fee earner management
  const canManage = ['owner', 'admin', 'manager'].includes(membership.role)

  if (!canManage) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access fee earner management.
          </p>
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  // Fetch all fee earners for this tenant
  const { data: feeEarners, error } = await supabase
    .from('tenant_memberships')
    .select(
      `
      id,
      user_id,
      role,
      profiles:user_id (
        id,
        first_name,
        last_name,
        full_name,
        job_title
      )
    `
    )
    .eq('tenant_id', membership.tenant_id)
    .eq('role', 'member')
    .order('profiles(first_name)')

  if (error) {
    console.error('Error fetching fee earners:', error)
  }

  // Calculate workload for each fee earner
  const feeEarnersWithWorkload = await Promise.all(
    (feeEarners || []).map(async (feeEarner) => {
      const workloadResult = await calculateFeeEarnerWorkload(feeEarner.user_id)
      return {
        ...feeEarner,
        workload: 'workload' in workloadResult ? workloadResult.workload : null,
      }
    })
  )

  function getCapacityStatus(percentage: number) {
    if (percentage >= 100) {
      return {
        label: 'At Capacity',
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle,
      }
    } else if (percentage >= 80) {
      return {
        label: 'High Load',
        color: 'bg-orange-100 text-orange-800',
        icon: TrendingUp,
      }
    } else if (percentage >= 60) {
      return {
        label: 'Moderate',
        color: 'bg-yellow-100 text-yellow-800',
        icon: TrendingUp,
      }
    } else {
      return {
        label: 'Available',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Earners</h1>
          <p className="mt-2 text-gray-600">
            Manage fee earner workload, capacity, and availability
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Fee Earners</p>
              <p className="text-2xl font-bold text-gray-900">
                {feeEarnersWithWorkload.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  feeEarnersWithWorkload.filter(
                    (fe) => fe.workload?.is_available && fe.workload?.capacity_percentage < 80
                  ).length
                }
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-100 p-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Load</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  feeEarnersWithWorkload.filter(
                    (fe) =>
                      fe.workload?.capacity_percentage >= 80 &&
                      fe.workload?.capacity_percentage < 100
                  ).length
                }
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">At Capacity</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  feeEarnersWithWorkload.filter(
                    (fe) => fe.workload?.capacity_percentage >= 100
                  ).length
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Fee Earners List */}
      <div className="space-y-4">
        {feeEarnersWithWorkload.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No Fee Earners</h3>
              <p className="mt-2 text-sm text-gray-600">
                No fee earners (members) found in this tenant.
              </p>
            </div>
          </Card>
        ) : (
          feeEarnersWithWorkload.map((feeEarner) => {
            const profile = feeEarner.profiles
            const workload = feeEarner.workload
            const capacityStatus = workload
              ? getCapacityStatus(workload.capacity_percentage)
              : null

            return (
              <Card key={feeEarner.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {profile?.full_name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600">{profile?.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {workload?.is_available ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Unavailable
                          </Badge>
                        )}
                        {capacityStatus && (
                          <Badge className={capacityStatus.color}>
                            {capacityStatus.label}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {workload ? (
                      <div className="space-y-4">
                        {/* Overall Capacity */}
                        <div>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-gray-600">Overall Capacity</span>
                            <span className="font-semibold text-gray-900">
                              {workload.capacity_percentage.toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={workload.capacity_percentage} className="h-2" />
                          <div className="mt-1 text-xs text-gray-600">
                            {workload.active_matters_count} of{' '}
                            {workload.max_concurrent_matters} active matters
                          </div>
                        </div>

                        {/* Weekly Intake */}
                        <div>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-gray-600">This Week's Intake</span>
                            <span className="font-semibold text-gray-900">
                              {workload.weekly_capacity_percentage.toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={workload.weekly_capacity_percentage} className="h-2" />
                          <div className="mt-1 text-xs text-gray-600">
                            {workload.new_matters_this_week} of{' '}
                            {workload.max_new_matters_per_week} new matters
                          </div>
                        </div>

                        {!workload.is_available && workload.unavailable_reason && (
                          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                            <span className="font-medium">Unavailable: </span>
                            {workload.unavailable_reason}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                        <AlertCircle className="mr-2 inline h-4 w-4" />
                        No settings configured for this fee earner
                      </div>
                    )}
                  </div>

                  <Link href={`/fee-earners/${feeEarner.user_id}`} className="ml-4">
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
