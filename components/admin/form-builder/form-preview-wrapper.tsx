'use client'

import { DynamicFormRenderer } from '@/components/forms/dynamic-form-renderer'
import { Card } from '@/components/ui/card'

interface FormPreviewWrapperProps {
  formName: string
  formDescription?: string | null
  fields: any[]
}

export function FormPreviewWrapper({
  formName,
  formDescription,
  fields,
}: FormPreviewWrapperProps) {
  const handlePreviewSubmit = (data: any) => {
    console.log('Preview form submitted:', data)
    alert('This is a preview. Form data would be submitted here.')
  }

  return (
    <Card className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{formName}</h2>
        {formDescription && (
          <p className="mt-2 text-gray-600">{formDescription}</p>
        )}
      </div>

      <DynamicFormRenderer
        fields={fields}
        onSubmit={handlePreviewSubmit}
        submitButtonText="Get Quote"
      />
    </Card>
  )
}
