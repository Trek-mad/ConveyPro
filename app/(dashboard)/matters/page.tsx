import { Metadata } from 'next'
import Link from 'next/link'
import { getActiveTenantMembership } from '@/lib/auth'
import { listMatters } from '@/services/matter.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { MattersTable } from '@/components/matters/matters-table'
import { MattersFilters } from '@/components/matters/matters-filters'

export const metadata: Metadata = {
  title: 'Matters | ConveyPro',
  description: 'Manage your purchase workflow matters',
}

interface PageProps {
  searchParams: Promise<{
    status?: string
    stage?: string
    priority?: string
    search?: string
  }>
}

export default async function MattersPage({ searchParams }: PageProps) {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams

  // Fetch all matters
  const mattersResult = await listMatters(membership.tenant_id)
  let matters = 'matters' in mattersResult ? mattersResult.matters : []

  // Apply filters
  if (params.status && params.status !== 'all') {
    matters = matters.filter((m) => m.status === params.status)
  }

  if (params.stage && params.stage !== 'all') {
    matters = matters.filter((m) => m.current_stage === params.stage)
  }

  if (params.priority && params.priority !== 'all') {
    matters = matters.filter((m) => m.priority === params.priority)
  }

  if (params.search) {
    const search = params.search.toLowerCase()
    matters = matters.filter(
      (m) =>
        m.matter_number.toLowerCase().includes(search) ||
        m.notes?.toLowerCase().includes(search)
    )
  }

  // Calculate stats
  const stats = {
    total: matters.length,
    new: matters.filter((m) => m.status === 'new').length,
    active: matters.filter((m) => m.status === 'active').length,
    completed: matters.filter((m) => m.status === 'completed').length,
    onHold: matters.filter((m) => m.status === 'on_hold').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Matters</h1>
          <p className="mt-2 text-gray-600">
            Manage your purchase workflow matters and track progress
          </p>
        </div>
        <Link href="/matters/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Matter
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Total</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">New</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{stats.new}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Active</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {stats.active}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Completed</p>
          <p className="mt-1 text-2xl font-bold text-purple-600">
            {stats.completed}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">On Hold</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">
            {stats.onHold}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <MattersFilters />

      {/* Table */}
      <MattersTable matters={matters} />
    </div>
  )
}
