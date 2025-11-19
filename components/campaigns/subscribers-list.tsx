'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Mail, Calendar, XCircle, CheckCircle, Pause, Loader2 } from 'lucide-react'

interface Subscriber {
  id: string
  client_id: string
  status: string
  enrolled_at: string
  unsubscribed_at: string | null
  client?: {
    full_name: string
    email: string
  }
  _count?: {
    emails_sent: number
    emails_opened: number
  }
}

interface SubscribersListProps {
  subscribers: Subscriber[]
  canEdit: boolean
}

export function SubscribersList({ subscribers, canEdit }: SubscribersListProps) {
  const router = useRouter()
  const [unsubscribing, setUnsubscribing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUnenroll = async (subscriberId: string) => {
    if (!confirm('Are you sure you want to unenroll this client? Pending emails will be cancelled.')) {
      return
    }

    setUnsubscribing(subscriberId)
    setError(null)

    try {
      const response = await fetch(`/api/campaigns/subscribers/${subscriberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to unenroll client')
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to unenroll client')
    } finally {
      setUnsubscribing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            <CheckCircle className="h-3 w-3" />
            Active
          </span>
        )
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            <Pause className="h-3 w-3" />
            Paused
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        )
      case 'unsubscribed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
            <XCircle className="h-3 w-3" />
            Unsubscribed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
            {status}
          </span>
        )
    }
  }

  return (
    <div>
      {error && (
        <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {subscribers.map((subscriber) => (
          <div key={subscriber.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {subscriber.client?.full_name || 'Unknown Client'}
                  </h3>
                  {getStatusBadge(subscriber.status)}
                </div>

                <p className="mt-1 text-sm text-gray-600">
                  {subscriber.client?.email}
                </p>

                <div className="mt-2 flex items-center gap-6 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Enrolled {format(new Date(subscriber.enrolled_at), 'MMM d, yyyy')}
                    </span>
                  </div>

                  {subscriber._count && (
                    <>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{subscriber._count.emails_sent} sent</span>
                      </div>
                      {subscriber._count.emails_opened > 0 && (
                        <div className="flex items-center gap-1">
                          <span>{subscriber._count.emails_opened} opened</span>
                        </div>
                      )}
                    </>
                  )}

                  {subscriber.unsubscribed_at && (
                    <span className="text-gray-400">
                      Unsubscribed {format(new Date(subscriber.unsubscribed_at), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>

              {canEdit && subscriber.status === 'active' && (
                <button
                  onClick={() => handleUnenroll(subscriber.id)}
                  disabled={unsubscribing === subscriber.id}
                  className="ml-4 inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {unsubscribing === subscriber.id ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      Unenrolling...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1 h-4 w-4" />
                      Unenroll
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
