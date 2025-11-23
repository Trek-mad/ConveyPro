'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Info, ChevronDown, ChevronUp } from 'lucide-react'

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
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    subject_line: template?.subject_line || '',
    preview_text: template?.preview_text || '',
    body_html: template?.body_html || '',
    body_text: template?.body_text || '',
    sequence_order: template?.sequence_order || 1,
  })

  // Auto-generate HTML from plain text
  const generateHtmlFromPlainText = (plainText: string): string => {
    if (!plainText.trim()) return ''

    // Split by double line breaks for paragraphs
    const paragraphs = plainText.split(/\n\n+/)

    return paragraphs
      .map((para) => {
        // Replace single line breaks with <br> tags
        const formatted = para.trim().replace(/\n/g, '<br>')
        return formatted ? `<p>${formatted}</p>` : ''
      })
      .filter(Boolean)
      .join('\n')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Auto-generate HTML from plain text if HTML is empty
      const body_html = formData.body_html.trim()
        ? formData.body_html
        : generateHtmlFromPlainText(formData.body_text)

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
          body_html, // Use auto-generated if needed
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
    const textarea = document.getElementById('body_text') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = formData.body_text
      const before = text.substring(0, start)
      const after = text.substring(end)
      const newText = before + `{{${variable}}}` + after

      setFormData({ ...formData, body_text: newText })

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
              Personalize Your Email
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">Click to insert personalization variables:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => insertVariable('client_name')}
                  className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                >
                  Client Name
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('firm_name')}
                  className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                >
                  Firm Name
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('service_name')}
                  className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                >
                  Service Name
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('property_address')}
                  className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                >
                  Property Address
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Body Plain Text (PRIMARY) */}
      <div>
        <label
          htmlFor="body_text"
          className="block text-sm font-medium text-gray-700"
        >
          Email Body *
        </label>
        <textarea
          id="body_text"
          required
          rows={15}
          value={formData.body_text}
          onChange={(e) =>
            setFormData({ ...formData, body_text: e.target.value })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Dear {{client_name}},&#10;&#10;We noticed you recently completed a property purchase. As part of our service, we'd like to offer you a complimentary estate planning consultation.&#10;&#10;This is an important step to protect your family and new property.&#10;&#10;Best regards,&#10;{{firm_name}}"
        />
        <p className="mt-1 text-sm text-gray-500">
          Write your email in plain text. Click the buttons above to add personalization. The system will automatically format it for email.
        </p>
      </div>

      {/* Advanced Options Toggle */}
      <div className="border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {showAdvanced ? (
            <ChevronUp className="mr-2 h-4 w-4" />
          ) : (
            <ChevronDown className="mr-2 h-4 w-4" />
          )}
          Advanced Options (HTML Editor)
        </button>
        <p className="mt-1 text-xs text-gray-500">
          {showAdvanced
            ? 'Customize the HTML version if needed. If left empty, HTML will be auto-generated from your plain text above.'
            : 'Only for advanced users who want to customize HTML formatting.'
          }
        </p>
      </div>

      {/* Email Body HTML (ADVANCED - OPTIONAL) */}
      {showAdvanced && (
        <div className="rounded-md bg-gray-50 p-4">
          <label
            htmlFor="body_html"
            className="block text-sm font-medium text-gray-700"
          >
            Custom HTML (Optional)
          </label>
          <textarea
            id="body_html"
            rows={15}
            value={formData.body_html}
            onChange={(e) =>
              setFormData({ ...formData, body_html: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="<p>Dear {{client_name}},</p>&#10;<p>We noticed you recently completed...</p>"
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave empty to auto-generate from plain text above. Only fill this if you need custom HTML formatting.
          </p>
        </div>
      )}

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
