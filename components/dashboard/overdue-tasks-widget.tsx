'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getOverdueTasks } from '@/services/reminder.service'
import type { Task, Matter } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2, CheckCircle, ArrowRight } from 'lucide-react'

interface OverdueTask extends Task {
  matter: Matter
}

interface OverdueTasksWidgetProps {
  tenantId: string
  maxDisplay?: number
}

export function OverdueTasksWidget({
  tenantId,
  maxDisplay = 5,
}: OverdueTasksWidgetProps) {
  const [tasks, setTasks] = useState<OverdueTask[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadOverdueTasks()
  }, [tenantId])

  async function loadOverdueTasks() {
    setIsLoading(true)
    const result = await getOverdueTasks(tenantId)

    if ('tasks' in result && result.tasks) {
      setTasks(result.tasks)
    }
    setIsLoading(false)
  }

  function getDaysOverdue(dueDate: string): number {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = today.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  function getPriorityColor(priority: string) {
    const colors: Record<string, string> = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      normal: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800',
    }
    return colors[priority] || colors.normal
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-red-500" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-red-100 p-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Overdue Tasks</h3>
            <p className="text-sm text-gray-500">{tasks.length} tasks overdue</p>
          </div>
        </div>
        {tasks.length > 0 && (
          <Link href="/tasks?filter=overdue">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="py-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-3 text-sm font-semibold text-gray-900">No Overdue Tasks</h3>
          <p className="mt-1 text-sm text-gray-500">All tasks are up to date!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.slice(0, maxDisplay).map((task) => {
            const daysOverdue = getDaysOverdue(task.due_date!)

            return (
              <Link
                key={task.id}
                href={`/matters/${task.matter_id}`}
                className="block"
              >
                <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 transition-all hover:border-red-300 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{task.title}</h4>
                        {task.priority && (
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="mb-2 text-sm text-gray-600 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="font-medium text-red-600">
                          {daysOverdue === 1
                            ? '1 day overdue'
                            : `${daysOverdue} days overdue`}
                        </span>
                        <span>•</span>
                        <span>{task.matter.matter_number}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}

          {tasks.length > maxDisplay && (
            <div className="pt-2 text-center">
              <Link href="/tasks?filter=overdue">
                <Button variant="outline" size="sm">
                  View {tasks.length - maxDisplay} More Overdue Task
                  {tasks.length - maxDisplay !== 1 ? 's' : ''}
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
