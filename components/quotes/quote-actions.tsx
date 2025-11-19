'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Quote } from '@/types'
import { updateQuoteStatus } from '@/services/quote.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mail, Check, X, Clock } from 'lucide-react'
import { CampaignEnrollmentModal } from '@/components/campaigns/campaign-enrollment-modal'

interface QuoteActionsProps {
  quote: Quote
  tenantId: string
}

export function QuoteActions({ quote, tenantId }: QuoteActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)

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

  const handleAcceptQuote = () => {
    // Show campaign enrollment modal instead of directly accepting
    setShowEnrollmentModal(true)
  }

  const handleEnrollAndAccept = async (campaignIds: string[]) => {
    setIsLoading(true)
    setError(null)

    try {
      // Enroll in campaigns if any selected
      if (campaignIds.length > 0) {
        const enrollResponse = await fetch('/api/campaigns/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: quote.client_id,
            campaignIds,
          }),
        })

        if (!enrollResponse.ok) {
          throw new Error('Failed to enroll client in campaigns')
        }
      }

      // Accept the quote
      const result = await updateQuoteStatus(quote.id, tenantId, 'accepted')

      if ('error' in result) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      router.refresh()
      setShowEnrollmentModal(false)
      setIsLoading(false)
    } catch (err: any) {
      setError(err.message || 'Failed to process request')
      setIsLoading(false)
      throw err
    }
  }

  // Only show actions if quote is not in a final state
  if (!['draft', 'sent'].includes(quote.status)) {
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
        <div className="flex flex-wrap items-center gap-3">
          {quote.status === 'draft' && (
            <>
              <Button
                onClick={() => handleStatusChange('sent')}
                disabled={isLoading}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send to Client
              </Button>
              <p className="text-sm text-gray-600">
                Send this quote to the client for review
              </p>
            </>
          )}

          {quote.status === 'sent' && (
            <>
              <Button
                onClick={handleAcceptQuote}
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
                Move to Draft
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Campaign Enrollment Modal */}
      <CampaignEnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        clientId={quote.client_id}
        clientName={quote.client?.full_name || 'Client'}
        onEnroll={handleEnrollAndAccept}
      />
    </>
  )
}
