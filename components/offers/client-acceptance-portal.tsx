'use client'

import { useState } from 'react'
import type { Offer } from '@/types'
import { acceptOfferByClient } from '@/services/offer.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Check, Loader2, FileText, Calendar, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ClientAcceptancePortalProps {
  offer: Offer
  matterNumber: string
  propertyAddress?: string
}

export function ClientAcceptancePortal({
  offer,
  matterNumber,
  propertyAddress,
}: ClientAcceptancePortalProps) {
  const [isAccepting, setIsAccepting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Check if already accepted
  const alreadyAccepted = !!offer.client_accepted_at

  // Check if ready for acceptance
  const readyForAcceptance = offer.offer_status === 'pending_client'

  async function handleAccept() {
    setIsAccepting(true)

    try {
      // Get client IP address (you can enhance this with a server-side API call)
      const clientIp = await fetch('https://api.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch(() => 'unknown')

      const result = await acceptOfferByClient(offer.id, clientIp)

      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Offer Accepted',
        description: 'Thank you for accepting the offer. Your solicitor has been notified.',
      })

      router.refresh()
    } catch (error) {
      console.error('Error accepting offer:', error)
      toast({
        title: 'Error',
        description: 'Failed to accept offer. Please try again or contact your solicitor.',
        variant: 'destructive',
      })
    } finally {
      setIsAccepting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="mx-auto max-w-3xl py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Offer Acceptance Portal</h1>
          <p className="mt-2 text-lg text-gray-600">Matter: {matterNumber}</p>
        </div>

        {/* Main Card */}
        <Card className="p-8">
          {/* Already Accepted */}
          {alreadyAccepted && (
            <div className="mb-6 rounded-lg bg-green-50 p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-900">Offer Already Accepted</h2>
              <p className="mt-2 text-green-700">
                You accepted this offer{offer.client_accepted_at ? ' on ' : ''}
                {offer.client_accepted_at && new Date(offer.client_accepted_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="mt-4 text-sm text-green-600">
                Your solicitor will be in touch regarding the next steps.
              </p>
            </div>
          )}

          {/* Not Ready */}
          {!readyForAcceptance && !alreadyAccepted && (
            <div className="mb-6 rounded-lg bg-yellow-50 p-6 text-center">
              <h2 className="text-xl font-bold text-yellow-900">
                Offer Not Ready for Acceptance
              </h2>
              <p className="mt-2 text-yellow-700">
                This offer is currently {offer.offer_status.replace(/_/g, ' ')}. Your
                solicitor will notify you when it's ready for your acceptance.
              </p>
            </div>
          )}

          {/* Property Details */}
          {propertyAddress && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-gray-50 p-4">
              <Home className="mt-1 h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Property Address</p>
                <p className="mt-1 text-base text-gray-900">{propertyAddress}</p>
              </div>
            </div>
          )}

          {/* Offer Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Offer Details</h3>
                <Badge variant="outline" className="capitalize">
                  {offer.offer_type} Offer
                </Badge>
              </div>

              {/* Amount */}
              <div className="mt-4 rounded-lg bg-blue-50 p-6 text-center">
                <p className="text-sm font-medium text-blue-600">Offer Amount</p>
                <p className="mt-2 text-4xl font-bold text-blue-900">
                  £{Number(offer.offer_amount).toLocaleString('en-GB')}
                </p>
              </div>

              {/* Key Details */}
              <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-4">
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Closing Date
                  </dt>
                  <dd className="mt-2 text-base text-gray-900">
                    {offer.closing_date
                      ? new Date(offer.closing_date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Not specified'}
                  </dd>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Entry Date
                  </dt>
                  <dd className="mt-2 text-base text-gray-900">
                    {offer.entry_date
                      ? new Date(offer.entry_date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'To be agreed'}
                  </dd>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <FileText className="h-4 w-4" />
                    Survey Required
                  </dt>
                  <dd className="mt-2 text-base text-gray-900">
                    {offer.survey_required ? 'Yes' : 'No'}
                  </dd>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <FileText className="h-4 w-4" />
                    Offer Number
                  </dt>
                  <dd className="mt-2 text-base text-gray-900">{offer.offer_number}</dd>
                </div>
              </dl>

              {/* Conditions */}
              {offer.conditions && (
                <div className="mt-6 rounded-lg border border-gray-200 p-4">
                  <h4 className="text-sm font-medium text-gray-600">
                    Conditions & Requirements
                  </h4>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-900">
                    {offer.conditions}
                  </p>
                </div>
              )}
            </div>

            {/* Acceptance Section */}
            {readyForAcceptance && !alreadyAccepted && (
              <div className="mt-8 space-y-4">
                <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
                  <h3 className="text-lg font-semibold text-blue-900">
                    Ready to Accept This Offer?
                  </h3>
                  <p className="mt-2 text-sm text-blue-700">
                    By clicking "Accept Offer" below, you confirm that you have reviewed
                    the offer details and wish to proceed with this purchase. Your
                    solicitor will be notified immediately and will guide you through the
                    next steps.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-start gap-2 text-sm text-blue-700">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>Your acceptance will be timestamped and recorded</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-blue-700">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>Your solicitor will be notified immediately</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-blue-700">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>The offer will be submitted to the selling agent</span>
                    </div>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="lg"
                      className="w-full bg-green-600 text-lg hover:bg-green-700"
                      disabled={isAccepting}
                    >
                      {isAccepting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-5 w-5" />
                          Accept Offer
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Offer Acceptance</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to accept this offer for £
                        {Number(offer.offer_amount).toLocaleString('en-GB')}? This action
                        will notify your solicitor and they will submit the offer to the
                        selling agent.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleAccept}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Yes, Accept Offer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <p className="text-center text-xs text-gray-500">
                  By accepting, you acknowledge that you have read and understood the offer
                  terms and conditions.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 border-t border-gray-200 pt-6 text-center">
            <p className="text-sm text-gray-600">
              If you have any questions about this offer, please contact your solicitor
              directly.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
