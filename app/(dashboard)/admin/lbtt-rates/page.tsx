import { Metadata } from 'next'
import { getActiveTenantMembership } from '@/lib/auth'
import { getLBTTRates } from '@/lib/services/form-builder.service'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, TrendingUp, Calendar, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'LBTT Rate Management | Platform Admin | ConveyPro',
  description: 'Manage LBTT tax rates for the platform',
}

export default async function LBTTRatesPage() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  // TODO: Add platform admin check
  const { rates, error } = await getLBTTRates()

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <Card className="p-6">
          <p className="text-red-600">Error loading LBTT rates: {error}</p>
        </Card>
      </div>
    )
  }

  const residentialRates = rates.filter((r) => r.property_type === 'residential')
  const nonResidentialRates = rates.filter(
    (r) => r.property_type === 'non_residential'
  )

  const activeResidential = residentialRates.find(
    (r) => r.is_active && r.is_platform_default
  )
  const activeNonResidential = nonResidentialRates.find(
    (r) => r.is_active && r.is_platform_default
  )

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">LBTT Rate Management</h1>
          <p className="mt-2 text-gray-600">
            Manage Land and Buildings Transaction Tax rates for Scotland
          </p>
        </div>
        <Link href="/admin/lbtt-rates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Rate Set
          </Button>
        </Link>
      </div>

      {/* Current Active Rates Summary */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Active Residential Rates
            </h3>
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          {activeResidential ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Rate Set</p>
                <p className="text-lg font-semibold">
                  {activeResidential.rate_set_name}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Effective from:</span>{' '}
                  <span className="font-medium">
                    {new Date(activeResidential.effective_from).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600 mb-2">ADS Rate:</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(activeResidential.ads_rate * 100).toFixed(1)}%
                </p>
              </div>
              {activeResidential.ftb_relief_enabled && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-1">
                    First-Time Buyer Relief
                  </p>
                  <p className="font-medium">
                    Up to £
                    {activeResidential.ftb_relief_threshold.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No active residential rate set</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Active Non-Residential Rates
            </h3>
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          {activeNonResidential ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Rate Set</p>
                <p className="text-lg font-semibold">
                  {activeNonResidential.rate_set_name}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Effective from:</span>{' '}
                  <span className="font-medium">
                    {new Date(
                      activeNonResidential.effective_from
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No active non-residential rate set</p>
          )}
        </Card>
      </div>

      {/* Residential Rates History */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900">
            Residential LBTT Rates
          </h2>
        </div>

        {residentialRates.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No residential rate sets configured</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {residentialRates.map((rate) => {
              const bands = rate.rate_bands as Array<{
                min: number
                max: number | null
                rate: number
                label: string
              }>

              return (
                <Card key={rate.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {rate.rate_set_name}
                        </h3>
                        {rate.is_platform_default && (
                          <Badge className="bg-green-500">Platform Default</Badge>
                        )}
                        {rate.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            From:{' '}
                            {new Date(rate.effective_from).toLocaleDateString()}
                          </span>
                        </div>
                        {rate.effective_until && (
                          <span>
                            Until:{' '}
                            {new Date(rate.effective_until).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {rate.source_reference && (
                        <p className="mt-2 text-sm text-gray-500">
                          Source: {rate.source_reference}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Tax Bands
                      </h4>
                      <div className="space-y-2">
                        {bands.map((band, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                          >
                            <span className="text-gray-700">{band.label}</span>
                            <span className="font-semibold text-gray-900">
                              {(band.rate * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Additional Dwelling Supplement (ADS)
                        </h4>
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-2xl font-bold text-blue-600">
                            {(rate.ads_rate * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Applied to second homes and buy-to-let
                          </p>
                        </div>
                      </div>

                      {rate.ftb_relief_enabled && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            First-Time Buyer Relief
                          </h4>
                          <div className="bg-green-50 p-3 rounded">
                            <p className="font-semibold text-green-700">
                              No LBTT up to £
                              {rate.ftb_relief_threshold.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Extended nil-rate band for first-time buyers
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {rate.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">{rate.notes}</p>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Non-Residential Rates History */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900">
            Non-Residential LBTT Rates
          </h2>
        </div>

        {nonResidentialRates.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">
              No non-residential rate sets configured
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {nonResidentialRates.map((rate) => {
              const bands = rate.rate_bands as Array<{
                min: number
                max: number | null
                rate: number
                label: string
              }>

              return (
                <Card key={rate.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {rate.rate_set_name}
                        </h3>
                        {rate.is_platform_default && (
                          <Badge className="bg-green-500">Platform Default</Badge>
                        )}
                        {rate.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            From:{' '}
                            {new Date(rate.effective_from).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Tax Bands
                    </h4>
                    <div className="space-y-2">
                      {bands.map((band, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                        >
                          <span className="text-gray-700">{band.label}</span>
                          <span className="font-semibold text-gray-900">
                            {(band.rate * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
