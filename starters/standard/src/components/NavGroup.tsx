import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'

interface NavGroupProps {
  label: string
  children: ReactNode
  collapsed?: boolean
  defaultExpanded?: boolean
}

export function NavGroup({
  label,
  children,
  collapsed,
  defaultExpanded = true,
}: NavGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  if (collapsed) {
    // When sidebar is collapsed, just render children without group header
    return <div className="space-y-1">{children}</div>
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2',
          'text-xs font-semibold uppercase tracking-wider',
          'text-sidebar-foreground/50 hover:text-sidebar-foreground/70',
          'transition-colors'
        )}
      >
        <span>{label}</span>
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </button>
      {expanded && <div className="space-y-1">{children}</div>}
    </div>
  )
}

