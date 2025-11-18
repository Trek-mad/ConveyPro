'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Info } from 'lucide-react'

interface TemplateFormProps {
  campaignId: string
  template?: {
    id: string
    name: string
    description: string | null
    subject_line: string
    preview_text: string | null
    body_html: string
    body_text: string | null
    sequence_order: number
  }
  mode: 'create' | 'edit'
}

export function TemplateForm({ campaignId, template, mode }: TemplateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    subject_line: template?.subject_line || '',
    preview_text: template?.preview_text || '',
    body_html: template?.body_html || '',
    body_text: template?.body_text || '',
    sequence_order: template?.sequence_order || 1,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = mode === 'create'
        ? '/api/templates'
        : `/api/templates/${template?.id}`

      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          campaign_id: campaignId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save template')
      }

      // Redirect back to campaign detail page
      router.push(`/campaigns/${campaignId}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('body_html') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = formData.body_html
      const before = text.substring(0, start)
      const after = text.substring(end)
      const newText = before + `{{${variable}}}` + after

      setFormData({ ...formData, body_html: newText })

      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(
          start + variable.length + 4,
          start + variable.length + 4
        )
      }, 0)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Template Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Template Name *
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
          placeholder="e.g., Welcome Email"
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
        <input
          type="text"
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          placeholder="Brief description of this email"
        />
      </div>

      {/* Sequence Order */}
      <div>
        <label
          htmlFor="sequence_order"
          className="block text-sm font-medium text-gray-700"
        >
          Sequence Order *
        </label>
        <input
          type="number"
          id="sequence_order"
          required
          min="1"
          value={formData.sequence_order}
          onChange={(e) =>
            setFormData({ ...formData, sequence_order: parseInt(e.target.value) })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
        <p className="mt-1 text-sm text-gray-500">
          Order in which this email appears in the campaign sequence
        </p>
      </div>

      {/* Subject Line */}
      <div>
        <label
          htmlFor="subject_line"
          className="block text-sm font-medium text-gray-700"
        >
          Subject Line *
        </label>
        <input
          type="text"
          id="subject_line"
          required
          value={formData.subject_line}
          onChange={(e) =>
            setFormData({ ...formData, subject_line: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          placeholder="e.g., Your estate planning consultation is ready"
        />
        <p className="mt-1 text-sm text-gray-500">
          Use {'{{client_name}}'} and {'{{firm_name}}'} for personalization
        </p>
      </div>

      {/* Preview Text */}
      <div>
        <label
          htmlFor="preview_text"
          className="block text-sm font-medium text-gray-700"
        >
          Preview Text
        </label>
        <input
          type="text"
          id="preview_text"
          value={formData.preview_text}
          onChange={(e) =>
            setFormData({ ...formData, preview_text: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          placeholder="Text shown in email preview before opening"
        />
      </div>

      {/* Variable Helper */}
      <div className="rounded-md bg-blue-50 p-4">
        <div className="flex">
          <Info className="h-5 w-5 text-blue-400" />
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              Available Variables
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">Click to insert into email body:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => insertVariable('client_name')}
                  className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                >
                  {'{{client_name}}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('firm_name')}
                  className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                >
                  {'{{firm_name}}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('service_name')}
                  className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                >
                  {'{{service_name}}'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Body HTML */}
      <div>
        <label
          htmlFor="body_html"
          className="block text-sm font-medium text-gray-700"
        >
          Email Body (HTML) *
        </label>
        <textarea
          id="body_html"
          required
          rows={15}
          value={formData.body_html}
          onChange={(e) =>
            setFormData({ ...formData, body_html: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="<p>Dear {{client_name}},</p>&#10;<p>We noticed you recently completed...</p>"
        />
        <p className="mt-1 text-sm text-gray-500">
          HTML content of the email. Use variables for personalization.
        </p>
      </div>

      {/* Email Body Plain Text */}
      <div>
        <label
          htmlFor="body_text"
          className="block text-sm font-medium text-gray-700"
        >
          Plain Text Version
        </label>
        <textarea
          id="body_text"
          rows={10}
          value={formData.body_text}
          onChange={(e) =>
            setFormData({ ...formData, body_text: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Dear {{client_name}},&#10;&#10;We noticed you recently completed..."
        />
        <p className="mt-1 text-sm text-gray-500">
          Plain text fallback for email clients that don't support HTML
        </p>
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
          {mode === 'create' ? 'Create Template' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
