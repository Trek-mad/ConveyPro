import { redirect } from 'next/navigation'
import { getActiveTenantMembership } from '@/lib/auth'
import { CampaignForm } from '@/components/campaigns/campaign-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewCampaignPage() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    redirect('/login')
  }

  // Only owners and admins can create campaigns
  if (!['owner', 'admin'].includes(membership.role)) {
    redirect('/campaigns')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/campaigns"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Campaign
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Set up a new email marketing campaign to engage your clients
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <CampaignForm mode="create" />
      </div>
    </div>
  )
}
