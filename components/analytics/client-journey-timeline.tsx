import { getClientJourney, ClientJourneyEvent } from '@/services/analytics.service'
import { Mail, FileText, CheckCircle, Send, MousePointer, Users } from 'lucide-react'

interface ClientJourneyTimelineProps {
  clientId: string
  tenantId: string
}

export async function ClientJourneyTimeline({ clientId, tenantId }: ClientJourneyTimelineProps) {
  const events = await getClientJourney(clientId, tenantId)

  const getIcon = (type: ClientJourneyEvent['type']) => {
    switch (type) {
      case 'form_submission':
        return <Users className="h-4 w-4" />
      case 'quote_sent':
        return <FileText className="h-4 w-4" />
      case 'quote_accepted':
        return <CheckCircle className="h-4 w-4" />
      case 'email_sent':
        return <Send className="h-4 w-4" />
      case 'email_opened':
        return <Mail className="h-4 w-4" />
      case 'email_clicked':
        return <MousePointer className="h-4 w-4" />
      case 'campaign_enrolled':
        return <Users className="h-4 w-4" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  const getColor = (type: ClientJourneyEvent['type']) => {
    switch (type) {
      case 'form_submission':
        return 'bg-blue-500'
      case 'quote_sent':
        return 'bg-purple-500'
      case 'quote_accepted':
        return 'bg-green-500'
      case 'email_sent':
        return 'bg-gray-500'
      case 'email_opened':
        return 'bg-blue-400'
      case 'email_clicked':
        return 'bg-orange-500'
      case 'campaign_enrolled':
        return 'bg-indigo-500'
      default:
        return 'bg-gray-400'
    }
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Client Journey</h3>
        <p className="mt-4 text-sm text-gray-600">No activity yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Client Journey</h3>
      <p className="mt-1 text-sm text-gray-600">{events.length} events tracked</p>

      <div className="mt-6 relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={event.id} className="relative flex gap-4">
              {/* Icon */}
              <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${getColor(event.type)} text-white`}>
                {getIcon(event.type)}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <p className="text-sm font-medium text-gray-900">{event.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
