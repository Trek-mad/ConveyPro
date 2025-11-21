'use client'

import {
  FileText,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Download,
  Mail,
  Edit,
  Trash2,
  GitBranch,
  Users,
  Clock
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ActivityLog } from '@/services/activity-log.service'

interface ActivityTimelineProps {
  activities: ActivityLog[]
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const getActivityIcon = (activityType: string) => {
    const iconClass = "h-5 w-5"

    switch (activityType) {
      case 'matter_created':
      case 'task_created':
      case 'offer_created':
        return <FileText className={`${iconClass} text-blue-500`} />
      case 'task_completed':
      case 'offer_accepted':
      case 'document_verified':
        return <CheckCircle className={`${iconClass} text-green-500`} />
      case 'task_cancelled':
      case 'offer_rejected':
      case 'matter_cancelled':
        return <XCircle className={`${iconClass} text-red-500`} />
      case 'document_uploaded':
        return <Upload className={`${iconClass} text-purple-500`} />
      case 'document_downloaded':
        return <Download className={`${iconClass} text-purple-500`} />
      case 'document_deleted':
        return <Trash2 className={`${iconClass} text-red-500`} />
      case 'email_sent':
        return <Mail className={`${iconClass} text-blue-500`} />
      case 'stage_changed':
        return <GitBranch className={`${iconClass} text-orange-500`} />
      case 'fee_earner_assigned':
      case 'task_assigned':
        return <Users className={`${iconClass} text-green-500`} />
      case 'status_changed':
        return <AlertCircle className={`${iconClass} text-orange-500`} />
      case 'matter_updated':
      case 'task_updated':
      case 'offer_updated':
        return <Edit className={`${iconClass} text-gray-500`} />
      default:
        return <Clock className={`${iconClass} text-gray-400`} />
    }
  }

  const getActivityColor = (activityType: string) => {
    if (activityType.includes('created') || activityType.includes('uploaded')) {
      return 'border-blue-200 bg-blue-50'
    }
    if (activityType.includes('completed') || activityType.includes('accepted') || activityType.includes('verified')) {
      return 'border-green-200 bg-green-50'
    }
    if (activityType.includes('cancelled') || activityType.includes('rejected') || activityType.includes('deleted')) {
      return 'border-red-200 bg-red-50'
    }
    if (activityType.includes('assigned') || activityType.includes('changed')) {
      return 'border-orange-200 bg-orange-50'
    }
    return 'border-gray-200 bg-gray-50'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`

    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatActivityType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.created_at).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })

    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
    return groups
  }, {} as Record<string, ActivityLog[]>)

  return (
    <div className="space-y-8">
      {Object.entries(groupedActivities).map(([date, dateActivities]) => (
        <div key={date}>
          {/* Date Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm font-semibold text-gray-600 px-3 py-1 bg-gray-100 rounded-full">
              {date}
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Activities for this date */}
          <div className="space-y-4">
            {dateActivities.map((activity, index) => (
              <div key={activity.id} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full border-2 ${getActivityColor(activity.activity_type)} flex items-center justify-center`}>
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  {index < dateActivities.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200 my-1" style={{ minHeight: '20px' }} />
                  )}
                </div>

                {/* Activity Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {formatActivityType(activity.activity_type)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(activity.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 mb-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User className="h-3 w-3" />
                        <span>{activity.user_name || 'Unknown User'}</span>
                        {activity.user_email && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span>{activity.user_email}</span>
                          </>
                        )}
                      </div>

                      {/* Metadata */}
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            View details
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
