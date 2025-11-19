'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Clock, Check, Loader2 } from 'lucide-react'

interface MatchingCampaign {
  id: string
  name: string
  description: string | null
  campaign_type: string
  template_count: number
  estimated_duration_days: number
  matches_criteria: boolean
}

interface CampaignEnrollmentModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: string
  clientName: string
  onEnroll: (campaignIds: string[]) => Promise<void>
}

export function CampaignEnrollmentModal({
  isOpen,
  onClose,
  clientId,
  clientName,
  onEnroll,
}: CampaignEnrollmentModalProps) {
  const [campaigns, setCampaigns] = useState<MatchingCampaign[]>([])
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(
    new Set()
  )
  const [loading, setLoading] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && clientId) {
      fetchMatchingCampaigns()
    }
  }, [isOpen, clientId])

  const fetchMatchingCampaigns = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/campaigns/enroll?clientId=${clientId}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }

      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load matching campaigns')
    } finally {
      setLoading(false)
    }
  }

  const toggleCampaign = (campaignId: string) => {
    const newSelected = new Set(selectedCampaigns)
    if (newSelected.has(campaignId)) {
      newSelected.delete(campaignId)
    } else {
      newSelected.add(campaignId)
    }
    setSelectedCampaigns(newSelected)
  }

  const handleEnroll = async () => {
    if (selectedCampaigns.size === 0) {
      await onEnroll([])
      onClose()
      return
    }

    setEnrolling(true)
    setError(null)

    try {
      await onEnroll(Array.from(selectedCampaigns))
      onClose()
      setSelectedCampaigns(new Set())
    } catch (err: any) {
      setError(err.message || 'Failed to enroll client')
    } finally {
      setEnrolling(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Enroll in Email Campaigns
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Select campaigns to enroll <strong>{clientName}</strong> in
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Campaigns List */}
        {!loading && (
          <>
            {campaigns.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
                <Mail className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">
                  No active campaigns
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  There are no active campaigns available. Create and activate a campaign first.
                </p>
              </div>
            ) : (
              <div className="mb-6 max-h-96 space-y-3 overflow-y-auto">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                      selectedCampaigns.has(campaign.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleCampaign(campaign.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 flex h-5 w-5 items-center justify-center rounded border-2 ${
                            selectedCampaigns.has(campaign.id)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedCampaigns.has(campaign.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {campaign.name}
                            </h3>
                            {campaign.matches_criteria && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                Recommended
                              </span>
                            )}
                          </div>
                          {campaign.description && (
                            <p className="mt-1 text-sm text-gray-600">
                              {campaign.description}
                            </p>
                          )}

                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              <span>
                                {campaign.template_count}{' '}
                                {campaign.template_count === 1
                                  ? 'email'
                                  : 'emails'}
                              </span>
                            </div>
                            {campaign.estimated_duration_days > 0 && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {campaign.estimated_duration_days} day
                                  {campaign.estimated_duration_days !== 1
                                    ? 's'
                                    : ''}
                                </span>
                              </div>
                            )}
                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                              {campaign.campaign_type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info Box */}
            {campaigns.length > 0 && (
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="text-sm font-semibold text-blue-900">
                  Campaign Selection & Enrollment
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-blue-800">
                  <li>
                    • <strong>Recommended</strong> campaigns match the client's profile, but you can select any campaign
                  </li>
                  <li>
                    • Client will receive personalized emails based on the campaign schedule
                  </li>
                  <li>• Emails are sent automatically via the daily cron job (9 AM UTC)</li>
                  <li>
                    • You can unenroll the client anytime from the campaign Subscribers tab
                  </li>
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-gray-600">
                {selectedCampaigns.size === 0 ? (
                  'Skip enrollment and accept quote'
                ) : (
                  <>
                    <strong>{selectedCampaigns.size}</strong> campaign
                    {selectedCampaigns.size !== 1 ? 's' : ''} selected
                  </>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={enrolling}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || loading}
                  className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : selectedCampaigns.size === 0 ? (
                    'Accept Quote'
                  ) : (
                    <>Accept & Enroll</>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
