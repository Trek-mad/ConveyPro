import { redirect } from 'next/navigation'
import { getActiveTenantMembership } from '@/lib/auth'
import { getCampaign } from '@/services/campaign.service'
import { TemplateForm } from '@/components/campaigns/template-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NewTemplatePage({ params }: PageProps) {
  const { id } = await params
  const membership = await getActiveTenantMembership()

  if (!membership) {
    redirect('/login')
  }

  // Only owners and admins can create templates
  if (!['owner', 'admin'].includes(membership.role)) {
    redirect(`/campaigns/${id}`)
  }

  const result = await getCampaign(id)

  if (result.error || !result.campaign) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Campaign not found
          </h2>
          <p className="mt-2 text-gray-600">{result.error}</p>
          <Link
            href="/campaigns"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  const campaign = result.campaign

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/campaigns/${id}`}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create Email Template
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            For campaign: {campaign.name}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <TemplateForm campaignId={id} mode="create" />
      </div>
    </div>
  )
}
