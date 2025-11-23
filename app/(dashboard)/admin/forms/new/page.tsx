import { Metadata } from 'next'
import { getActiveTenantMembership } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormTemplateEditor } from '@/components/admin/form-builder/form-template-editor'

export const metadata: Metadata = {
  title: 'New Form Template | Platform Admin | ConveyPro',
  description: 'Create a new form template',
}

export default async function NewFormTemplatePage() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  // TODO: Add platform admin check
  // For now, anyone can access (will add proper admin check later)

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
        <h1 className="text-3xl font-bold text-gray-900">
          Create Form Template
        </h1>
        <p className="mt-2 text-gray-600">
          Build a new form template for firms to use
        </p>
      </div>

      {/* Form Builder */}
      <FormTemplateEditor />
    </div>
  )
}
