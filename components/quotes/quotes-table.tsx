'use client'

import Link from 'next/link'
import { Quote } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuotesTableProps {
  quotes: Quote[]
}

export function QuotesTable({ quotes }: QuotesTableProps) {
  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getTransactionTypeLabel = (type: Quote['transaction_type']) => {
    switch (type) {
      case 'purchase':
        return 'Purchase'
      case 'sale':
        return 'Sale'
      case 'remortgage':
        return 'Remortgage'
      case 'transfer_of_equity':
        return 'Transfer of Equity'
      default:
        return type
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Quote #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Client
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Value
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Total
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Updated
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {quotes.map((quote) => (
            <tr key={quote.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                {quote.quote_number}
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                <div>
                  <p className="font-medium">{quote.client_name}</p>
                  {quote.client_email && (
                    <p className="text-gray-500">{quote.client_email}</p>
                  )}
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                {getTransactionTypeLabel(quote.transaction_type)}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                £{Number(quote.transaction_value).toLocaleString('en-GB')}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                £{Number(quote.total_amount).toLocaleString('en-GB')}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(quote.status)}`}
                >
                  {quote.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                {formatDistanceToNow(new Date(quote.updated_at), {
                  addSuffix: true,
                })}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                <Link href={`/quotes/${quote.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
