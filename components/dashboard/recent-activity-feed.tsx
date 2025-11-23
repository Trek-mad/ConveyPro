'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, ChevronRight, Loader2, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getRecentActivityFeed, type ActivityLog } from '@/services/activity-log.service'

interface RecentActivityFeedProps {
  tenantId: string
  limit?: number
}

export default function RecentActivityFeed({ tenantId, limit = 10 }: RecentActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [tenantId])

  const loadActivities = async () => {
    setLoading(true)
    try {
      const result = await getRecentActivityFeed(tenantId, limit)

      if (result.success && result.data) {
        setActivities(result.data)
      }
    } catch (error) {
      console.error('Failed to load recent activity feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    })
  }

  const formatActivityType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getActivityColor = (activityType: string) => {
    if (activityType.includes('created') || activityType.includes('uploaded')) {
      return 'text-blue-600 bg-blue-100'
    }
    if (activityType.includes('completed') || activityType.includes('accepted') || activityType.includes('verified')) {
      return 'text-green-600 bg-green-100'
    }
    if (activityType.includes('cancelled') || activityType.includes('rejected') || activityType.includes('deleted')) {
      return 'text-red-600 bg-red-100'
    }
    if (activityType.includes('assigned') || activityType.includes('changed')) {
      return 'text-orange-600 bg-orange-100'
    }
    return 'text-gray-600 bg-gray-100'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest activity across all matters</CardDescription>
          </div>
          <Link href="/activity-log">
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0"
              >
                <div className="flex-shrink-0 mt-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getActivityColor(activity.activity_type)}`}
                    >
                      {formatActivityType(activity.activity_type)}
                    </Badge>
                    {activity.matter_number && (
                      <Link
                        href={`/purchase-matters/${activity.matter_id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {activity.matter_number}
                      </Link>
                    )}
                    <span className="text-xs text-gray-500">
                      by {activity.user_name || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
