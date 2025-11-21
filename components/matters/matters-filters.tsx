'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

export function MattersFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/matters?${params.toString()}`)
  }

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    router.push(`/matters?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by matter number or notes..."
          className="pl-9"
          defaultValue={searchParams.get('search') || ''}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Status Filter */}
      <Select
        defaultValue={searchParams.get('status') || 'all'}
        onValueChange={(value) => handleFilterChange('status', value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="on_hold">On Hold</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {/* Stage Filter */}
      <Select
        defaultValue={searchParams.get('stage') || 'all'}
        onValueChange={(value) => handleFilterChange('stage', value)}
      >
        <SelectTrigger className="w-full sm:w-[220px]">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          <SelectItem value="client_entry">Client Entry</SelectItem>
          <SelectItem value="quote_check">Quote Check</SelectItem>
          <SelectItem value="client_details">Client Details</SelectItem>
          <SelectItem value="financial_questionnaire">
            Financial Questionnaire
          </SelectItem>
          <SelectItem value="financial_checks">Financial Checks</SelectItem>
          <SelectItem value="home_report">Home Report</SelectItem>
          <SelectItem value="establish_parameters">
            Establish Parameters
          </SelectItem>
          <SelectItem value="offer_creation">Offer Creation</SelectItem>
          <SelectItem value="offer_approval">Offer Approval</SelectItem>
          <SelectItem value="client_acceptance">Client Acceptance</SelectItem>
          <SelectItem value="offer_outcome">Offer Outcome</SelectItem>
          <SelectItem value="conveyancing_allocation">
            Conveyancing Allocation
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select
        defaultValue={searchParams.get('priority') || 'all'}
        onValueChange={(value) => handleFilterChange('priority', value)}
      >
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="normal">Normal</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
