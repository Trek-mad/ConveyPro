'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Building2, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[] // If specified, only show for these roles
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Quotes', href: '/quotes', icon: FileText },
  { name: 'Properties', href: '/properties', icon: Building2 },
  {
    name: 'Team',
    href: '/team',
    icon: Users,
    roles: ['owner', 'admin'],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['owner', 'admin'],
  },
]

interface DashboardNavProps {
  tenantId: string
  role: string
}

export function DashboardNav({ tenantId, role }: DashboardNavProps) {
  const pathname = usePathname()

  // Filter navigation items based on user role
  const visibleNav = navigation.filter(
    (item) => !item.roles || item.roles.includes(role)
  )

  return (
    <nav className="flex w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-lg font-semibold text-gray-900">ConveyPro</span>
      </div>

      <div className="flex-1 space-y-1 p-4">
        {visibleNav.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  isActive ? 'text-blue-700' : 'text-gray-400'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </div>

      <div className="border-t p-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-xs font-medium text-blue-900">Trial Account</p>
          <p className="mt-1 text-xs text-blue-700">
            Upgrade to unlock all features
          </p>
          <button className="mt-3 w-full rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
            Upgrade now
          </button>
        </div>
      </div>
    </nav>
  )
}
