import { redirect } from 'next/navigation'
import { getActiveTenantMembership } from '@/lib/auth'
import { getCampaign, getTemplate } from '@/services/campaign.service'
import { TemplateForm } from '@/components/campaigns/template-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string; templateId: string }>
}

export default async function EditTemplatePage({ params }: PageProps) {
  const { id, templateId } = await params
  const membership = await getActiveTenantMembership()

  if (!membership) {
    redirect('/login')
  }

  // Only owners and admins can edit templates
  if (!['owner', 'admin'].includes(membership.role)) {
    redirect(`/campaigns/${id}`)
  }

  const campaignResult = await getCampaign(id)
  const templateResult = await getTemplate(templateId)

  if (campaignResult.error || !campaignResult.campaign) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Campaign not found
          </h2>
          <p className="mt-2 text-gray-600">{campaignResult.error}</p>
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

  if (templateResult.error || !templateResult.template) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Template not found
          </h2>
          <p className="mt-2 text-gray-600">{templateResult.error}</p>
          <Link
            href={`/campaigns/${id}`}
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaign
          </Link>
        </div>
      </div>
    )
  }

  const campaign = campaignResult.campaign
  const template = templateResult.template

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
          <h1 className="text-3xl font-bold text-gray-900">Edit Template</h1>
          <p className="mt-1 text-sm text-gray-500">
            {template.name} • Campaign: {campaign.name}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <TemplateForm
          campaignId={id}
          mode="edit"
          template={{
            id: template.id,
            name: template.name,
            description: template.description,
            subject_line: template.subject_line,
            preview_text: template.preview_text,
            body_html: template.body_html,
            body_text: template.body_text,
            sequence_order: template.sequence_order,
          }}
        />
      </div>
    </div>
  )
}
