import { Suspense } from 'react'
import { Metadata } from 'next'
import SearchClient from '@/components/search/search-client'
import { getActiveTenantMembership } from '@/services/membership.service'

export const metadata: Metadata = {
  title: 'Search | ConveyPro',
  description: 'Search across matters, clients, tasks, and documents'
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const membership = await getActiveTenantMembership()

  const query = typeof params.q === 'string' ? params.q : ''

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <SearchClient initialQuery={query} tenantId={membership.tenant_id} userId={membership.user_id} />
      </Suspense>
    </div>
  )
}
