'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getUpcomingTasks, getUpcomingClosingDates } from '@/services/reminder.service'
import type { Task, Matter } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Loader2, CheckCircle, Clock, Home, ArrowRight } from 'lucide-react'

interface UpcomingTask extends Task {
  matter: Matter
  days_until_due: number
}

interface UpcomingClosingDate {
  matter: Matter
  days_until_closing: number
}

interface UpcomingDeadlinesWidgetProps {
  tenantId: string
  daysAhead?: number
  maxDisplay?: number
}

export function UpcomingDeadlinesWidget({
  tenantId,
  daysAhead = 7,
  maxDisplay = 5,
}: UpcomingDeadlinesWidgetProps) {
  const [tasks, setTasks] = useState<UpcomingTask[]>([])
  const [closingDates, setClosingDates] = useState<UpcomingClosingDate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDeadlines()
  }, [tenantId, daysAhead])

  async function loadDeadlines() {
    setIsLoading(true)

    const [tasksResult, closingDatesResult] = await Promise.all([
      getUpcomingTasks(tenantId, daysAhead),
      getUpcomingClosingDates(tenantId, daysAhead),
    ])

    if ('tasks' in tasksResult && tasksResult.tasks) {
      setTasks(tasksResult.tasks)
    }

    if ('closingDates' in closingDatesResult && closingDatesResult.closingDates) {
      setClosingDates(closingDatesResult.closingDates)
    }

    setIsLoading(false)
  }

  function getUrgencyColor(days: number) {
    if (days <= 1) return 'text-red-600 bg-red-50'
    if (days <= 3) return 'text-orange-600 bg-orange-50'
    return 'text-blue-600 bg-blue-50'
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
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-blue-100 p-2">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Upcoming Deadlines</h3>
            <p className="text-sm text-gray-500">Next {daysAhead} days</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">
            Tasks ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="closing">
            Closing Dates ({closingDates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          {tasks.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-3 text-sm font-semibold text-gray-900">
                No Upcoming Tasks
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No tasks due in the next {daysAhead} days
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, maxDisplay).map((task) => (
                <Link
                  key={task.id}
                  href={`/matters/${task.matter_id}`}
                  className="block"
                >
                  <div className="rounded-lg border bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md">
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
                          <span
                            className={`rounded-full px-2 py-1 font-medium ${getUrgencyColor(task.days_until_due)}`}
                          >
                            {task.days_until_due === 0
                              ? 'Due today'
                              : task.days_until_due === 1
                              ? 'Due tomorrow'
                              : `Due in ${task.days_until_due} days`}
                          </span>
                          <span>•</span>
                          <span>{task.matter.matter_number}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {tasks.length > maxDisplay && (
                <div className="pt-2 text-center">
                  <Link href="/tasks?filter=upcoming">
                    <Button variant="outline" size="sm">
                      View {tasks.length - maxDisplay} More Task
                      {tasks.length - maxDisplay !== 1 ? 's' : ''}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="closing" className="mt-4">
          {closingDates.length === 0 ? (
            <div className="py-8 text-center">
              <Home className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-3 text-sm font-semibold text-gray-900">
                No Upcoming Closing Dates
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No closing dates in the next {daysAhead} days
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {closingDates.slice(0, maxDisplay).map((item) => {
                const matter = item.matter

                return (
                  <Link
                    key={matter.id}
                    href={`/matters/${matter.id}`}
                    className="block"
                  >
                    <div className="rounded-lg border bg-white p-4 transition-all hover:border-orange-300 hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            <h4 className="font-semibold text-gray-900">
                              {matter.matter_number}
                            </h4>
                            {matter.priority && (
                              <Badge className={getPriorityColor(matter.priority)}>
                                {matter.priority}
                              </Badge>
                            )}
                          </div>
                          <div className="mb-2 text-sm text-gray-600">
                            <span className="font-medium">Stage:</span>{' '}
                            {matter.current_stage?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </div>
                          {matter.purchase_price && (
                            <div className="mb-2 text-sm text-gray-600">
                              £{Number(matter.purchase_price).toLocaleString('en-GB')}
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span
                              className={`rounded-full px-2 py-1 font-medium ${getUrgencyColor(item.days_until_closing)}`}
                            >
                              {item.days_until_closing === 0
                                ? 'Closing today'
                                : item.days_until_closing === 1
                                ? 'Closing tomorrow'
                                : `Closing in ${item.days_until_closing} days`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}

              {closingDates.length > maxDisplay && (
                <div className="pt-2 text-center">
                  <Link href="/matters?filter=closing-soon">
                    <Button variant="outline" size="sm">
                      View {closingDates.length - maxDisplay} More
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}
