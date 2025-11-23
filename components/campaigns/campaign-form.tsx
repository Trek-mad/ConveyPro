'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface CampaignFormProps {
  campaign?: {
    id: string
    name: string
    description: string | null
    campaign_type: string
    target_life_stages: string[] | null
  }
  mode: 'create' | 'edit'
}

const CAMPAIGN_TYPES = [
  { value: 'wills', label: 'Wills' },
  { value: 'power_of_attorney', label: 'Power of Attorney' },
  { value: 'estate_planning', label: 'Estate Planning' },
  { value: 'remortgage', label: 'Remortgage' },
  { value: 'custom', label: 'Custom' },
]

const LIFE_STAGES = [
  { value: 'first_time_buyer', label: 'First Time Buyer' },
  { value: 'moving_up', label: 'Moving Up' },
  { value: 'investor', label: 'Investor' },
  { value: 'retired', label: 'Retired' },
  { value: 'downsizing', label: 'Downsizing' },
]

export function CampaignForm({ campaign, mode }: CampaignFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    description: campaign?.description || '',
    campaign_type: campaign?.campaign_type || 'wills',
    target_life_stages: campaign?.target_life_stages || [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = mode === 'create'
        ? '/api/campaigns'
        : `/api/campaigns/${campaign?.id}`

      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save campaign')
      }

      const data = await response.json()

      // Redirect to campaign detail page
      router.push(`/campaigns/${data.campaign.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const toggleLifeStage = (stage: string) => {
    setFormData((prev) => {
      const stages = prev.target_life_stages || []
      if (stages.includes(stage)) {
        return {
          ...prev,
          target_life_stages: stages.filter((s) => s !== stage),
        }
      } else {
        return {
          ...prev,
          target_life_stages: [...stages, stage],
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Campaign Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Campaign Name *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          placeholder="e.g., Q1 2024 Wills Campaign"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          placeholder="Describe the purpose and goals of this campaign..."
        />
      </div>

      {/* Campaign Type */}
      <div>
        <label
          htmlFor="campaign_type"
          className="block text-sm font-medium text-gray-700"
        >
          Campaign Type *
        </label>
        <select
          id="campaign_type"
          required
          value={formData.campaign_type}
          onChange={(e) =>
            setFormData({ ...formData, campaign_type: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        >
          {CAMPAIGN_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          The type of legal service this campaign promotes
        </p>
      </div>

      {/* Target Life Stages */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Target Life Stages
        </label>
        <p className="mt-1 text-sm text-gray-500">
          Select which client life stages to target with this campaign
        </p>
        <div className="mt-3 space-y-2">
          {LIFE_STAGES.map((stage) => (
            <div key={stage.value} className="flex items-center">
              <input
                type="checkbox"
                id={`stage-${stage.value}`}
                checked={formData.target_life_stages?.includes(stage.value) || false}
                onChange={() => toggleLifeStage(stage.value)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor={`stage-${stage.value}`}
                className="ml-3 text-sm text-gray-700"
              >
                {stage.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Campaign' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
