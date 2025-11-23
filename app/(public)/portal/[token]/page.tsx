/**
 * Client Portal - Matter View
 * Public route: /portal/[token]
 * Phase 12.7 - Client Portal
 */

import { Metadata } from 'next'
import { validatePortalToken } from '@/services/portal-token.service'
import { PortalMatterViewClient } from '@/components/portal/portal-matter-view-client'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface PortalPageProps {
  params: Promise<{
    token: string
  }>
}

export const metadata: Metadata = {
  title: 'Your Matter Details | Client Portal',
  description: 'View your conveyancing matter status and details',
}

export default async function PortalPage({ params }: PortalPageProps) {
  const { token } = await params

  // Validate token
  const validation = await validatePortalToken(token)

  if (!validation.isValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Invalid or Expired Link</h1>
          <p className="text-gray-600">
            {validation.error || 'This link is no longer valid. Please contact your solicitor for a new link.'}
          </p>
        </Card>
      </div>
    )
  }

  if (!validation.matter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-orange-500" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Matter Not Found</h1>
          <p className="text-gray-600">
            We couldn't find the matter associated with this link.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <PortalMatterViewClient
      token={token}
      matter={validation.matter}
      client={validation.client}
      tenant={validation.tenant}
    />
  )
}
