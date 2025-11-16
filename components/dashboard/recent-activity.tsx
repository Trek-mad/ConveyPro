import { getActiveTenantMembership } from '@/lib/auth'
import { getQuotes, getProperties } from '@/services/quote.service'
import { formatDistanceToNow } from 'date-fns'
import {
  FileText,
  Building2,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react'

type ActivityItem = {
  id: string
  type: 'quote' | 'property'
  action: string
  title: string
  subtitle?: string
  timestamp: Date
  icon: React.ReactNode
  iconBg: string
}

export async function RecentActivity() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  // Fetch recent quotes and properties
  const quotesResult = await getQuotes(membership.tenant_id)
  const quotes = 'quotes' in quotesResult ? quotesResult.quotes : []

  const propertiesResult = await getProperties(membership.tenant_id)
  const properties =
    'properties' in propertiesResult ? propertiesResult.properties : []

  // Build activity feed
  const activities: ActivityItem[] = []

  // Add quote activities
  quotes.slice(0, 10).forEach((quote) => {
    const statusConfig = {
      draft: {
        action: 'created',
        icon: <FileText className="h-4 w-4 text-gray-600" />,
        iconBg: 'bg-gray-100',
      },
      pending: {
        action: 'pending review',
        icon: <Clock className="h-4 w-4 text-amber-600" />,
        iconBg: 'bg-amber-100',
      },
      sent: {
        action: 'sent',
        icon: <Send className="h-4 w-4 text-blue-600" />,
        iconBg: 'bg-blue-100',
      },
      accepted: {
        action: 'accepted',
        icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
        iconBg: 'bg-green-100',
      },
      rejected: {
        action: 'rejected',
        icon: <XCircle className="h-4 w-4 text-red-600" />,
        iconBg: 'bg-red-100',
      },
      expired: {
        action: 'expired',
        icon: <Clock className="h-4 w-4 text-gray-500" />,
        iconBg: 'bg-gray-100',
      },
      cancelled: {
        action: 'cancelled',
        icon: <XCircle className="h-4 w-4 text-rose-600" />,
        iconBg: 'bg-rose-100',
      },
    }

    const config = statusConfig[quote.status] || statusConfig.draft

    activities.push({
      id: `quote-${quote.id}`,
      type: 'quote',
      action: `Quote ${config.action}`,
      title: quote.quote_number,
      subtitle: quote.client_name,
      timestamp:
        quote.status === 'sent' && quote.sent_at
          ? new Date(quote.sent_at)
          : quote.status === 'accepted' && quote.accepted_at
            ? new Date(quote.accepted_at)
            : new Date(quote.created_at),
      icon: config.icon,
      iconBg: config.iconBg,
    })
  })

  // Add property activities
  properties.slice(0, 5).forEach((property) => {
    activities.push({
      id: `property-${property.id}`,
      type: 'property',
      action: 'Property added',
      title: property.address_line1,
      subtitle: `${property.city}, ${property.postcode}`,
      timestamp: new Date(property.created_at),
      icon: <Building2 className="h-4 w-4 text-purple-600" />,
      iconBg: 'bg-purple-100',
    })
  })

  // Sort by most recent
  const sortedActivities = activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10)

  if (sortedActivities.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-gray-600">No recent activity</p>
        <p className="mt-2 text-sm text-gray-500">
          Activity will appear here as you work
        </p>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {sortedActivities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== sortedActivities.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${activity.iconBg}`}
                  >
                    {activity.icon}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      {activity.action}{' '}
                      <span className="font-medium text-gray-900">
                        {activity.title}
                      </span>
                    </p>
                    {activity.subtitle && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {activity.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {formatDistanceToNow(activity.timestamp, {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
