import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser, getCurrentProfile } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { ProfileForm } from '@/components/settings/profile-form'

export const metadata: Metadata = {
  title: 'Profile Settings | ConveyPro',
  description: 'Manage your profile and account settings',
}

export default async function ProfileSettingsPage() {
  const user = await getCurrentUser()
  const profile = await getCurrentProfile()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Profile Information
        </h2>
        <ProfileForm user={user} profile={profile} />
      </Card>

      {/* Account Information */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Account Information
        </h2>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-medium text-gray-600">User ID</dt>
            <dd className="mt-1 font-mono text-xs text-gray-900">{user.id}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-600">Account Created</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(user.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-600">Email Verified</dt>
            <dd className="mt-1 text-gray-900">
              {user.email_confirmed_at ? (
                <span className="text-green-600">✓ Verified</span>
              ) : (
                <span className="text-yellow-600">⚠ Not verified</span>
              )}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
