'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Offer } from '@/types'
import {
  approveBySolicitor,
  approveByNegotiator,
  submitOfferToAgent,
  withdrawOffer,
  logAgentResponse,
} from '@/services/offer.service'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Check,
  X,
  Send,
  Eye,
  FileText,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  ArrowLeftRight,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface OffersListProps {
  offers: Offer[]
  userRole: string
}

export function OffersList({ offers, userRole }: OffersListProps) {
  const [loadingOfferId, setLoadingOfferId] = useState<string | null>(null)
  const [agentResponseOpen, setAgentResponseOpen] = useState(false)
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null)
  const [agentResponseType, setAgentResponseType] = useState<'accepted' | 'rejected' | 'counter_offer'>('accepted')
  const [agentNotes, setAgentNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [counterOfferAmount, setCounterOfferAmount] = useState('')
  const { toast } = useToast()
  const router = useRouter()

  const canApprove = ['owner', 'admin', 'manager'].includes(userRole)

  const getStatusColor = (status: Offer['offer_status']) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending_solicitor: 'bg-yellow-100 text-yellow-800',
      pending_negotiator: 'bg-orange-100 text-orange-800',
      pending_client: 'bg-blue-100 text-blue-800',
      submitted: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-600',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: Offer['offer_status']) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  async function handleApproveSolicitor(offerId: string) {
    setLoadingOfferId(offerId)
    try {
      const result = await approveBySolicitor(offerId)
      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Offer approved by solicitor',
        })
        router.refresh()
      }
    } finally {
      setLoadingOfferId(null)
    }
  }

  async function handleApproveNegotiator(offerId: string) {
    setLoadingOfferId(offerId)
    try {
      const result = await approveByNegotiator(offerId)
      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Offer approved by negotiator',
        })
        router.refresh()
      }
    } finally {
      setLoadingOfferId(null)
    }
  }

  async function handleSubmitToAgent(offerId: string) {
    setLoadingOfferId(offerId)
    try {
      const result = await submitOfferToAgent(offerId)
      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Offer submitted to agent',
        })
        router.refresh()
      }
    } finally {
      setLoadingOfferId(null)
    }
  }

  async function handleWithdraw(offerId: string) {
    setLoadingOfferId(offerId)
    try {
      const result = await withdrawOffer(offerId)
      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Offer withdrawn',
        })
        router.refresh()
      }
    } finally {
      setLoadingOfferId(null)
    }
  }

  async function handleLogAgentResponse() {
    if (!selectedOfferId) return

    setLoadingOfferId(selectedOfferId)
    try {
      const result = await logAgentResponse(selectedOfferId, agentResponseType, {
        agent_notes: agentNotes || undefined,
        rejection_reason: rejectionReason || undefined,
        counter_offer_amount: counterOfferAmount ? parseFloat(counterOfferAmount) : undefined,
      })

      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Agent response logged',
        })
        setAgentResponseOpen(false)
        setSelectedOfferId(null)
        setAgentNotes('')
        setRejectionReason('')
        setCounterOfferAmount('')
        router.refresh()
      }
    } finally {
      setLoadingOfferId(null)
    }
  }

  if (offers.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No Offers Yet</h3>
        <p className="mt-2 text-sm text-gray-600">
          Create your first offer to get started with the purchase process.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <Card key={offer.id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {offer.offer_number}
                </h3>
                <Badge variant="outline" className="capitalize">
                  {offer.offer_type}
                </Badge>
                <Badge className={getStatusColor(offer.offer_status)}>
                  {getStatusLabel(offer.offer_status)}
                </Badge>
              </div>

              {/* Amount */}
              <p className="mt-2 text-2xl font-bold text-gray-900">
                £{Number(offer.offer_amount).toLocaleString('en-GB')}
              </p>

              {/* Details */}
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                {offer.closing_date && (
                  <div>
                    <dt className="font-medium text-gray-600">Closing Date</dt>
                    <dd className="mt-1 text-gray-900">
                      {new Date(offer.closing_date).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {offer.entry_date && (
                  <div>
                    <dt className="font-medium text-gray-600">Entry Date</dt>
                    <dd className="mt-1 text-gray-900">
                      {new Date(offer.entry_date).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="font-medium text-gray-600">Survey Required</dt>
                  <dd className="mt-1 text-gray-900">
                    {offer.survey_required ? 'Yes' : 'No'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-600">Created</dt>
                  <dd className="mt-1 text-gray-900">
                    {formatDistanceToNow(new Date(offer.created_at), {
                      addSuffix: true,
                    })}
                  </dd>
                </div>
              </dl>

              {/* Conditions */}
              {offer.conditions && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">Conditions:</p>
                  <p className="mt-1 text-sm text-gray-900">{offer.conditions}</p>
                </div>
              )}

              {/* Agent Response */}
              {offer.agent_response && (
                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-900">
                    Agent Response: {offer.agent_response.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  {offer.agent_response_date && (
                    <p className="mt-1 text-xs text-gray-600">
                      {new Date(offer.agent_response_date).toLocaleDateString()}
                    </p>
                  )}
                  {offer.agent_notes && (
                    <p className="mt-2 text-sm text-gray-700">{offer.agent_notes}</p>
                  )}
                  {offer.rejection_reason && (
                    <p className="mt-2 text-sm text-red-600">
                      Reason: {offer.rejection_reason}
                    </p>
                  )}
                  {offer.counter_offer_amount && (
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      Counter Offer: £
                      {Number(offer.counter_offer_amount).toLocaleString('en-GB')}
                    </p>
                  )}
                </div>
              )}

              {/* Client Acceptance */}
              {offer.client_accepted_at && (
                <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  <span>
                    Client accepted{' '}
                    {formatDistanceToNow(new Date(offer.client_accepted_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            {canApprove && (
              <div className="ml-4 flex flex-col gap-2">
                {/* Solicitor Approval */}
                {(offer.offer_status === 'draft' ||
                  offer.offer_status === 'pending_solicitor') && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" disabled={loadingOfferId === offer.id}>
                        {loadingOfferId === offer.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Approve (Solicitor)
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve Offer</AlertDialogTitle>
                        <AlertDialogDescription>
                          Approve this offer as solicitor? This will move it to awaiting
                          negotiator approval.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleApproveSolicitor(offer.id)}
                        >
                          Approve
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {/* Negotiator Approval */}
                {offer.offer_status === 'pending_negotiator' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" disabled={loadingOfferId === offer.id}>
                        {loadingOfferId === offer.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Approve (Negotiator)
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve Offer</AlertDialogTitle>
                        <AlertDialogDescription>
                          Approve this offer as negotiator? This will send it to the client
                          for acceptance.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleApproveNegotiator(offer.id)}
                        >
                          Approve
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {/* Submit to Agent */}
                {offer.offer_status === 'pending_client' &&
                  offer.client_accepted_at && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" disabled={loadingOfferId === offer.id}>
                          {loadingOfferId === offer.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Submit to Agent
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Submit Offer</AlertDialogTitle>
                          <AlertDialogDescription>
                            Submit this offer to the selling agent? This action will send
                            the offer letter.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleSubmitToAgent(offer.id)}
                          >
                            Submit
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                {/* Log Agent Response */}
                {offer.offer_status === 'submitted' && (
                  <Dialog
                    open={agentResponseOpen && selectedOfferId === offer.id}
                    onOpenChange={(open) => {
                      setAgentResponseOpen(open)
                      if (open) {
                        setSelectedOfferId(offer.id)
                      } else {
                        setSelectedOfferId(null)
                        setAgentNotes('')
                        setRejectionReason('')
                        setCounterOfferAmount('')
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        Log Response
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Log Agent Response</DialogTitle>
                        <DialogDescription>
                          Record the selling agent's response to this offer.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <Label>Response Type</Label>
                          <Select
                            value={agentResponseType}
                            onValueChange={(value: any) => setAgentResponseType(value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="accepted">
                                <div className="flex items-center">
                                  <ThumbsUp className="mr-2 h-4 w-4" />
                                  Accepted
                                </div>
                              </SelectItem>
                              <SelectItem value="rejected">
                                <div className="flex items-center">
                                  <ThumbsDown className="mr-2 h-4 w-4" />
                                  Rejected
                                </div>
                              </SelectItem>
                              <SelectItem value="counter_offer">
                                <div className="flex items-center">
                                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                                  Counter Offer
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {agentResponseType === 'rejected' && (
                          <div>
                            <Label>Rejection Reason</Label>
                            <Textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Why was the offer rejected?"
                              rows={3}
                            />
                          </div>
                        )}

                        {agentResponseType === 'counter_offer' && (
                          <div>
                            <Label>Counter Offer Amount (£)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={counterOfferAmount}
                              onChange={(e) => setCounterOfferAmount(e.target.value)}
                              placeholder="e.g., 255000"
                            />
                          </div>
                        )}

                        <div>
                          <Label>Agent Notes (Optional)</Label>
                          <Textarea
                            value={agentNotes}
                            onChange={(e) => setAgentNotes(e.target.value)}
                            placeholder="Any additional notes..."
                            rows={3}
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setAgentResponseOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleLogAgentResponse}
                            disabled={loadingOfferId === offer.id}
                          >
                            {loadingOfferId === offer.id && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Response
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Withdraw */}
                {offer.offer_status !== 'withdrawn' &&
                  offer.offer_status !== 'accepted' &&
                  offer.offer_status !== 'rejected' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={loadingOfferId === offer.id}
                        >
                          {loadingOfferId === offer.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <X className="mr-2 h-4 w-4" />
                              Withdraw
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Withdraw Offer</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to withdraw this offer? This action cannot
                            be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleWithdraw(offer.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Withdraw
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
