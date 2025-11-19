import { getFormSubmissionStats } from '@/services/form-submission.service'
import { Users, FileText, TrendingUp } from 'lucide-react'

interface FormSubmissionStatsProps {
  tenantId: string
}

export async function FormSubmissionStats({ tenantId }: FormSubmissionStatsProps) {
  const stats = await getFormSubmissionStats(tenantId)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-gray-900">Form Submission Stats</h2>
      <p className="mt-2 text-sm text-gray-600">
        Recent activity from form submissions (last 30 days)
      </p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {/* Total Submissions */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total_submissions}
              </p>
              <p className="text-sm text-gray-600">Total Submissions</p>
            </div>
          </div>
        </div>

        {/* Recent (30 days) */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-green-100 p-2">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.recent_submissions}
              </p>
              <p className="text-sm text-gray-600">This Month</p>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-purple-100 p-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.conversion_rate}%
              </p>
              <p className="text-sm text-gray-600">Conversion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {stats.total_submissions === 0 && (
        <div className="mt-6 rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-600">
            No form submissions yet. Use the test form above to try it out!
          </p>
        </div>
      )}
    </div>
  )
}
