'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/card'
import { Upload, X, Loader2, CheckCircle2 } from 'lucide-react'
import type { BrandingSettings } from '@/services/branding.service'

interface BrandingSettingsFormProps {
  tenantId: string
  currentSettings: BrandingSettings
  firmName: string
}

export function BrandingSettingsForm({
  tenantId,
  currentSettings,
  firmName,
}: BrandingSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(
    currentSettings.logo_url || null
  )

  const [settings, setSettings] = useState<BrandingSettings>({
    firm_name: currentSettings.firm_name || firmName,
    tagline: currentSettings.tagline || '',
    primary_color: currentSettings.primary_color || '#2563eb',
    secondary_color: currentSettings.secondary_color || '#64748b',
    accent_color: currentSettings.accent_color || '#8b5cf6',
    show_branding_on_quotes: currentSettings.show_branding_on_quotes ?? true,
    show_branding_on_emails: currentSettings.show_branding_on_emails ?? true,
  })

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setLogoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setIsSaved(false)

    try {
      // Upload logo if changed
      if (logoFile) {
        const formData = new FormData()
        formData.append('file', logoFile)
        formData.append('tenantId', tenantId)

        const uploadRes = await fetch('/api/branding/upload-logo', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error('Failed to upload logo')
        }

        const { url } = await uploadRes.json()
        settings.logo_url = url
      }

      // Update branding settings
      const res = await fetch('/api/branding/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          settings,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to update settings')
      }

      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)

      // Reload to show updated branding
      window.location.reload()
    } catch (error) {
      console.error('Error saving branding settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Firm Logo
        </label>
        <p className="mt-1 text-sm text-gray-500">
          Upload your firm's logo (PNG, JPG, or SVG recommended)
        </p>

        <div className="mt-3">
          {logoPreview ? (
            <div className="relative inline-block">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-24 w-auto rounded-lg border-2 border-gray-200 object-contain p-2"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Click to upload logo</p>
              <p className="text-xs text-gray-500">PNG, JPG, SVG up to 5MB</p>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </label>
          )}
        </div>
      </div>

      {/* Firm Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Firm Name (Display)
        </label>
        <p className="mt-1 text-sm text-gray-500">
          This name will appear on quotes and emails
        </p>
        <input
          type="text"
          value={settings.firm_name}
          onChange={(e) =>
            setSettings({ ...settings, firm_name: e.target.value })
          }
          className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Your Law Firm Ltd"
        />
      </div>

      {/* Tagline */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tagline (Optional)
        </label>
        <p className="mt-1 text-sm text-gray-500">
          A short tagline to appear under your firm name
        </p>
        <input
          type="text"
          value={settings.tagline}
          onChange={(e) =>
            setSettings({ ...settings, tagline: e.target.value })
          }
          className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Professional Conveyancing Services"
        />
      </div>

      {/* Color Pickers */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Primary Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Primary Color
          </label>
          <p className="mt-1 text-sm text-gray-500">Main brand color</p>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="color"
              value={settings.primary_color}
              onChange={(e) =>
                setSettings({ ...settings, primary_color: e.target.value })
              }
              className="h-10 w-16 cursor-pointer rounded border border-gray-300"
            />
            <input
              type="text"
              value={settings.primary_color}
              onChange={(e) =>
                setSettings({ ...settings, primary_color: e.target.value })
              }
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Secondary Color
          </label>
          <p className="mt-1 text-sm text-gray-500">Supporting color</p>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="color"
              value={settings.secondary_color}
              onChange={(e) =>
                setSettings({ ...settings, secondary_color: e.target.value })
              }
              className="h-10 w-16 cursor-pointer rounded border border-gray-300"
            />
            <input
              type="text"
              value={settings.secondary_color}
              onChange={(e) =>
                setSettings({ ...settings, secondary_color: e.target.value })
              }
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Accent Color
          </label>
          <p className="mt-1 text-sm text-gray-500">Call-to-action color</p>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="color"
              value={settings.accent_color}
              onChange={(e) =>
                setSettings({ ...settings, accent_color: e.target.value })
              }
              className="h-10 w-16 cursor-pointer rounded border border-gray-300"
            />
            <input
              type="text"
              value={settings.accent_color}
              onChange={(e) =>
                setSettings({ ...settings, accent_color: e.target.value })
              }
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>
      </div>

      {/* Display Options */}
      <div className="space-y-3 border-t pt-6">
        <h3 className="text-sm font-medium text-gray-900">Display Options</h3>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.show_branding_on_quotes}
            onChange={(e) =>
              setSettings({
                ...settings,
                show_branding_on_quotes: e.target.checked,
              })
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              Show branding on quotes
            </p>
            <p className="text-xs text-gray-500">
              Display your logo and colors on PDF quotes
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.show_branding_on_emails}
            onChange={(e) =>
              setSettings({
                ...settings,
                show_branding_on_emails: e.target.checked,
              })
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              Show branding on emails
            </p>
            <p className="text-xs text-gray-500">
              Include your logo in email communications
            </p>
          </div>
        </label>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3 border-t pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Branding Settings'
          )}
        </button>

        {isSaved && (
          <span className="flex items-center text-sm text-green-600">
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Settings saved successfully
          </span>
        )}
      </div>
    </form>
  )
}
