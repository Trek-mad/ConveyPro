'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Property, Quote } from '@/types'
import { updateQuote } from '@/services/quote.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { ExternalLink, MapPin } from 'lucide-react'

const quoteSchema = z.object({
  // Property
  property_id: z.string().optional().nullable(),

  // Client information
  client_name: z.string().min(2, 'Client name is required'),
  client_email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal(''))
    .nullable(),
  client_phone: z.string().optional().nullable(),

  // Transaction details
  transaction_type: z.enum([
    'purchase',
    'sale',
    'remortgage',
    'transfer_of_equity',
  ]),
  transaction_value: z.string().min(1, 'Transaction value is required'),

  // Financial details
  base_fee: z.string().min(1, 'Base fee is required'),
  disbursements: z.string().optional(),
  vat_rate: z.string().optional(),

  // Additional notes
  notes: z.string().optional().nullable(),
})

type QuoteFormData = z.infer<typeof quoteSchema>

interface QuoteEditFormProps {
  quote: Quote
  properties: Property[]
}

export function QuoteEditForm({ quote, properties }: QuoteEditFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  )

  // Parse existing fee breakdown
  const feeBreakdown =
    typeof quote.fee_breakdown === 'string'
      ? JSON.parse(quote.fee_breakdown)
      : quote.fee_breakdown

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      property_id: quote.property_id || undefined,
      client_name: quote.client_name,
      client_email: quote.client_email || '',
      client_phone: quote.client_phone || '',
      transaction_type: quote.transaction_type,
      transaction_value: String(quote.transaction_value),
      base_fee: String(quote.base_fee),
      disbursements: String(quote.disbursements),
      vat_rate: String(feeBreakdown?.vat_rate || 20),
      notes: quote.notes || '',
    },
  })

  // Watch values for auto-calculation
  const baseFee = watch('base_fee') || '0'
  const disbursements = watch('disbursements') || '0'
  const vatRate = watch('vat_rate') || '20'
  const propertyId = watch('property_id')

  // Calculate totals
  const baseFeeNum = parseFloat(baseFee) || 0
  const disbursementsNum = parseFloat(disbursements) || 0
  const vatRateNum = parseFloat(vatRate) || 20

  const vatAmount = (baseFeeNum * vatRateNum) / 100
  const totalAmount = baseFeeNum + disbursementsNum + vatAmount

  // Set initial selected property if quote has property_id
  useEffect(() => {
    if (quote.property_id) {
      const property = properties.find((p) => p.id === quote.property_id)
      setSelectedProperty(property || null)
    }
  }, [quote.property_id, properties])

  const handlePropertyChange = (value: string) => {
    if (value === 'none') {
      setValue('property_id', null)
      setSelectedProperty(null)
    } else {
      setValue('property_id', value)
      const property = properties.find((p) => p.id === value)
      setSelectedProperty(property || null)
    }
  }

  const onSubmit = async (data: QuoteFormData) => {
    setIsLoading(true)
    setError(null)

    const result = await updateQuote(quote.id, {
      property_id: data.property_id || null,
      client_name: data.client_name,
      client_email: data.client_email || null,
      client_phone: data.client_phone || null,
      transaction_type: data.transaction_type,
      transaction_value: parseFloat(data.transaction_value),
      base_fee: parseFloat(data.base_fee),
      disbursements: parseFloat(data.disbursements || '0'),
      vat_amount: vatAmount,
      total_amount: totalAmount,
      fee_breakdown: {
        base_fee: parseFloat(data.base_fee),
        disbursements: parseFloat(data.disbursements || '0'),
        vat_rate: parseFloat(data.vat_rate || '20'),
        vat_amount: vatAmount,
      },
      notes: data.notes || null,
    })

    if ('error' in result) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    // Redirect to quote detail page
    router.push(`/quotes/${result.quote.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Property Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Linked Property
          </h2>
          <Link
            href="/properties/new"
            target="_blank"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            <span className="flex items-center gap-1">
              Add New Property
              <ExternalLink className="h-3 w-3" />
            </span>
          </Link>
        </div>

        <div>
          <Label htmlFor="property_id">Select Property (Optional)</Label>
          <Select
            value={propertyId || 'none'}
            onValueChange={handlePropertyChange}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a property (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No property</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.address_line1}, {property.city} ({property.postcode}
                  )
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-gray-500">
            Link this quote to a property record
          </p>
        </div>

        {/* Selected Property Preview */}
        {selectedProperty && (
          <Card className="bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {selectedProperty.address_line1}
                </p>
                {selectedProperty.address_line2 && (
                  <p className="text-sm text-gray-700">
                    {selectedProperty.address_line2}
                  </p>
                )}
                <p className="text-sm text-gray-700">
                  {selectedProperty.city}, {selectedProperty.postcode}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                    {selectedProperty.property_type}
                  </span>
                  {selectedProperty.title_number && (
                    <span className="text-xs text-gray-600">
                      Title: {selectedProperty.title_number}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Client Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Client Information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="client_name">
              Client Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="client_name"
              placeholder="John Smith"
              {...register('client_name')}
              className="mt-1"
            />
            {errors.client_name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.client_name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="client_email">Email</Label>
            <Input
              id="client_email"
              type="email"
              placeholder="john.smith@example.com"
              {...register('client_email')}
              className="mt-1"
            />
            {errors.client_email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.client_email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="client_phone">Phone</Label>
            <Input
              id="client_phone"
              placeholder="+44 7700 900000"
              {...register('client_phone')}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Transaction Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="transaction_type">
              Transaction Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('transaction_type')}
              onValueChange={(value) =>
                setValue(
                  'transaction_type',
                  value as QuoteFormData['transaction_type']
                )
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="remortgage">Remortgage</SelectItem>
                <SelectItem value="transfer_of_equity">
                  Transfer of Equity
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="transaction_value">
              Transaction Value (£) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="transaction_value"
              type="number"
              step="0.01"
              placeholder="250000"
              {...register('transaction_value')}
              className="mt-1"
            />
            {errors.transaction_value && (
              <p className="mt-1 text-sm text-red-600">
                {errors.transaction_value.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Financial Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="base_fee">
              Base Fee (£) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="base_fee"
              type="number"
              step="0.01"
              placeholder="1500.00"
              {...register('base_fee')}
              className="mt-1"
            />
            {errors.base_fee && (
              <p className="mt-1 text-sm text-red-600">
                {errors.base_fee.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="disbursements">Disbursements (£)</Label>
            <Input
              id="disbursements"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('disbursements')}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">
              Third-party costs (searches, land registry fees, etc.)
            </p>
          </div>

          <div>
            <Label htmlFor="vat_rate">VAT Rate (%)</Label>
            <Input
              id="vat_rate"
              type="number"
              step="0.01"
              placeholder="20"
              {...register('vat_rate')}
              className="mt-1"
            />
          </div>
        </div>

        {/* Total Preview */}
        <Card className="bg-gray-50 p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Fee:</span>
              <span className="font-medium">
                £{baseFeeNum.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Disbursements:</span>
              <span className="font-medium">
                £
                {disbursementsNum.toLocaleString('en-GB', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">VAT ({vatRateNum}%):</span>
              <span className="font-medium">
                £{vatAmount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="border-t border-gray-300 pt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-blue-600">
                  £
                  {totalAmount.toLocaleString('en-GB', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Notes */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Additional Notes
        </h2>
        <div>
          <Label htmlFor="notes">Internal Notes</Label>
          <textarea
            id="notes"
            rows={4}
            placeholder="Any additional notes about this quote..."
            {...register('notes')}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/quotes/${quote.id}`)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Update Quote'}
        </Button>
      </div>
    </form>
  )
}
