import { Metadata } from 'next'
import { getActiveTenantMembership } from '@/lib/auth'
import { getFormTemplates } from '@/lib/services/form-builder.service'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Globe, Building2, CheckCircle, Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Form Catalog | ConveyPro',
  description: 'Browse and activate form templates',
}

export default async function FormCatalogPage() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  const { templates, error } = await getFormTemplates()

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <Card className="p-6">
          <p className="text-red-600">Error loading forms: {error}</p>
        </Card>
      </div>
    )
  }

  // Filter forms available to this tenant
  const globalForms = templates.filter(
    (t) => t.visibility === 'global' && t.status === 'published' && t.is_active
  )
  const firmSpecificForms = templates.filter(
    (t) =>
      t.visibility === 'firm_specific' &&
      t.allowed_tenant_ids.includes(membership.tenant_id) &&
      t.status === 'published' &&
      t.is_active
  )

  // TODO: Fetch form instances to see which forms are already activated
  const activatedForms: string[] = [] // Form template IDs that are activated

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Form Catalog</h1>
        <p className="mt-2 text-gray-600">
          Browse and activate quote forms for your firm
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Available Forms
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {globalForms.length + firmSpecificForms.length}
              </p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Platform Forms</p>
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
                Custom for You
              </p>
              <p className="mt-2 text-3xl font-bold text-purple-600">
                {firmSpecificForms.length}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Platform Forms */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900">Platform Forms</h2>
          <Badge variant="outline">Available to All Firms</Badge>
        </div>

        {globalForms.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">
              No platform forms available at the moment
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {globalForms.map((form) => {
              const isActivated = activatedForms.includes(form.id)

              return (
                <Card
                  key={form.id}
                  className="p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {form.name}
                      </h3>
                      {form.description && (
                        <p className="mt-2 text-sm text-gray-600">
                          {form.description}
                        </p>
                      )}
                    </div>
                    {isActivated && (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {form.is_multi_step && (
                      <Badge variant="outline" className="text-xs">
                        Multi-step
                      </Badge>
                    )}
                    {form.enable_lbtt_calculation && (
                      <Badge variant="outline" className="text-xs">
                        LBTT Calculator
                      </Badge>
                    )}
                    {form.enable_fee_calculation && (
                      <Badge variant="outline" className="text-xs">
                        Fee Calculator
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isActivated ? (
                      <>
                        <Button variant="outline" size="sm" className="flex-1">
                          Configure Pricing
                        </Button>
                        <Button variant="ghost" size="sm">
                          Deactivate
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" className="flex-1">
                          <Plus className="mr-2 h-4 w-4" />
                          Activate Form
                        </Button>
                        <Button variant="outline" size="sm">
                          Preview
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Firm-Specific Forms */}
      {firmSpecificForms.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-500" />
            <h2 className="text-xl font-bold text-gray-900">
              Custom Forms for Your Firm
            </h2>
            <Badge variant="outline" className="bg-purple-50">
              Created Specifically for You
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {firmSpecificForms.map((form) => {
              const isActivated = activatedForms.includes(form.id)

              return (
                <Card
                  key={form.id}
                  className="p-6 hover:shadow-md transition-shadow border-purple-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {form.name}
                      </h3>
                      {form.description && (
                        <p className="mt-2 text-sm text-gray-600">
                          {form.description}
                        </p>
                      )}
                    </div>
                    {isActivated && (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="text-xs bg-purple-50">
                      Custom
                    </Badge>
                    {form.is_multi_step && (
                      <Badge variant="outline" className="text-xs">
                        Multi-step
                      </Badge>
                    )}
                    {form.enable_lbtt_calculation && (
                      <Badge variant="outline" className="text-xs">
                        LBTT Calculator
                      </Badge>
                    )}
                    {form.enable_fee_calculation && (
                      <Badge variant="outline" className="text-xs">
                        Fee Calculator
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isActivated ? (
                      <>
                        <Button variant="outline" size="sm" className="flex-1">
                          Configure Pricing
                        </Button>
                        <Button variant="ghost" size="sm">
                          Deactivate
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" className="flex-1">
                          <Plus className="mr-2 h-4 w-4" />
                          Activate Form
                        </Button>
                        <Button variant="outline" size="sm">
                          Preview
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
