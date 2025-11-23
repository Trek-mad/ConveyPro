'use client'

import { useState, useEffect } from 'react'
import { calculateFeeEarnerWorkload } from '@/services/fee-earner-allocation.service'
import type { FeeEarnerWorkload } from '@/types'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Briefcase,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface WorkloadDashboardProps {
  feeEarnerId: string
  feeEarnerName: string
  refreshTrigger?: number
}

export function WorkloadDashboard({
  feeEarnerId,
  feeEarnerName,
  refreshTrigger = 0,
}: WorkloadDashboardProps) {
  const [workload, setWorkload] = useState<FeeEarnerWorkload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadWorkload()
  }, [feeEarnerId, refreshTrigger])

  async function loadWorkload() {
    setIsLoading(true)
    const result = await calculateFeeEarnerWorkload(feeEarnerId)

    if ('workload' in result) {
      setWorkload(result.workload)
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </Card>
    )
  }

  if (!workload) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12 text-gray-500">
          <AlertCircle className="mr-2 h-5 w-5" />
          <span>Unable to load workload data</span>
        </div>
      </Card>
    )
  }

  function getCapacityStatus(percentage: number) {
    if (percentage >= 100) {
      return {
        label: 'At Capacity',
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        icon: AlertCircle,
      }
    } else if (percentage >= 80) {
      return {
        label: 'High Load',
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        icon: TrendingUp,
      }
    } else if (percentage >= 60) {
      return {
        label: 'Moderate Load',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        icon: BarChart3,
      }
    } else {
      return {
        label: 'Available',
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        icon: CheckCircle,
      }
    }
  }

  const capacityStatus = getCapacityStatus(workload.capacity_percentage)
  const weeklyStatus = getCapacityStatus(workload.weekly_capacity_percentage)
  const CapacityIcon = capacityStatus.icon
  const WeeklyIcon = weeklyStatus.icon

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Workload Dashboard</h3>
        <p className="text-sm text-gray-500">Real-time capacity and workload metrics</p>
      </div>

      {/* Availability Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Current Status</span>
          {workload.is_available ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="mr-1 h-3 w-3" />
              Available
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">
              <AlertCircle className="mr-1 h-3 w-3" />
              Unavailable
            </Badge>
          )}
        </div>
        {workload.unavailable_reason && (
          <p className="mt-1 text-sm text-gray-600">{workload.unavailable_reason}</p>
        )}
      </div>

      {/* Overall Capacity */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Overall Capacity</span>
          </div>
          <div className="flex items-center gap-2">
            <CapacityIcon className={`h-4 w-4 ${capacityStatus.textColor}`} />
            <span className={`text-sm font-semibold ${capacityStatus.textColor}`}>
              {workload.capacity_percentage.toFixed(0)}%
            </span>
          </div>
        </div>
        <Progress value={workload.capacity_percentage} className="h-3" />
        <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
          <span>
            {workload.active_matters_count} of {workload.max_concurrent_matters} matters
          </span>
          <span className={`font-medium ${capacityStatus.textColor}`}>
            {capacityStatus.label}
          </span>
        </div>
      </div>

      {/* Weekly Intake */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">This Week's Intake</span>
          </div>
          <div className="flex items-center gap-2">
            <WeeklyIcon className={`h-4 w-4 ${weeklyStatus.textColor}`} />
            <span className={`text-sm font-semibold ${weeklyStatus.textColor}`}>
              {workload.weekly_capacity_percentage.toFixed(0)}%
            </span>
          </div>
        </div>
        <Progress value={workload.weekly_capacity_percentage} className="h-3" />
        <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
          <span>
            {workload.new_matters_this_week} of {workload.max_new_matters_per_week} new matters
          </span>
          <span className={`font-medium ${weeklyStatus.textColor}`}>
            {workload.max_new_matters_per_week - workload.new_matters_this_week} remaining
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Active Matters */}
        <div className={`rounded-lg border p-4 ${capacityStatus.bgColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Active Matters</p>
              <p className={`text-2xl font-bold ${capacityStatus.textColor}`}>
                {workload.active_matters_count}
              </p>
            </div>
            <div className={`rounded-full p-3 ${capacityStatus.color} bg-opacity-20`}>
              <Briefcase className={`h-6 w-6 ${capacityStatus.textColor}`} />
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-gray-600">
            <Clock className="mr-1 h-3 w-3" />
            <span>of {workload.max_concurrent_matters} max</span>
          </div>
        </div>

        {/* New This Week */}
        <div className={`rounded-lg border p-4 ${weeklyStatus.bgColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">New This Week</p>
              <p className={`text-2xl font-bold ${weeklyStatus.textColor}`}>
                {workload.new_matters_this_week}
              </p>
            </div>
            <div className={`rounded-full p-3 ${weeklyStatus.color} bg-opacity-20`}>
              <Calendar className={`h-6 w-6 ${weeklyStatus.textColor}`} />
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-gray-600">
            <Clock className="mr-1 h-3 w-3" />
            <span>of {workload.max_new_matters_per_week} weekly limit</span>
          </div>
        </div>
      </div>

      {/* Capacity Insights */}
      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Capacity Insights</h4>

        {workload.capacity_percentage >= 100 ? (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
            <div className="text-sm text-red-800">
              <p className="font-medium">At Maximum Capacity</p>
              <p className="text-xs">
                Cannot accept new matters until existing matters are completed or closed.
              </p>
            </div>
          </div>
        ) : workload.capacity_percentage >= 80 ? (
          <div className="flex items-start gap-2 rounded-lg bg-orange-50 p-3">
            <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
            <div className="text-sm text-orange-800">
              <p className="font-medium">High Capacity Usage</p>
              <p className="text-xs">
                Consider prioritizing existing matters before accepting new assignments.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <div className="text-sm text-green-800">
              <p className="font-medium">Good Capacity Available</p>
              <p className="text-xs">
                Can accept{' '}
                {Math.min(
                  workload.max_concurrent_matters - workload.active_matters_count,
                  workload.max_new_matters_per_week - workload.new_matters_this_week
                )}{' '}
                more matter(s) this week.
              </p>
            </div>
          </div>
        )}

        {workload.weekly_capacity_percentage >= 100 && (
          <div className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Weekly Intake Limit Reached</p>
              <p className="text-xs">
                Maximum new matters for this week reached. Resets on Monday.
              </p>
            </div>
          </div>
        )}

        {!workload.is_available && (
          <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3">
            <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-600" />
            <div className="text-sm text-gray-800">
              <p className="font-medium">Currently Unavailable</p>
              <p className="text-xs">{workload.unavailable_reason}</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {workload.max_concurrent_matters - workload.active_matters_count}
          </p>
          <p className="text-xs text-gray-600">Slots Available</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {workload.max_new_matters_per_week - workload.new_matters_this_week}
          </p>
          <p className="text-xs text-gray-600">Weekly Remaining</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {workload.capacity_percentage.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-600">Total Capacity</p>
        </div>
      </div>
    </Card>
  )
}
