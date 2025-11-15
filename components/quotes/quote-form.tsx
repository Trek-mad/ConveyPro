'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createQuote } from '@/services/quote.service'
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

const quoteSchema = z.object({
  // Client information
  client_name: z.string().min(2, 'Client name is required'),
  client_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  client_phone: z.string().optional(),

  // Transaction details
  transaction_type: z.enum(['purchase', 'sale', 'remortgage', 'transfer_of_equity']),
  transaction_value: z.string().min(1, 'Transaction value is required'),

  // Financial details
  base_fee: z.string().min(1, 'Base fee is required'),
  disbursements: z.string().optional(),
  vat_rate: z.string().optional(),

  // Additional notes
  notes: z.string().optional(),
})

type QuoteFormData = z.infer<typeof quoteSchema>

interface QuoteFormProps {
  tenantId: string
}

export function QuoteForm({ tenantId }: QuoteFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      transaction_type: 'purchase',
      vat_rate: '20',
      disbursements: '0',
    },
  })

  // Watch values for auto-calculation
  const baseFee = watch('base_fee') || '0'
  const disbursements = watch('disbursements') || '0'
  const vatRate = watch('vat_rate') || '20'

  // Calculate totals
  const baseFeeNum = parseFloat(baseFee) || 0
  const disbursementsNum = parseFloat(disbursements) || 0
  const vatRateNum = parseFloat(vatRate) || 20

  const vatAmount = (baseFeeNum * vatRateNum) / 100
  const totalAmount = baseFeeNum + disbursementsNum + vatAmount

  const onSubmit = async (data: QuoteFormData, status: 'draft' | 'sent' = 'draft') => {
    setIsLoading(true)
    setError(null)

    // Build fee breakdown
    const feeBreakdown = {
      base_fee: parseFloat(data.base_fee),
      disbursements: parseFloat(data.disbursements || '0'),
      vat_rate: parseFloat(data.vat_rate || '20'),
      vat_amount: vatAmount,
      subtotal: baseFeeNum + disbursementsNum,
      total: totalAmount,
    }

    const result = await createQuote({
      tenant_id: tenantId,
      client_name: data.client_name,
      client_email: data.client_email || null,
      client_phone: data.client_phone || null,
      transaction_type: data.transaction_type,
      transaction_value: parseFloat(data.transaction_value),
      base_fee: parseFloat(data.base_fee),
      disbursements: parseFloat(data.disbursements || '0'),
      vat_amount: vatAmount,
      total_amount: totalAmount,
      fee_breakdown: feeBreakdown,
      notes: data.notes || null,
      status,
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
    <form className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Client Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Client Information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
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
            <Label htmlFor="client_email">Email Address</Label>
            <Input
              id="client_email"
              type="email"
              placeholder="john@example.com"
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
            <Label htmlFor="client_phone">Phone Number</Label>
            <Input
              id="client_phone"
              type="tel"
              placeholder="07700 900000"
              {...register('client_phone')}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Transaction Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Transaction Information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="transaction_type">
              Transaction Type <span className="text-red-500">*</span>
            </Label>
            <Select
              defaultValue="purchase"
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
              placeholder="1500"
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
              placeholder="300"
              {...register('disbursements')}
              className="mt-1"
            />
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

        {/* Calculation Summary */}
        <Card className="bg-gray-50 p-4">
          <h3 className="mb-3 font-semibold text-gray-900">Quote Summary</h3>
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
                £{disbursementsNum.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
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
                  £{totalAmount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Notes */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Additional Information
        </h2>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            rows={4}
            placeholder="Any additional notes or special conditions..."
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
          onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
          disabled={isLoading}
        >
          Save as Draft
        </Button>
        <Button
          type="button"
          onClick={handleSubmit((data) => onSubmit(data, 'sent'))}
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create & Send Quote'}
        </Button>
      </div>
    </form>
  )
}
