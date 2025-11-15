'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Building2 } from 'lucide-react'

interface SettingsNavProps {
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer'
}

export function SettingsNav({ role }: SettingsNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Profile',
      href: '/settings/profile',
      icon: User,
      roles: ['owner', 'admin', 'manager', 'member', 'viewer'],
    },
    {
      name: 'Firm Settings',
      href: '/settings/firm',
      icon: Building2,
      roles: ['owner', 'admin'],
    },
  ]

  const visibleNav = navItems.filter((item) => item.roles.includes(role))

  return (
    <nav className="space-y-1">
      {visibleNav.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
