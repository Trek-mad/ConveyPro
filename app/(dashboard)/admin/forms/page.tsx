import { Metadata } from 'next'
import { getActiveTenantMembership } from '@/lib/auth'
import { getFormTemplates } from '@/lib/services/form-builder.service'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, FileText, Globe, Building2, Archive } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Form Templates | Platform Admin | ConveyPro',
  description: 'Manage form templates for the platform',
}

export default async function AdminFormsPage() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  // TODO: Add platform admin check
  // For now, anyone can access (will add proper admin check later)

  const { templates, error } = await getFormTemplates()

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <Card className="p-6">
          <p className="text-red-600">Error loading form templates: {error}</p>
        </Card>
      </div>
    )
  }

  const globalForms = templates.filter((t) => t.visibility === 'global')
  const firmSpecificForms = templates.filter(
    (t) => t.visibility === 'firm_specific'
  )

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Form Templates</h1>
          <p className="mt-2 text-gray-600">
            Create and manage form templates for firms
          </p>
        </div>
        <Link href="/admin/forms/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Form Template
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Forms</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {templates.length}
              </p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Global Forms</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {globalForms.length}
              </p>
            </div>
            <Globe className="h-8 w-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Firm-Specific
              </p>
              <p className="mt-2 text-3xl font-bold text-purple-600">
                {firmSpecificForms.length}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-purple-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {templates.filter((t) => t.status === 'published').length}
              </p>
            </div>
            <Archive className="h-8 w-8 text-green-400" />
          </div>
        </Card>
      </div>

      {/* Global Forms */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900">
            Platform Forms (Available to All Firms)
          </h2>
        </div>

        {globalForms.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No global forms yet</p>
            <Link href="/admin/forms/new">
              <Button className="mt-4" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Global Form
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            {globalForms.map((form) => (
              <Card key={form.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {form.name}
                      </h3>
                      <Badge
                        variant={
                          form.status === 'published'
                            ? 'default'
                            : form.status === 'draft'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {form.status}
                      </Badge>
                      {form.is_active && (
                        <Badge variant="outline" className="bg-green-50">
                          Active
                        </Badge>
                      )}
                    </div>
                    {form.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {form.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span>Slug: {form.slug}</span>
                      {form.is_multi_step && <span>Multi-step</span>}
                      {form.enable_lbtt_calculation && <span>LBTT Calc</span>}
                      {form.enable_fee_calculation && <span>Fee Calc</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/forms/${form.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/admin/forms/${form.id}/preview`}>
                      <Button variant="ghost" size="sm">
                        Preview
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Firm-Specific Forms */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900">
            Firm-Specific Forms (Custom Forms)
          </h2>
        </div>

        {firmSpecificForms.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No firm-specific forms yet</p>
            <p className="mt-2 text-sm text-gray-400">
              Create custom forms for specific firms with unique requirements
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {firmSpecificForms.map((form) => (
              <Card key={form.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {form.name}
                      </h3>
                      <Badge variant="outline" className="bg-purple-50">
                        Firm-Specific
                      </Badge>
                      <Badge
                        variant={
                          form.status === 'published'
                            ? 'default'
                            : form.status === 'draft'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {form.status}
                      </Badge>
                    </div>
                    {form.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {form.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Assigned to:{' '}
                        {form.allowed_tenant_ids.length === 0
                          ? 'No firms'
                          : `${form.allowed_tenant_ids.length} firm(s)`}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/forms/${form.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/admin/forms/${form.id}/assign`}>
                      <Button variant="ghost" size="sm">
                        Assign Firms
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
