'use client'

import Link from 'next/link'
import { Matter } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Eye, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MattersTableProps {
  matters: Matter[]
}

export function MattersTable({ matters }: MattersTableProps) {
  const getStatusColor = (status: Matter['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'new':
        return 'bg-purple-100 text-purple-800'
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: Matter['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStageLabel = (stage: string) => {
    const stageMap: Record<string, string> = {
      client_entry: 'Client Entry',
      quote_check: 'Quote Check',
      client_details: 'Client Details',
      financial_questionnaire: 'Financial Questionnaire',
      financial_checks: 'Financial Checks',
      home_report: 'Home Report',
      establish_parameters: 'Establish Parameters',
      offer_creation: 'Offer Creation',
      offer_approval: 'Offer Approval',
      client_acceptance: 'Client Acceptance',
      offer_outcome: 'Offer Outcome',
      conveyancing_allocation: 'Conveyancing Allocation',
    }
    return stageMap[stage] || stage
  }

  if (matters.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No matters found
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Get started by creating a new matter
        </p>
        <Link href="/matters/new">
          <Button className="mt-4">Create Matter</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Matter #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Current Stage
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Priority
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Purchase Price
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
          {matters.map((matter) => (
            <tr key={matter.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                {matter.matter_number}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm capitalize text-gray-900">
                {matter.matter_type.replace('_', ' ')}
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  {getStageLabel(matter.current_stage)}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getPriorityColor(matter.priority)}`}
                >
                  {matter.priority}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getStatusColor(matter.status)}`}
                >
                  {matter.status.replace('_', ' ')}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                {matter.purchase_price
                  ? `£${Number(matter.purchase_price).toLocaleString('en-GB')}`
                  : '-'}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                {formatDistanceToNow(new Date(matter.updated_at), {
                  addSuffix: true,
                })}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                <Link href={`/matters/${matter.id}`}>
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
