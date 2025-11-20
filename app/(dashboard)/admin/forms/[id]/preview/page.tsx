import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getFormTemplate, getFormFields, getFormPricingRules } from '@/lib/services/form-builder.service'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DynamicFormRenderer } from '@/components/forms/dynamic-form-renderer'

export const metadata: Metadata = {
  title: 'Preview Form | Platform Admin | ConveyPro',
  description: 'Preview form template',
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function FormPreviewPage({ params }: PageProps) {
  const { id } = await params

  const { template, error: templateError } = await getFormTemplate(id)

  if (templateError || !template) {
    notFound()
  }

  const { fields, error: fieldsError } = await getFormFields(id)

  if (fieldsError) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card className="p-6">
          <p className="text-red-600">Error loading form fields: {fieldsError}</p>
        </Card>
      </div>
    )
  }

  const { rules, error: rulesError } = await getFormPricingRules(id)

  const handlePreviewSubmit = (data: any) => {
    console.log('Preview form submitted:', data)
    alert('This is a preview. Form data would be submitted here.')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/forms">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forms
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
          <p className="mt-2 text-gray-600">Form Preview</p>
        </div>
        <Link href={`/admin/forms/${id}/edit`}>
          <Button variant="outline">Edit Form</Button>
        </Link>
      </div>

      {/* Preview Notice */}
      <Card className="border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-medium text-blue-900">Preview Mode</p>
            <p className="mt-1 text-sm text-blue-700">
              This is how the form will appear to clients. Submissions in preview mode are not saved.
            </p>
          </div>
        </div>
      </Card>

      {/* Form Preview */}
      <Card className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
          {template.description && (
            <p className="mt-2 text-gray-600">{template.description}</p>
          )}
        </div>

        <DynamicFormRenderer
          fields={fields}
          onSubmit={handlePreviewSubmit}
          submitButtonText="Get Quote"
        />
      </Card>

      {/* Form Details */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Form Configuration</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Visibility</p>
            <p className="text-gray-600 capitalize">{template.visibility}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Status</p>
            <p className="text-gray-600 capitalize">{template.status}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Multi-Step</p>
            <p className="text-gray-600">{template.is_multi_step ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">LBTT Calculation</p>
            <p className="text-gray-600">{template.enable_lbtt_calculation ? 'Enabled' : 'Disabled'}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Fee Calculation</p>
            <p className="text-gray-600">{template.enable_fee_calculation ? 'Enabled' : 'Disabled'}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Total Fields</p>
            <p className="text-gray-600">{fields.length}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Pricing Rules</p>
            <p className="text-gray-600">{rules?.length || 0}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
