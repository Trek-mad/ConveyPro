'use client'

import { MatterActivity } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Card } from '@/components/ui/card'
import {
  FileText,
  User,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Clock,
  Mail,
} from 'lucide-react'

interface ActivityTimelineProps {
  activities: MatterActivity[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'stage_changed':
        return <ArrowRight className="h-5 w-5 text-blue-600" />
      case 'task_completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'task_created':
        return <Clock className="h-5 w-5 text-gray-600" />
      case 'document_uploaded':
        return <FileText className="h-5 w-5 text-purple-600" />
      case 'fee_earner_assigned':
        return <User className="h-5 w-5 text-indigo-600" />
      case 'offer_created':
      case 'offer_approved':
      case 'offer_submitted':
        return <Mail className="h-5 w-5 text-orange-600" />
      case 'priority_changed':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'stage_changed':
        return 'bg-blue-100'
      case 'task_completed':
        return 'bg-green-100'
      case 'document_uploaded':
        return 'bg-purple-100'
      case 'fee_earner_assigned':
        return 'bg-indigo-100'
      case 'offer_created':
      case 'offer_approved':
      case 'offer_submitted':
        return 'bg-orange-100'
      case 'priority_changed':
        return 'bg-yellow-100'
      default:
        return 'bg-gray-100'
    }
  }

  if (activities.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Activity Timeline
        </h3>
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h4 className="mt-4 text-sm font-medium text-gray-900">
            No activity yet
          </h4>
          <p className="mt-2 text-sm text-gray-500">
            Activity will be recorded as the matter progresses
          </p>
        </div>
      </Card>
    )
  }

  // Sort activities by most recent first
  const sortedActivities = [...activities].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <Card className="p-6">
      <h3 className="mb-6 text-lg font-semibold text-gray-900">
        Activity Timeline
      </h3>

      <div className="relative space-y-4">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200" />

        {sortedActivities.map((activity, index) => (
          <div key={activity.id} className="relative flex gap-4">
            {/* Icon */}
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${getActivityColor(activity.activity_type)}`}
            >
              {getActivityIcon(activity.activity_type)}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {activity.title}
                  </h4>
                  {activity.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {activity.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <time>
                  {formatDistanceToNow(new Date(activity.created_at), {
                    addSuffix: true,
                  })}
                </time>

                {activity.actor_name && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {activity.actor_name}
                  </span>
                )}
              </div>

              {/* Changes metadata */}
              {activity.changes && Object.keys(activity.changes).length > 0 && (
                <div className="mt-3 rounded-md bg-gray-50 p-3">
                  <div className="space-y-1 text-xs">
                    {Object.entries(activity.changes as Record<string, any>).map(
                      ([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="font-medium text-gray-700">
                            {key}:
                          </span>
                          <span className="text-gray-600">
                            {typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
