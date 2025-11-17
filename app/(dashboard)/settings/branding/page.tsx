import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser, getActiveTenantMembership } from '@/lib/auth'
import { getTenant } from '@/services/tenant.service'
import { getBrandingSettings } from '@/services/branding.service'
import { Card } from '@/components/ui/card'
import { BrandingSettingsForm } from '@/components/settings/branding-settings-form'
import { Palette } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Branding Settings | ConveyPro',
  description: 'Customize your firm branding and appearance',
}

export default async function BrandingSettingsPage() {
  const user = await getCurrentUser()
  const membership = await getActiveTenantMembership()

  if (!user || !membership) {
    redirect('/login')
  }

  // Only owners and admins can access branding settings
  if (!['owner', 'admin'].includes(membership.role)) {
    redirect('/settings/profile')
  }

  // Fetch tenant details and branding settings
  const tenantResult = await getTenant(membership.tenant_id)
  const tenant = 'tenant' in tenantResult ? tenantResult.tenant : null

  const brandingSettings = await getBrandingSettings(membership.tenant_id)

  // Convert logo URL to base64 for reliable preview display
  if (brandingSettings.logo_url) {
    try {
      const logoResponse = await fetch(brandingSettings.logo_url)
      if (logoResponse.ok) {
        const logoBuffer = await logoResponse.arrayBuffer()
        const logoBytes = Buffer.from(logoBuffer)
        const contentType = logoResponse.headers.get('content-type') || 'image/png'
        brandingSettings.logo_url = `data:${contentType};base64,${logoBytes.toString('base64')}`
      } else {
        console.error('Failed to fetch logo for preview:', logoResponse.status)
      }
    } catch (logoError) {
      console.error('Error fetching logo for preview:', logoError)
      // Keep the original URL as fallback
    }
  }

  if (!tenant) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Branding & White Label</h1>
        </div>
        <p className="mt-2 text-gray-600">
          Customize your firm's brand appearance on quotes, emails, and client-facing materials
        </p>
      </div>

      {/* Branding Settings */}
      <Card className="p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Brand Identity
        </h2>
        <BrandingSettingsForm
          tenantId={membership.tenant_id}
          currentSettings={brandingSettings}
          firmName={tenant.name}
        />
      </Card>

      {/* Preview Card */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Quote Preview
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Preview how your branding will appear on client quotes
        </p>

        <div className="rounded-lg border-2 border-gray-200 bg-white p-8">
          {/* Quote Header Preview */}
          <div className="flex items-start justify-between border-b pb-6">
            <div className="flex items-center gap-4">
              {brandingSettings.logo_url ? (
                <img
                  src={brandingSettings.logo_url}
                  alt="Firm Logo"
                  className="h-16 w-auto object-contain"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                  <Palette className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div>
                <h3
                  className="text-xl font-bold"
                  style={{
                    color: brandingSettings.primary_color || '#1f2937',
                  }}
                >
                  {brandingSettings.firm_name || tenant.name}
                </h3>
                {brandingSettings.tagline && (
                  <p className="text-sm text-gray-600">{brandingSettings.tagline}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Quote Number</p>
              <p className="text-lg font-bold text-gray-900">Q-2024-XXX</p>
            </div>
          </div>

          {/* Quote Body Preview */}
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Client</p>
              <p className="text-gray-900">Jane Smith</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Transaction</p>
              <p className="text-gray-900">Residential Purchase - £250,000</p>
            </div>
          </div>

          {/* Quote Footer Preview */}
          <div className="mt-6 border-t pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    color: brandingSettings.accent_color || '#2563eb',
                  }}
                >
                  £1,250.00
                </p>
              </div>
              <button
                className="rounded-lg px-6 py-2 text-white"
                style={{
                  backgroundColor: brandingSettings.primary_color || '#2563eb',
                }}
              >
                Accept Quote
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* White Label Info */}
      <Card className="border-blue-200 bg-blue-50 p-6">
        <h3 className="flex items-center gap-2 font-semibold text-blue-900">
          <Palette className="h-5 w-5" />
          White Label Your Platform
        </h3>
        <p className="mt-2 text-sm text-blue-700">
          Your branding will appear on all client-facing materials including quotes, emails,
          and the client portal. This creates a seamless, professional experience under your
          firm's brand.
        </p>
        <ul className="mt-3 space-y-1 text-sm text-blue-700">
          <li>✓ Custom logo on all quotes and emails</li>
          <li>✓ Brand colors throughout the client experience</li>
          <li>✓ Firm name and tagline on all documents</li>
          <li>✓ Professional, consistent brand presence</li>
        </ul>
      </Card>
    </div>
  )
}
