'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'

interface QuotesFiltersProps {
  currentStatus?: string
}

export function QuotesFilters({ currentStatus }: QuotesFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    router.push(`/quotes?${params.toString()}`)
  }

  const handleSearch = (search: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    router.push(`/quotes?${params.toString()}`)
  }

  const statuses = [
    { value: 'all', label: 'All Quotes' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      {/* Status filter */}
      <div className="flex gap-2">
        {statuses.map((status) => (
          <button
            key={status.value}
            onClick={() => handleStatusChange(status.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              (currentStatus || 'all') === status.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="w-full sm:w-64">
        <Label htmlFor="search" className="sr-only">
          Search quotes
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            id="search"
            type="search"
            placeholder="Search quotes..."
            defaultValue={searchParams.get('search') || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  )
}
