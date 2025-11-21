import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getActiveTenantMembership } from '@/lib/auth'
import { getMatterWithRelations } from '@/services/matter.service'
import { getTasksForMatter } from '@/services/task.service'
import { getDocumentsForMatter } from '@/services/document.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, DollarSign, User, MapPin } from 'lucide-react'
import { WorkflowStages } from '@/components/matters/workflow-stages'
import { TaskChecklist } from '@/components/matters/task-checklist'
import { ActivityTimeline } from '@/components/matters/activity-timeline'
import { MatterStageTransition } from '@/components/matters/matter-stage-transition'
import { DocumentLibrary } from '@/components/documents/document-library'
import { formatDistanceToNow } from 'date-fns'

export const metadata: Metadata = {
  title: 'Matter Details | ConveyPro',
  description: 'View and manage matter details',
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MatterDetailPage({ params }: PageProps) {
  const membership = await getActiveTenantMembership()
  const { id } = await params

  if (!membership) {
    return null
  }

  // Fetch matter with relations
  const matterResult = await getMatterWithRelations(id)

  if ('error' in matterResult) {
    notFound()
  }

  const matter = matterResult.matter

  // Fetch tasks
  const tasksResult = await getTasksForMatter(id)
  const tasks = 'tasks' in tasksResult ? tasksResult.tasks : []

  // Fetch documents
  const documentsResult = await getDocumentsForMatter(id)
  const documents = 'documents' in documentsResult ? documentsResult.documents : []

  // Get activities (empty for now - will be populated by database triggers)
  const activities = matter.activities || []

  // Check if user can manage documents (owner, admin, manager, member)
  const canManageDocuments = ['owner', 'admin', 'manager', 'member'].includes(
    membership.role
  )

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-purple-100 text-purple-800',
      active: 'bg-blue-100 text-blue-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-600',
      normal: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600',
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/matters">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Matters
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {matter.matter_number}
              </h1>
              <Badge className={getStatusColor(matter.status)}>
                {matter.status.replace('_', ' ')}
              </Badge>
              <Badge className={getPriorityColor(matter.priority)}>
                {matter.priority}
              </Badge>
            </div>
            <p className="mt-2 text-gray-600 capitalize">
              {matter.matter_type.replace('_', ' ')} Transaction
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Edit Matter</Button>
            <Button>Add Document</Button>
          </div>
        </div>
      </div>

      {/* Key Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Purchase Price</p>
              <p className="text-lg font-semibold text-gray-900">
                {matter.purchase_price
                  ? `£${Number(matter.purchase_price).toLocaleString('en-GB')}`
                  : 'Not set'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Target Completion</p>
              <p className="text-lg font-semibold text-gray-900">
                {matter.target_completion_date
                  ? new Date(matter.target_completion_date).toLocaleDateString()
                  : 'Not set'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-2">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Fee Earner</p>
              <p className="text-lg font-semibold text-gray-900">
                {matter.assigned_fee_earner?.full_name || 'Unassigned'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-100 p-2">
              <MapPin className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Property</p>
              <p className="text-sm font-medium text-gray-900">
                {matter.property?.address_line1 || 'Not linked'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Workflow & Tasks */}
        <div className="space-y-6 lg:col-span-2">
          {/* Workflow Stages */}
          <MatterStageTransition matterId={matter.id} currentStage={matter.current_stage}>
            <WorkflowStages
              currentStage={matter.current_stage}
              matterId={matter.id}
            />
          </MatterStageTransition>

          {/* Task Checklist */}
          <TaskChecklist
            tasks={tasks}
            currentStage={matter.current_stage}
          />

          {/* Document Library */}
          <DocumentLibrary
            documents={documents}
            matterId={matter.id}
            tenantId={matter.tenant_id}
            canManage={canManageDocuments}
          />
        </div>

        {/* Right Column - Details & Activity */}
        <div className="space-y-6">
          {/* Matter Details */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Matter Details
            </h3>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-gray-600">Created</dt>
                <dd className="mt-1 text-gray-900">
                  {formatDistanceToNow(new Date(matter.created_at), {
                    addSuffix: true,
                  })}
                </dd>
              </div>

              <div>
                <dt className="font-medium text-gray-600">Last Updated</dt>
                <dd className="mt-1 text-gray-900">
                  {formatDistanceToNow(new Date(matter.updated_at), {
                    addSuffix: true,
                  })}
                </dd>
              </div>

              {matter.instruction_date && (
                <div>
                  <dt className="font-medium text-gray-600">
                    Instruction Date
                  </dt>
                  <dd className="mt-1 text-gray-900">
                    {new Date(matter.instruction_date).toLocaleDateString()}
                  </dd>
                </div>
              )}

              {matter.mortgage_amount && (
                <div>
                  <dt className="font-medium text-gray-600">
                    Mortgage Amount
                  </dt>
                  <dd className="mt-1 text-gray-900">
                    £{Number(matter.mortgage_amount).toLocaleString('en-GB')}
                  </dd>
                </div>
              )}

              {matter.deposit_amount && (
                <div>
                  <dt className="font-medium text-gray-600">Deposit</dt>
                  <dd className="mt-1 text-gray-900">
                    £{Number(matter.deposit_amount).toLocaleString('en-GB')}
                  </dd>
                </div>
              )}

              <div>
                <dt className="font-medium text-gray-600">First Time Buyer</dt>
                <dd className="mt-1 text-gray-900">
                  {matter.first_time_buyer ? 'Yes' : 'No'}
                </dd>
              </div>

              <div>
                <dt className="font-medium text-gray-600">ADS Applicable</dt>
                <dd className="mt-1 text-gray-900">
                  {matter.ads_applicable ? 'Yes' : 'No'}
                </dd>
              </div>

              {matter.notes && (
                <div>
                  <dt className="font-medium text-gray-600">Notes</dt>
                  <dd className="mt-1 text-gray-900">{matter.notes}</dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Activity Timeline */}
          <ActivityTimeline activities={activities} />
        </div>
      </div>
    </div>
  )
}
