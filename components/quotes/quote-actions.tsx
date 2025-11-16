'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Quote } from '@/types'
import { updateQuoteStatus } from '@/services/quote.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mail, Check, X, Clock } from 'lucide-react'

interface QuoteActionsProps {
  quote: Quote
  tenantId: string
}

export function QuoteActions({ quote, tenantId }: QuoteActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStatusChange = async (newStatus: Quote['status']) => {
    setIsLoading(true)
    setError(null)

    const result = await updateQuoteStatus(quote.id, tenantId, newStatus)

    if ('error' in result) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.refresh()
    setIsLoading(false)
  }

  // Only show actions if quote is in 'sent' status or needs status management
  if (quote.status !== 'sent') {
    return null
  }

  return (
    <>
      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Status Management
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => handleStatusChange('accepted')}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="mr-2 h-4 w-4" />
            Mark as Accepted
          </Button>
          <Button
            onClick={() => handleStatusChange('rejected')}
            disabled={isLoading}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <X className="mr-2 h-4 w-4" />
            Mark as Rejected
          </Button>
          <Button
            onClick={() => handleStatusChange('draft')}
            disabled={isLoading}
            variant="outline"
          >
            <Clock className="mr-2 h-4 w-4" />
            Revert to Draft
          </Button>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Update the quote status based on client response. Use "Send to Client" button above to send the email.
        </p>
      </Card>
    </>
  )
}
