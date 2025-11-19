export async function EmailPerformanceTable({ campaignId, tenantId }: { campaignId: string; tenantId: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Email Template Performance</h3>
      <p className="mt-2 text-sm text-gray-600">Per-template metrics coming soon</p>
    </div>
  )
}
