/**
 * Purchase Workflow Reports Page
 * Phase 12.8 - Reporting & Analytics
 */

import { Metadata } from 'next'
import { getActiveTenantMembership } from '@/lib/auth'
import {
  getPurchaseMattersByStageReport,
  getPurchaseConversionRateReport,
  getPurchaseFeeEarnerPerformanceReport,
  getPurchaseExecutiveMetrics,
} from '@/services/analytics.service'
import { PurchaseReportsClient } from '@/components/purchase-reports/purchase-reports-client'

export const metadata: Metadata = {
  title: 'Purchase Workflow Reports | ConveyPro',
  description: 'Analytics and reports for purchase conveyancing matters',
}

export default async function PurchaseReportsPage() {
  const membership = await getActiveTenantMembership()

  // Fetch all reports data
  const [mattersByStageResult, conversionRateResult, feeEarnerPerformanceResult, executiveMetricsResult] =
    await Promise.all([
      getPurchaseMattersByStageReport(membership.tenant_id),
      getPurchaseConversionRateReport(membership.tenant_id),
      getPurchaseFeeEarnerPerformanceReport(membership.tenant_id),
      getPurchaseExecutiveMetrics(membership.tenant_id),
    ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Workflow Reports</h1>
          <p className="text-muted-foreground">Analytics and performance metrics for conveyancing matters</p>
        </div>
      </div>

      <PurchaseReportsClient
        mattersByStage={mattersByStageResult.data || []}
        conversionRates={conversionRateResult.data || []}
        feeEarnerPerformance={feeEarnerPerformanceResult.data || []}
        executiveMetrics={executiveMetricsResult.data}
        tenantId={membership.tenant_id}
      />
    </div>
  )
}
