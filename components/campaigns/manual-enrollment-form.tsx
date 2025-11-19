'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Search } from 'lucide-react'

interface Client {
  id: string
  full_name: string
  email: string
  life_stage: string | null
}

interface ManualEnrollmentFormProps {
  campaignId: string
  availableClients: Client[]
  targetLifeStages: string[]
}

export function ManualEnrollmentForm({
  campaignId,
  availableClients,
  targetLifeStages,
}: ManualEnrollmentFormProps) {
  const router = useRouter()
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMatchingOnly, setShowMatchingOnly] = useState(false)

  // Filter clients based on search and matching criteria
  const filteredClients = availableClients.filter((client) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    // Matching filter
    if (showMatchingOnly && targetLifeStages.length > 0) {
      return client.life_stage && targetLifeStages.includes(client.life_stage)
    }

    return true
  })

  const toggleClient = (clientId: string) => {
    const newSelected = new Set(selectedClients)
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId)
    } else {
      newSelected.add(clientId)
    }
    setSelectedClients(newSelected)
  }

  const selectAllMatching = () => {
    const matchingIds = filteredClients
      .filter((client) => {
        if (targetLifeStages.length === 0) return true
        return client.life_stage && targetLifeStages.includes(client.life_stage)
      })
      .map((c) => c.id)

    setSelectedClients(new Set(matchingIds))
  }

  const handleEnroll = async () => {
    if (selectedClients.size === 0) return

    setEnrolling(true)
    setError(null)

    try {
      const response = await fetch('/api/campaigns/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: Array.from(selectedClients),
          campaignIds: [campaignId],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to enroll clients')
      }

      const data = await response.json()

      // Reset selection and refresh
      setSelectedClients(new Set())
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to enroll clients')
    } finally {
      setEnrolling(false)
    }
  }

  const clientMatchesCriteria = (client: Client) => {
    if (targetLifeStages.length === 0) return true
    return client.life_stage && targetLifeStages.includes(client.life_stage)
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {targetLifeStages.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showMatchingOnly}
              onChange={(e) => setShowMatchingOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show matching only
          </label>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Clients List */}
      <div className="max-h-96 space-y-2 overflow-y-auto rounded-md border border-gray-200 p-3">
        {filteredClients.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            {searchQuery
              ? 'No clients found matching your search'
              : 'All clients are already enrolled'}
          </p>
        ) : (
          <>
            {filteredClients.map((client) => {
              const matches = clientMatchesCriteria(client)
              return (
                <div
                  key={client.id}
                  className={`flex items-center gap-3 rounded-md border p-3 transition-colors ${
                    selectedClients.has(client.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleClient(client.id)}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                      selectedClients.has(client.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedClients.has(client.id) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {client.full_name}
                      </p>
                      {matches && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Matches criteria
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{client.email}</p>
                    {client.life_stage && (
                      <p className="mt-1 text-xs text-gray-400">
                        {client.life_stage.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-sm text-gray-600">
          {selectedClients.size === 0 ? (
            'Select clients to enroll'
          ) : (
            <>
              <strong>{selectedClients.size}</strong> client
              {selectedClients.size !== 1 ? 's' : ''} selected
            </>
          )}
        </div>
        <div className="flex gap-3">
          {targetLifeStages.length > 0 && (
            <button
              onClick={selectAllMatching}
              disabled={enrolling}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Select All Matching
            </button>
          )}
          <button
            onClick={handleEnroll}
            disabled={selectedClients.size === 0 || enrolling}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {enrolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enrolling...
              </>
            ) : (
              <>Enroll Selected</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
