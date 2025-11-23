'use client'

import { useState } from 'react'
import { MatterTask } from '@/types'
import { Check, Circle, Clock, AlertCircle, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface TaskChecklistProps {
  tasks: MatterTask[]
  currentStage: string
  onTaskComplete?: (taskId: string) => void
}

export function TaskChecklist({
  tasks,
  currentStage,
  onTaskComplete,
}: TaskChecklistProps) {
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)

  // Filter tasks for current stage
  const currentStageTasks = tasks.filter((task) => task.stage === currentStage)

  // Group tasks by status
  const pendingTasks = currentStageTasks.filter(
    (task) => task.status === 'pending'
  )
  const inProgressTasks = currentStageTasks.filter(
    (task) => task.status === 'in_progress'
  )
  const completedTasks = currentStageTasks.filter(
    (task) => task.status === 'completed'
  )
  const blockedTasks = currentStageTasks.filter(
    (task) => task.status === 'blocked'
  )

  const handleTaskComplete = async (taskId: string) => {
    setCompletingTaskId(taskId)
    try {
      if (onTaskComplete) {
        await onTaskComplete(taskId)
      }
    } catch (error) {
      console.error('Failed to complete task:', error)
    } finally {
      setCompletingTaskId(null)
    }
  }

  const getStatusIcon = (status: MatterTask['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'blocked':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: MatterTask['status']) => {
    const variants: Record<MatterTask['status'], string> = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-600',
    }

    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[status]}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  const getPriorityBadge = (priority: MatterTask['priority']) => {
    const variants: Record<MatterTask['priority'], string> = {
      low: 'bg-gray-100 text-gray-600',
      normal: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600',
    }

    return (
      <Badge className={variants[priority]}>
        {priority}
      </Badge>
    )
  }

  const renderTaskList = (taskList: MatterTask[], title: string) => {
    if (taskList.length === 0) return null

    return (
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium text-gray-700">{title}</h4>
        <div className="space-y-3">
          {taskList.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex-shrink-0 pt-0.5">
                {getStatusIcon(task.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">
                      {task.title}
                    </h5>
                    {task.description && (
                      <p className="mt-1 text-sm text-gray-500">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(task.priority)}
                    {getStatusBadge(task.status)}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  {task.due_date && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                    </div>
                  )}
                  {task.assigned_to && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Assigned
                    </div>
                  )}
                  {task.blocks_stage_progression && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Blocks Progress
                    </Badge>
                  )}
                </div>

                {task.status !== 'completed' && task.status !== 'cancelled' && (
                  <div className="mt-3">
                    <Button
                      size="sm"
                      onClick={() => handleTaskComplete(task.id)}
                      disabled={
                        completingTaskId === task.id ||
                        task.status === 'blocked'
                      }
                    >
                      {completingTaskId === task.id
                        ? 'Completing...'
                        : task.status === 'blocked'
                          ? 'Blocked'
                          : 'Mark Complete'}
                    </Button>
                  </div>
                )}

                {task.completed_at && (
                  <p className="mt-2 text-xs text-gray-500">
                    Completed{' '}
                    {formatDistanceToNow(new Date(task.completed_at), {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const completionRate =
    currentStageTasks.length > 0
      ? Math.round(
          (completedTasks.length / currentStageTasks.length) * 100
        )
      : 0

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Stage Tasks
          </h3>
          <div className="text-sm text-gray-500">
            {completedTasks.length} of {currentStageTasks.length} completed
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {completionRate}% complete
          </p>
        </div>
      </div>

      {currentStageTasks.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <Circle className="mx-auto h-12 w-12 text-gray-400" />
          <h4 className="mt-4 text-sm font-medium text-gray-900">
            No tasks for this stage
          </h4>
          <p className="mt-2 text-sm text-gray-500">
            Tasks will be automatically generated when you enter this stage
          </p>
        </div>
      ) : (
        <>
          {renderTaskList(blockedTasks, 'Blocked Tasks')}
          {renderTaskList(inProgressTasks, 'In Progress')}
          {renderTaskList(pendingTasks, 'Pending Tasks')}
          {renderTaskList(completedTasks, 'Completed Tasks')}
        </>
      )}
    </Card>
  )
}
