import { Home, MessageSquare, PanelLeftClose, PanelLeft } from 'lucide-react'
import { cn } from '../lib/utils'
import { NavGroup } from './NavGroup'
import { NavItem } from './NavItem'
import { UserMenu } from './UserMenu'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar border-r border-sidebar-border',
        'transition-all duration-200 ease-in-out',
        collapsed ? 'w-14' : 'w-60'
      )}
    >
      {/* Header with collapse toggle */}
      <div
        className={cn(
          'flex items-center h-14 px-3 border-b border-sidebar-border',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src="/images/your-project-logo.png" alt="" className="w-6 h-6" />
            <span className="text-lg font-semibold text-sidebar-foreground">
              My Project
            </span>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-2 rounded-md',
            'text-sidebar-foreground/70 hover:text-sidebar-foreground',
            'hover:bg-sidebar-accent transition-colors'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
        <NavItem
          to="/app"
          icon={<Home className="w-4 h-4" />}
          label="Home"
          collapsed={collapsed}
        />

        <NavGroup label="Demos" collapsed={collapsed}>
          <NavItem
            to="/app/demo/convex/messages"
            icon={<MessageSquare className="w-4 h-4" />}
            label="Messages"
            collapsed={collapsed}
          />
        </NavGroup>
      </nav>

      {/* User menu at bottom */}
      <div className="p-2 border-t border-sidebar-border">
        <UserMenu collapsed={collapsed} />
      </div>
    </aside>
  )
}
