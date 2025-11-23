/**
 * Purchase Workflow Reports Client Component
 * Phase 12.8 - Reporting & Analytics
 */

'use client'

import { useState } from 'react'
import type {
  PurchaseMattersByStageReport,
  PurchaseConversionRateReport,
  PurchaseFeeEarnerPerformanceReport,
  PurchaseExecutiveMetrics,
} from '@/services/analytics.service'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  TrendingUp,
  Users,
  Gauge,
  Download,
  Calendar,
  PoundSterling,
  Clock,
  Target,
} from 'lucide-react'
import { exportToCSV } from '@/services/analytics.service'

interface PurchaseReportsClientProps {
  mattersByStage: PurchaseMattersByStageReport[]
  conversionRates: PurchaseConversionRateReport[]
  feeEarnerPerformance: PurchaseFeeEarnerPerformanceReport[]
  executiveMetrics?: PurchaseExecutiveMetrics
  tenantId: string
}

export function PurchaseReportsClient({
  mattersByStage,
  conversionRates,
  feeEarnerPerformance,
  executiveMetrics,
}: PurchaseReportsClientProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const handleExportCSV = (data: any[], filename: string) => {
    const csv = exportToCSV(data, filename)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const maxStageCount = Math.max(...mattersByStage.map((s) => s.count), 1)

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">
          <Gauge className="mr-2 h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="funnel">
          <BarChart3 className="mr-2 h-4 w-4" />
          Pipeline Funnel
        </TabsTrigger>
        <TabsTrigger value="conversion">
          <TrendingUp className="mr-2 h-4 w-4" />
          Conversion Rates
        </TabsTrigger>
        <TabsTrigger value="performance">
          <Users className="mr-2 h-4 w-4" />
          Fee Earner Performance
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6">
        {executiveMetrics && (
          <>
            {/* Key Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Matters</p>
                    <h3 className="mt-2 text-3xl font-bold">{executiveMetrics.total_matters}</h3>
                  </div>
                  <div className="rounded-full bg-blue-100 p-3">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">
                    {executiveMetrics.active_matters} active
                  </span>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {executiveMetrics.completed_matters} completed
                  </span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
                    <h3 className="mt-2 text-3xl font-bold">
                      £{(executiveMetrics.total_pipeline_value / 1000000).toFixed(1)}M
                    </h3>
                  </div>
                  <div className="rounded-full bg-green-100 p-3">
                    <PoundSterling className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Avg: £{Math.round(executiveMetrics.avg_matter_value).toLocaleString()}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                    <h3 className="mt-2 text-3xl font-bold">
                      {Math.round(executiveMetrics.conversion_rate)}%
                    </h3>
                  </div>
                  <div className="rounded-full bg-orange-100 p-3">
                    <Target className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Matter to completion</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Completion</p>
                    <h3 className="mt-2 text-3xl font-bold">
                      {executiveMetrics.avg_time_to_completion} days
                    </h3>
                  </div>
                  <div className="rounded-full bg-purple-100 p-3">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Time to complete</p>
              </Card>
            </div>

            {/* Monthly Trend */}
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">6-Month Trend</h3>
                  <p className="text-sm text-muted-foreground">
                    Matters started and completed over time
                  </p>
                </div>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="space-y-4">
                {executiveMetrics.monthly_trend.map((month, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-medium text-muted-foreground">
                      {month.month} '{month.year.toString().slice(2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="mb-1 text-xs text-muted-foreground">Started: {month.matters_started}</div>
                          <div className="h-8 rounded bg-blue-100 relative overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-blue-500"
                              style={{
                                width: `${Math.min((month.matters_started / Math.max(...executiveMetrics.monthly_trend.map(m => m.matters_started), 1)) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 text-xs text-muted-foreground">Completed: {month.matters_completed}</div>
                          <div className="h-8 rounded bg-green-100 relative overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-green-500"
                              style={{
                                width: `${Math.min((month.matters_completed / Math.max(...executiveMetrics.monthly_trend.map(m => m.matters_completed), 1)) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-24 text-right text-sm font-medium">
                      £{(month.total_value / 1000).toFixed(0)}k
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </TabsContent>

      {/* Pipeline Funnel Tab */}
      <TabsContent value="funnel" className="space-y-6">
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Matters by Stage</h3>
              <p className="text-sm text-muted-foreground">
                Current distribution across workflow stages
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCSV(mattersByStage, 'matters-by-stage')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="space-y-3">
            {mattersByStage.map((stage) => (
              <div key={stage.stage_key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.stage_name}</span>
                  <span className="text-muted-foreground">
                    {stage.count} ({Math.round(stage.percentage)}%)
                  </span>
                </div>
                <div className="relative h-10 overflow-hidden rounded-lg bg-gray-100">
                  <div
                    className="absolute inset-y-0 left-0 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 px-4 text-sm font-medium text-white"
                    style={{
                      width: `${Math.max((stage.count / maxStageCount) * 100, 8)}%`,
                    }}
                  >
                    {stage.count > 0 && stage.count}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {mattersByStage.length === 0 && (
            <div className="py-12 text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                No matters found. Create your first matter to see analytics.
              </p>
            </div>
          )}
        </Card>
      </TabsContent>

      {/* Conversion Rates Tab */}
      <TabsContent value="conversion" className="space-y-6">
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Conversion Rates</h3>
              <p className="text-sm text-muted-foreground">
                Conversion metrics across the purchase workflow
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCSV(conversionRates, 'conversion-rates')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="space-y-6">
            {conversionRates.map((rate, index) => (
              <div key={index}>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium">{rate.metric}</h4>
                  <span className="text-sm text-muted-foreground">
                    {rate.count} / {rate.total}
                  </span>
                </div>
                <div className="relative h-12 overflow-hidden rounded-lg bg-gray-100">
                  <div
                    className={`absolute inset-y-0 left-0 flex items-center justify-center px-4 text-sm font-semibold text-white ${
                      rate.percentage >= 75
                        ? 'bg-green-500'
                        : rate.percentage >= 50
                        ? 'bg-blue-500'
                        : rate.percentage >= 25
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.max(rate.percentage, 5)}%`,
                    }}
                  >
                    {Math.round(rate.percentage)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </TabsContent>

      {/* Fee Earner Performance Tab */}
      <TabsContent value="performance" className="space-y-6">
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Fee Earner Performance</h3>
              <p className="text-sm text-muted-foreground">
                Individual performance metrics and workload
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCSV(feeEarnerPerformance, 'fee-earner-performance')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Fee Earner
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                    Active
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                    Completed
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                    Total Value
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                    Avg Days
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                    Task Rate
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                    Doc Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {feeEarnerPerformance.map((feeEarner) => (
                  <tr key={feeEarner.fee_earner_id} className="border-b last:border-0">
                    <td className="py-4 font-medium">{feeEarner.fee_earner_name}</td>
                    <td className="py-4 text-right">{feeEarner.active_matters}</td>
                    <td className="py-4 text-right">{feeEarner.completed_matters}</td>
                    <td className="py-4 text-right">
                      £{Math.round(feeEarner.total_value).toLocaleString()}
                    </td>
                    <td className="py-4 text-right">{feeEarner.avg_completion_days}</td>
                    <td className="py-4 text-right">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          feeEarner.task_completion_rate >= 80
                            ? 'bg-green-100 text-green-700'
                            : feeEarner.task_completion_rate >= 60
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {Math.round(feeEarner.task_completion_rate)}%
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          feeEarner.document_verification_rate >= 80
                            ? 'bg-green-100 text-green-700'
                            : feeEarner.document_verification_rate >= 60
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {Math.round(feeEarner.document_verification_rate)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {feeEarnerPerformance.length === 0 && (
              <div className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No fee earner data available yet
                </p>
              </div>
            )}
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
