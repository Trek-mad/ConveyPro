import { Suspense } from 'react'
import { getActiveTenantMembership } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { WebhookTestForm } from '@/components/settings/webhook-test-form'
import { FormSubmissionStats } from '@/components/settings/form-submission-stats'
import { CopyButton } from '@/components/settings/copy-button'

export const metadata = {
  title: 'Integrations | ConveyPro',
  description: 'Connect external forms and webhooks',
}

export default async function IntegrationsPage() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    redirect('/auth/login')
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const webhookUrl = `${baseUrl}/api/webhooks/form-submission?tenant_id=${membership.tenant_id}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="mt-2 text-gray-600">
          Connect external forms to automatically create clients, properties, and quotes
        </p>
      </div>

      {/* Webhook Configuration */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900">Form Webhook</h2>
        <p className="mt-2 text-sm text-gray-600">
          Send form submissions to this webhook URL to automatically create clients and quotes
        </p>

        <div className="mt-4 space-y-4">
          {/* Webhook URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Webhook URL
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono"
              />
              <CopyButton text={webhookUrl} />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Include your tenant ID in the URL or send it in the request body
            </p>
          </div>

          {/* Authentication */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Authentication
            </label>
            <p className="mt-1 text-sm text-gray-600">
              Set <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">FORM_WEBHOOK_SECRET</code> in your environment variables and include it as a Bearer token:
            </p>
            <div className="mt-2 rounded-md bg-gray-50 p-3 font-mono text-xs">
              Authorization: Bearer YOUR_WEBHOOK_SECRET
            </div>
          </div>

          {/* Required Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Required Fields
            </label>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li>• <code className="rounded bg-gray-100 px-1 font-mono text-xs">first_name</code> - Client's first name</li>
              <li>• <code className="rounded bg-gray-100 px-1 font-mono text-xs">last_name</code> - Client's last name</li>
            </ul>
          </div>

          {/* Optional Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Optional Fields
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <strong className="text-gray-700">Client Info:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• email</li>
                  <li>• phone</li>
                  <li>• client_type</li>
                </ul>
              </div>
              <div>
                <strong className="text-gray-700">Property Info:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• property_address</li>
                  <li>• property_city</li>
                  <li>• property_postcode</li>
                  <li>• purchase_price</li>
                </ul>
              </div>
              <div>
                <strong className="text-gray-700">Transaction:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• transaction_type</li>
                  <li>• is_first_time_buyer</li>
                  <li>• is_additional_property</li>
                </ul>
              </div>
              <div>
                <strong className="text-gray-700">Form Meta:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• form_type</li>
                  <li>• form_name</li>
                  <li>• source_url</li>
                  <li>• notes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Webhook */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900">Test Webhook</h2>
        <p className="mt-2 text-sm text-gray-600">
          Send a test form submission to verify your webhook is working
        </p>
        <div className="mt-4">
          <WebhookTestForm webhookUrl={webhookUrl} tenantId={membership.tenant_id} />
        </div>
      </div>

      {/* Submission Stats */}
      <Suspense fallback={<div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 h-32" />}>
        <FormSubmissionStats tenantId={membership.tenant_id} />
      </Suspense>

      {/* Documentation Link */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="text-sm font-semibold text-blue-900">
          📚 Integration Examples
        </h3>
        <p className="mt-2 text-sm text-blue-800">
          View example payloads and integration code by visiting:{' '}
          <a
            href={`${baseUrl}/api/webhooks/form-submission?tenant_id=${membership.tenant_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono underline"
          >
            GET {webhookUrl}
          </a>
        </p>
      </div>
    </div>
  )
}
