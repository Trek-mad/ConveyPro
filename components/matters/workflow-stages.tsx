'use client'

import { useState } from 'react'
import { Check, Circle, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const WORKFLOW_STAGES = [
  {
    key: 'client_entry',
    name: 'Client Entry',
    description: 'Create client and matter records',
  },
  {
    key: 'quote_check',
    name: 'Quote Check',
    description: 'Verify quote exists for this matter',
  },
  {
    key: 'client_details',
    name: 'Client Details',
    description: 'Collect complete client information',
  },
  {
    key: 'financial_questionnaire',
    name: 'Financial Questionnaire',
    description: 'Complete financial assessment',
  },
  {
    key: 'financial_checks',
    name: 'Financial Checks',
    description: 'Verify affordability and ADS liability',
  },
  {
    key: 'home_report',
    name: 'Home Report',
    description: 'Review and upload home report',
  },
  {
    key: 'establish_parameters',
    name: 'Establish Parameters',
    description: 'Set closing date, entry date, conditions',
  },
  {
    key: 'offer_creation',
    name: 'Offer Creation',
    description: 'Draft offer letter',
  },
  {
    key: 'offer_approval',
    name: 'Offer Approval',
    description: 'Solicitor and negotiator approval',
  },
  {
    key: 'client_acceptance',
    name: 'Client Acceptance',
    description: 'Client reviews and accepts offer',
  },
  {
    key: 'offer_outcome',
    name: 'Offer Outcome',
    description: 'Track agent response',
  },
  {
    key: 'conveyancing_allocation',
    name: 'Conveyancer Assignment',
    description: 'Allocate to fee earner for conveyancing',
  },
]

interface WorkflowStagesProps {
  currentStage: string
  matterId: string
  onStageTransition?: (newStage: string) => void
}

export function WorkflowStages({
  currentStage,
  matterId,
  onStageTransition,
}: WorkflowStagesProps) {
  const [transitioningTo, setTransitioningTo] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const currentStageIndex = WORKFLOW_STAGES.findIndex(
    (stage) => stage.key === currentStage
  )

  const handleStageClick = (stageKey: string, stageIndex: number) => {
    // Only allow moving to the next stage
    if (stageIndex === currentStageIndex + 1) {
      setTransitioningTo(stageKey)
    }
  }

  const confirmTransition = async () => {
    if (!transitioningTo) return

    setIsTransitioning(true)
    try {
      if (onStageTransition) {
        await onStageTransition(transitioningTo)
      }
      setTransitioningTo(null)
    } catch (error) {
      console.error('Failed to transition stage:', error)
    } finally {
      setIsTransitioning(false)
    }
  }

  const getStageStatus = (stageIndex: number) => {
    if (stageIndex < currentStageIndex) {
      return 'completed'
    } else if (stageIndex === currentStageIndex) {
      return 'current'
    } else if (stageIndex === currentStageIndex + 1) {
      return 'next'
    } else {
      return 'locked'
    }
  }

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-5 w-5 text-white" />
      case 'current':
        return <Circle className="h-5 w-5 text-white fill-current" />
      case 'next':
        return <Circle className="h-5 w-5 text-gray-400" />
      case 'locked':
        return <Lock className="h-5 w-5 text-gray-300" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'current':
        return 'bg-blue-500'
      case 'next':
        return 'border-2 border-blue-300 bg-white'
      case 'locked':
        return 'bg-gray-200'
      default:
        return 'bg-gray-200'
    }
  }

  const nextStage = WORKFLOW_STAGES[currentStageIndex + 1]

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Workflow Progress
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Stage {currentStageIndex + 1} of {WORKFLOW_STAGES.length}
          </p>
        </div>
        {nextStage && (
          <Button
            onClick={() =>
              handleStageClick(nextStage.key, currentStageIndex + 1)
            }
            size="sm"
          >
            Move to {nextStage.name}
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{
              width: `${((currentStageIndex + 1) / WORKFLOW_STAGES.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-4">
        {WORKFLOW_STAGES.map((stage, index) => {
          const status = getStageStatus(index)
          const isClickable = status === 'next'

          return (
            <div
              key={stage.key}
              className={`flex items-start gap-4 ${isClickable ? 'cursor-pointer' : ''}`}
              onClick={() =>
                isClickable ? handleStageClick(stage.key, index) : null
              }
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${getStageColor(status)} ${isClickable ? 'hover:scale-110' : ''} transition-transform`}
                >
                  {getStageIcon(status)}
                </div>
                {index < WORKFLOW_STAGES.length - 1 && (
                  <div
                    className={`mt-2 h-12 w-0.5 ${status === 'completed' ? 'bg-green-500' : 'bg-gray-200'}`}
                  />
                )}
              </div>

              <div className="flex-1 pb-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      className={`font-medium ${status === 'current' ? 'text-blue-600' : status === 'completed' ? 'text-gray-900' : 'text-gray-500'}`}
                    >
                      {stage.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {stage.description}
                    </p>
                  </div>
                  {status === 'current' && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      Current
                    </span>
                  )}
                  {status === 'completed' && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Complete
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Transition Confirmation Dialog */}
      <AlertDialog
        open={transitioningTo !== null}
        onOpenChange={() => setTransitioningTo(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Next Stage?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the matter to{' '}
              <strong>
                {
                  WORKFLOW_STAGES.find((s) => s.key === transitioningTo)
                    ?.name
                }
              </strong>
              . Any required tasks for this stage will be automatically
              generated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isTransitioning}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmTransition}
              disabled={isTransitioning}
            >
              {isTransitioning ? 'Moving...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
