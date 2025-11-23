import { Metadata } from 'next'
import Link from 'next/link'
import { getActiveTenantMembership } from '@/lib/auth'
import { NotificationPreferencesForm } from '@/components/settings/notification-preferences-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Notification Settings | ConveyPro',
  description: 'Manage your notification preferences',
}

export default async function NotificationSettingsPage() {
  const membership = await getActiveTenantMembership()

  if (!membership) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage how and when you receive notifications about tasks, deadlines, and matters
        </p>
      </div>

      <NotificationPreferencesForm />
    </div>
  )
}
