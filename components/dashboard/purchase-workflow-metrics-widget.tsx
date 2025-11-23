/**
 * Purchase Workflow Metrics Widget
 * Displays key metrics for purchase conveyancing matters
 * Phase 12.8 - Reporting & Analytics
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getPurchaseExecutiveMetrics } from '@/services/analytics.service'
import type { PurchaseExecutiveMetrics } from '@/services/analytics.service'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  TrendingUp,
  Loader2,
  ArrowRight,
  PoundSterling,
  Clock,
  Target,
} from 'lucide-react'

interface PurchaseWorkflowMetricsWidgetProps {
  tenantId: string
}

export function PurchaseWorkflowMetricsWidget({
  tenantId,
}: PurchaseWorkflowMetricsWidgetProps) {
  const [metrics, setMetrics] = useState<PurchaseExecutiveMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [tenantId])

  async function loadMetrics() {
    setIsLoading(true)
    const result = await getPurchaseExecutiveMetrics(tenantId)

    if (result.success && result.data) {
      setMetrics(result.data)
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      </Card>
    )
  }

  if (!metrics) {
    return null
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-blue-100 p-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Purchase Workflow Metrics</h3>
            <p className="text-sm text-gray-500">Conveyancing performance overview</p>
          </div>
        </div>
        <Link href="/purchase-reports">
          <Button variant="ghost" size="sm">
            View Reports
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Active Matters</p>
              <p className="text-2xl font-bold">{metrics.active_matters}</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {metrics.total_matters} total • {metrics.completed_matters} completed
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <PoundSterling className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Pipeline Value</p>
              <p className="text-2xl font-bold">
                £{(metrics.total_pipeline_value / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Avg: £{Math.round(metrics.avg_matter_value).toLocaleString()}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-100 p-2">
              <Target className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">{Math.round(metrics.conversion_rate)}%</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Matter to completion</div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-2">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Avg Completion</p>
              <p className="text-2xl font-bold">{metrics.avg_time_to_completion} days</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Time to complete</div>
        </div>
      </div>

      {/* Top Stages */}
      {metrics.matters_by_stage.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Top Stages</p>
          </div>
          <div className="space-y-2">
            {metrics.matters_by_stage
              .slice(0, 3)
              .map((stage) => (
                <div key={stage.stage_key} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{stage.stage_name}</span>
                  <span className="font-medium">
                    {stage.count} ({Math.round(stage.percentage)}%)
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </Card>
  )
}
