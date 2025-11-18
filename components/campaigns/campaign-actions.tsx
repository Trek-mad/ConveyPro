'use client'

import { useState } from 'react'
import { Play, Pause, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CampaignActionsProps {
  campaignId: string
  status: string
  canEdit: boolean
}

export function CampaignActions({
  campaignId,
  status,
  canEdit,
}: CampaignActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePause = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/pause`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to pause campaign')
      }

      router.refresh()
    } catch (error) {
      console.error('Error pausing campaign:', error)
      alert('Failed to pause campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleActivate = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/activate`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to activate campaign')
      }

      router.refresh()
    } catch (error) {
      console.error('Error activating campaign:', error)
      alert('Failed to activate campaign')
    } finally {
      setLoading(false)
    }
  }

  if (!canEdit) {
    return null
  }

  return (
    <>
      {status === 'active' && (
        <button
          onClick={handlePause}
          disabled={loading}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Pause className="mr-2 h-4 w-4" />
          )}
          Pause Campaign
        </button>
      )}

      {status === 'paused' && (
        <button
          onClick={handleActivate}
          disabled={loading}
          className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Activate Campaign
        </button>
      )}
    </>
  )
}
