/**
 * Portal Offer Acceptance Component
 * Phase 12.7 - Client Portal
 */

'use client'

import { useState } from 'react'
import type { Matter, Offer } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { CheckCircle, Home, Calendar, Pound, AlertCircle, Loader2, PartyPopper } from 'lucide-react'

interface PortalOfferAcceptanceProps {
  token: string
  matter: Matter
  offer: Offer
}

export function PortalOfferAcceptance({ token, matter, offer }: PortalOfferAcceptanceProps) {
  const [isAccepting, setIsAccepting] = useState(false)
  const [isAccepted, setIsAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAcceptOffer = async () => {
    setIsAccepting(true)
    setError(null)

    try {
      const response = await fetch(`/api/portal/${token}/accept-offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offer_id: offer.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept offer')
      }

      setIsAccepted(true)
    } catch (err) {
      console.error('Error accepting offer:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsAccepting(false)
    }
  }

  if (isAccepted) {
    return (
      <Card className="border-2 border-green-300 bg-green-50 p-6">
        <div className="text-center">
          <PartyPopper className="mx-auto mb-4 h-16 w-16 text-green-600" />
          <h2 className="mb-2 text-2xl font-bold text-green-900">Offer Accepted!</h2>
          <p className="mb-4 text-green-800">
            Thank you for accepting the offer. Your solicitor will be in touch shortly to progress with the next steps.
          </p>
          <Badge className="bg-green-200 text-green-900">
            <CheckCircle className="mr-1 h-4 w-4" />
            Accepted
          </Badge>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-orange-300 bg-orange-50 p-6">
      <div className="mb-4 flex items-start gap-3">
        <AlertCircle className="h-6 w-6 text-orange-600" />
        <div className="flex-1">
          <h2 className="mb-1 text-xl font-semibold text-orange-900">
            Offer Ready for Your Acceptance
          </h2>
          <p className="text-orange-800">
            Your solicitor has prepared an offer for the property. Please review the details below and accept the offer to proceed.
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 rounded-lg border-2 border-orange-200 bg-white p-4 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <Home className="mt-1 h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-600">Property</p>
            <p className="font-medium text-gray-900">
              {(matter as any).property?.address_line1}
              {(matter as any).property?.city && <>, {(matter as any).property.city}</>}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Pound className="mt-1 h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-600">Offer Amount</p>
            <p className="text-xl font-bold text-gray-900">
              £{Number(offer.offer_amount).toLocaleString('en-GB')}
            </p>
          </div>
        </div>

        {offer.closing_date && (
          <div className="flex items-start gap-3">
            <Calendar className="mt-1 h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-600">Proposed Closing Date</p>
              <p className="font-medium text-gray-900">
                {new Date(offer.closing_date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}

        {offer.entry_date && (
          <div className="flex items-start gap-3">
            <Calendar className="mt-1 h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-600">Proposed Entry Date</p>
              <p className="font-medium text-gray-900">
                {new Date(offer.entry_date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {offer.conditions && (
        <div className="mb-6 rounded-lg bg-white p-4">
          <p className="mb-2 text-sm font-medium text-gray-600">Conditions</p>
          <p className="whitespace-pre-wrap text-gray-900">{offer.conditions}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="lg"
            className="w-full bg-orange-600 hover:bg-orange-700"
            disabled={isAccepting}
          >
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Accepting Offer...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Accept This Offer
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Offer Acceptance</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to accept this offer for £
              {Number(offer.offer_amount).toLocaleString('en-GB')}? This action will notify your
              solicitor and they will proceed with submitting the offer to the selling agent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAcceptOffer} className="bg-orange-600 hover:bg-orange-700">
              Yes, Accept Offer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="mt-4 text-center text-sm text-gray-600">
        By accepting this offer, you authorize your solicitor to submit it on your behalf.
      </p>
    </Card>
  )
}
