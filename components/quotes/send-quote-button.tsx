'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

interface SendQuoteButtonProps {
  quoteId: string
  clientEmail: string | null
  status: string
}

export function SendQuoteButton({
  quoteId,
  clientEmail,
  status,
}: SendQuoteButtonProps) {
  const router = useRouter()
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSendQuote = async () => {
    if (!clientEmail) {
      setError('No client email address on this quote')
      return
    }

    if (!confirm(`Send this quote to ${clientEmail}?`)) {
      return
    }

    setIsSending(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/quotes/${quoteId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send quote')
      }

      setSuccess(true)
      // Refresh the page to show updated status
      router.refresh()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send quote')
    } finally {
      setIsSending(false)
    }
  }

  // Don't show button if already sent or accepted
  if (status === 'sent' || status === 'accepted') {
    return null
  }

  return (
    <div>
      <Button
        onClick={handleSendQuote}
        disabled={isSending || !clientEmail}
        size="sm"
      >
        <Mail className="mr-2 h-4 w-4" />
        {isSending ? 'Sending...' : 'Send to Client'}
      </Button>

      {/* Success Message */}
      {success && (
        <div className="mt-2 rounded-md bg-green-50 p-2">
          <p className="text-sm text-green-800">
            Quote sent successfully to {clientEmail}!
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 rounded-md bg-red-50 p-2">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Warning if no email */}
      {!clientEmail && (
        <p className="mt-2 text-xs text-gray-500">
          Add client email to enable sending
        </p>
      )}
    </div>
  )
}
