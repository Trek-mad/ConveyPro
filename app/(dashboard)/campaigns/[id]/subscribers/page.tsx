import { redirect } from 'next/navigation'
import { getActiveTenantMembership } from '@/lib/auth'
import { getCampaign, getCampaignSubscribers } from '@/services/campaign.service'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Mail, Calendar, X } from 'lucide-react'
import { ManualEnrollmentForm } from '@/components/campaigns/manual-enrollment-form'
import { SubscribersList } from '@/components/campaigns/subscribers-list'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CampaignSubscribersPage({ params }: PageProps) {
  const { id } = await params
  const membership = await getActiveTenantMembership()

  if (!membership) {
    redirect('/login')
  }

  const result = await getCampaign(id)

  if (result.error || !result.campaign) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Campaign not found</h2>
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

  // Get all subscribers (active, paused, completed, unsubscribed)
  const subscribersResult = await getCampaignSubscribers(id)
  const subscribers = subscribersResult.subscribers || []

  // Get all clients from this tenant for enrollment
  const supabase = await createClient()
  const { data: allClients } = await supabase
    .from('clients')
    .select('id, first_name, last_name, email, life_stage')
    .eq('tenant_id', membership.tenant_id)
    .order('first_name', { ascending: true })

  const availableClients = allClients || []

  // Filter out clients already enrolled
  const enrolledClientIds = new Set(subscribers.map(s => s.client_id))
  const clientsToEnroll = availableClients.filter(
    client => !enrolledClientIds.has(client.id)
  )

  const canEdit = ['owner', 'admin'].includes(membership.role)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/campaigns/${id}`}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Campaign Subscribers
            </h1>
            <p className="mt-1 text-sm text-gray-500">{campaign.name}</p>
          </div>
        </div>
      </div>

      {/* Manual Enrollment Form */}
      {canEdit && clientsToEnroll.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Enroll Clients Manually
            </h2>
          </div>
          <ManualEnrollmentForm
            campaignId={id}
            availableClients={clientsToEnroll}
            targetLifeStages={campaign.target_life_stages || []}
          />
        </div>
      )}

      {/* Subscribers List */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Enrolled Subscribers ({subscribers.length})
          </h2>
        </div>

        {subscribers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">
              No subscribers yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Enroll clients manually above or they'll be auto-enrolled when quotes are accepted.
            </p>
          </div>
        ) : (
          <SubscribersList subscribers={subscribers} canEdit={canEdit} />
        )}
      </div>
    </div>
  )
}
