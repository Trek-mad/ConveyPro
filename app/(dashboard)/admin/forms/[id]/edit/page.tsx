import { Metadata } from 'next'
import { getActiveTenantMembership } from '@/lib/auth'
import { getCompleteFormTemplate } from '@/lib/services/form-builder.service'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormTemplateEditor } from '@/components/admin/form-builder/form-template-editor'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Edit Form Template | Platform Admin | ConveyPro',
  description: 'Edit form template',
}

interface EditFormTemplatePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditFormTemplatePage({
  params,
}: EditFormTemplatePageProps) {
  const { id } = await params
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  // TODO: Add platform admin check
  // For now, anyone can access (will add proper admin check later)

  // Fetch the form template data
  const { data, error } = await getCompleteFormTemplate(id)

  if (error || !data) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/forms">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Form Templates
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Form Template</h1>
        <p className="mt-2 text-gray-600">
          Update the form template and save your changes
        </p>
      </div>

      {/* Form Builder */}
      <FormTemplateEditor
        formId={id}
        initialData={data}
      />
    </div>
  )
}
