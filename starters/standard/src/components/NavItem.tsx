import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

interface NavItemProps {
  to: string
  icon: ReactNode
  label: string
  collapsed?: boolean
}

export function NavItem({ to, icon, label, collapsed }: NavItemProps) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
        'text-sidebar-foreground/70 hover:text-sidebar-foreground',
        'hover:bg-sidebar-accent transition-colors',
        collapsed && 'justify-center px-2'
      )}
      activeProps={{
        className: cn(
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
          'bg-sidebar-accent text-sidebar-accent-foreground',
          'transition-colors',
          collapsed && 'justify-center px-2'
        ),
      }}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  )
}

