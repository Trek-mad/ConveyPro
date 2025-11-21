'use client'

import { useState, useEffect } from 'react'
import {
  getAssignmentRecommendations,
  assignMatterToFeeEarner,
  autoAssignMatter,
} from '@/services/fee-earner-allocation.service'
import type { AssignmentRecommendation } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import {
  Loader2,
  UserCheck,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Award,
  Briefcase,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  matterId: string
  matterType: string
  transactionValue: number
  tenantId: string
  onAssignmentComplete?: () => void
}

export function AssignmentDialog({
  open,
  onOpenChange,
  matterId,
  matterType,
  transactionValue,
  tenantId,
  onAssignmentComplete,
}: AssignmentDialogProps) {
  const [recommendations, setRecommendations] = useState<AssignmentRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedFeeEarnerId, setSelectedFeeEarnerId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (open) {
      loadRecommendations()
    }
  }, [open, matterId])

  async function loadRecommendations() {
    setIsLoading(true)
    const result = await getAssignmentRecommendations(matterId)

    if ('recommendations' in result) {
      setRecommendations(result.recommendations)
      // Auto-select the top recommendation if available
      if (result.recommendations.length > 0) {
        setSelectedFeeEarnerId(result.recommendations[0].fee_earner_id)
      }
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    }
    setIsLoading(false)
  }

  async function handleAutoAssign() {
    setIsAssigning(true)

    const result = await autoAssignMatter(matterId, matterType, transactionValue)

    if ('assignment' in result) {
      toast({
        title: 'Success',
        description: `Matter automatically assigned to ${result.assignment.fee_earner?.first_name} ${result.assignment.fee_earner?.last_name}`,
      })
      onOpenChange(false)
      router.refresh()
      onAssignmentComplete?.()
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    }

    setIsAssigning(false)
  }

  async function handleManualAssign() {
    if (!selectedFeeEarnerId) {
      toast({
        title: 'Error',
        description: 'Please select a fee earner',
        variant: 'destructive',
      })
      return
    }

    setIsAssigning(true)

    const result = await assignMatterToFeeEarner(matterId, selectedFeeEarnerId)

    if ('assignment' in result) {
      const selectedRec = recommendations.find(
        (r) => r.fee_earner_id === selectedFeeEarnerId
      )
      const feeEarnerName = selectedRec
        ? `${selectedRec.fee_earner?.first_name} ${selectedRec.fee_earner?.last_name}`
        : 'the selected fee earner'

      toast({
        title: 'Success',
        description: `Matter assigned to ${feeEarnerName}`,
      })
      onOpenChange(false)
      router.refresh()
      onAssignmentComplete?.()
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    }

    setIsAssigning(false)
  }

  function getCapacityBadge(percentage: number) {
    if (percentage >= 100) {
      return <Badge variant="destructive">At Capacity</Badge>
    } else if (percentage >= 80) {
      return <Badge className="bg-orange-100 text-orange-800">High Load</Badge>
    } else if (percentage >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">Available</Badge>
    }
  }

  function getScoreBadge(score: number) {
    if (score >= 90) {
      return <Badge className="bg-green-100 text-green-800">Excellent Match</Badge>
    } else if (score >= 70) {
      return <Badge className="bg-blue-100 text-blue-800">Good Match</Badge>
    } else if (score >= 50) {
      return <Badge className="bg-yellow-100 text-yellow-800">Fair Match</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Poor Match</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign Fee Earner
          </DialogTitle>
          <DialogDescription>
            Select a fee earner to assign this matter, or use auto-assignment for the best
            match.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Auto-Assign Option */}
            {recommendations.length > 0 && (
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Auto-Assignment</h3>
                </div>
                <p className="mb-3 text-sm text-blue-800">
                  Let the system automatically assign this matter to the best available fee
                  earner based on workload, capacity, and preferences.
                </p>
                <Button
                  onClick={handleAutoAssign}
                  disabled={isAssigning}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Sparkles className="mr-2 h-4 w-4" />
                  Auto-Assign to Best Match
                </Button>
              </div>
            )}

            {/* Manual Selection */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Or Select Manually
              </h3>

              {recommendations.length === 0 ? (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">No Recommendations Available</p>
                      <p className="text-xs">
                        No fee earners are currently available or match the criteria for this
                        matter. You can still manually assign if needed, but capacity limits
                        may be exceeded.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec, index) => {
                    const isSelected = selectedFeeEarnerId === rec.fee_earner_id
                    const feeEarner = rec.fee_earner

                    return (
                      <button
                        key={rec.fee_earner_id}
                        type="button"
                        onClick={() => setSelectedFeeEarnerId(rec.fee_earner_id)}
                        className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {/* Header */}
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {index === 0 && (
                                <Award className="h-4 w-4 text-yellow-500" />
                              )}
                              <h4 className="font-semibold text-gray-900">
                                {feeEarner?.first_name} {feeEarner?.last_name}
                              </h4>
                              {isSelected && (
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600">{feeEarner?.email}</p>
                          </div>
                          <div className="text-right">
                            {getScoreBadge(rec.match_score)}
                            <p className="mt-1 text-xs text-gray-600">
                              Score: {rec.match_score}/100
                            </p>
                          </div>
                        </div>

                        {/* Workload Info */}
                        <div className="mb-3 space-y-2">
                          <div>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3 text-gray-500" />
                                <span className="text-gray-600">Overall Capacity</span>
                              </div>
                              <span className="font-medium text-gray-900">
                                {rec.workload.capacity_percentage.toFixed(0)}%
                              </span>
                            </div>
                            <Progress
                              value={rec.workload.capacity_percentage}
                              className="h-2"
                            />
                            <div className="mt-1 text-xs text-gray-600">
                              {rec.workload.active_matters_count} of{' '}
                              {rec.workload.max_concurrent_matters} matters
                            </div>
                          </div>

                          <div>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-500" />
                                <span className="text-gray-600">Weekly Intake</span>
                              </div>
                              <span className="font-medium text-gray-900">
                                {rec.workload.weekly_capacity_percentage.toFixed(0)}%
                              </span>
                            </div>
                            <Progress
                              value={rec.workload.weekly_capacity_percentage}
                              className="h-2"
                            />
                            <div className="mt-1 text-xs text-gray-600">
                              {rec.workload.new_matters_this_week} of{' '}
                              {rec.workload.max_new_matters_per_week} new this week
                            </div>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          {getCapacityBadge(rec.workload.capacity_percentage)}
                          {rec.workload.is_available ? (
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
                          {index === 0 && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Award className="mr-1 h-3 w-3" />
                              Top Match
                            </Badge>
                          )}
                        </div>

                        {/* Recommendation Reason */}
                        {rec.recommendation_reason && (
                          <div className="mt-3 rounded bg-gray-50 p-2">
                            <p className="text-xs text-gray-700">
                              {rec.recommendation_reason}
                            </p>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Warnings */}
            {selectedFeeEarnerId && recommendations.length > 0 && (
              <div>
                {(() => {
                  const selectedRec = recommendations.find(
                    (r) => r.fee_earner_id === selectedFeeEarnerId
                  )
                  if (!selectedRec) return null

                  const warnings = []

                  if (selectedRec.workload.capacity_percentage >= 100) {
                    warnings.push({
                      icon: AlertCircle,
                      color: 'red',
                      message: 'This fee earner is at maximum capacity',
                    })
                  } else if (selectedRec.workload.capacity_percentage >= 80) {
                    warnings.push({
                      icon: TrendingUp,
                      color: 'orange',
                      message: 'This fee earner has high workload',
                    })
                  }

                  if (selectedRec.workload.weekly_capacity_percentage >= 100) {
                    warnings.push({
                      icon: Calendar,
                      color: 'yellow',
                      message: 'Weekly intake limit reached',
                    })
                  }

                  if (!selectedRec.workload.is_available) {
                    warnings.push({
                      icon: Clock,
                      color: 'red',
                      message: `Currently unavailable: ${selectedRec.workload.unavailable_reason}`,
                    })
                  }

                  if (warnings.length === 0) return null

                  return (
                    <div className="space-y-2">
                      {warnings.map((warning, index) => {
                        const Icon = warning.icon
                        const colors = {
                          red: 'bg-red-50 text-red-800 border-red-200',
                          orange: 'bg-orange-50 text-orange-800 border-orange-200',
                          yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                        }

                        return (
                          <div
                            key={index}
                            className={`flex items-start gap-2 rounded-lg border p-3 ${
                              colors[warning.color as keyof typeof colors]
                            }`}
                          >
                            <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <p className="text-sm">{warning.message}</p>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAssigning}
          >
            Cancel
          </Button>
          <Button
            onClick={handleManualAssign}
            disabled={isAssigning || !selectedFeeEarnerId || isLoading}
          >
            {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign to Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
