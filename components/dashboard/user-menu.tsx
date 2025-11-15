'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { LogOut, User as UserIcon, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface UserMenuProps {
  user: User
  tenantId: string
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
          <UserIcon className="h-4 w-4" />
        </div>
        <div className="text-left">
          <p className="font-medium text-gray-900">
            {user.user_metadata?.full_name || user.email}
          </p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push('/settings/profile')
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings className="h-4 w-4" />
                Profile Settings
              </button>
              <hr className="my-1" />
              <button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
