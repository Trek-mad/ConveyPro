'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface WebhookTestFormProps {
  webhookUrl: string
  tenantId: string
}

export function WebhookTestForm({ webhookUrl, tenantId }: WebhookTestFormProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message?: string
    data?: any
    error?: string
  } | null>(null)

  const [formData, setFormData] = useState({
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@example.com',
    phone: '07700900123',
    property_address: '123 High Street',
    property_city: 'Edinburgh',
    property_postcode: 'EH1 1AA',
    purchase_price: '250000',
    is_first_time_buyer: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tenant_id: tenantId,
          form_type: 'conveyancing',
          form_name: 'Test Form',
          source_url: window.location.href,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          data: data.data,
        })
      } else {
        setResult({
          success: false,
          error: data.error || 'Failed to submit',
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Network error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="property_address">Property Address</Label>
          <Input
            id="property_address"
            value={formData.property_address}
            onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="property_city">City</Label>
          <Input
            id="property_city"
            value={formData.property_city}
            onChange={(e) => setFormData({ ...formData, property_city: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="property_postcode">Postcode</Label>
          <Input
            id="property_postcode"
            value={formData.property_postcode}
            onChange={(e) => setFormData({ ...formData, property_postcode: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="purchase_price">Purchase Price (£)</Label>
          <Input
            id="purchase_price"
            type="number"
            value={formData.purchase_price}
            onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="is_first_time_buyer"
            type="checkbox"
            checked={formData.is_first_time_buyer}
            onChange={(e) => setFormData({ ...formData, is_first_time_buyer: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <Label htmlFor="is_first_time_buyer" className="font-normal">
            First-time buyer
          </Label>
        </div>

        <div className="col-span-2">
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Sending...' : 'Send Test Submission'}
          </Button>
        </div>
      </form>

      {/* Result */}
      {result && (
        <div
          className={`rounded-lg border p-4 ${
            result.success
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <div className="flex-1">
              <h4
                className={`font-semibold ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {result.success ? 'Success!' : 'Error'}
              </h4>
              <p
                className={`mt-1 text-sm ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {result.message || result.error}
              </p>
              {result.data && (
                <div className="mt-3 rounded bg-white p-3 font-mono text-xs">
                  <div className="space-y-1">
                    {result.data.client_id && (
                      <div>
                        <strong>Client ID:</strong> {result.data.client_id}
                      </div>
                    )}
                    {result.data.property_id && (
                      <div>
                        <strong>Property ID:</strong> {result.data.property_id}
                      </div>
                    )}
                    {result.data.quote_id && (
                      <div>
                        <strong>Quote ID:</strong>{' '}
                        <a
                          href={`/quotes/${result.data.quote_id}`}
                          className="text-blue-600 underline"
                        >
                          {result.data.quote_id}
                        </a>
                      </div>
                    )}
                    {result.data.enrolled_campaigns > 0 && (
                      <div>
                        <strong>Campaigns Enrolled:</strong> {result.data.enrolled_campaigns}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
