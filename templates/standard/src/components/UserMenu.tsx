import { ChevronUp, User, LogOut } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '../lib/utils'
import { useAuth } from '../lib/auth-client'

interface UserMenuProps {
  collapsed?: boolean
}

export function UserMenu({ collapsed }: UserMenuProps) {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayName = user?.firstName || user?.email?.split('@')[0] || 'User'
  const initials = user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-3 w-full p-3 rounded-md',
          'hover:bg-sidebar-accent transition-colors',
          'text-sidebar-foreground',
          collapsed && 'justify-center'
        )}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center overflow-hidden">
          {user?.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-sidebar-primary-foreground">
              {initials}
            </span>
          )}
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                {user?.email}
              </p>
            </div>
            <ChevronUp
              className={cn(
                'w-4 h-4 text-sidebar-foreground/50 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute bottom-full mb-2 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[200px]',
            collapsed ? 'left-full ml-2' : 'left-0 right-0'
          )}
        >
          {/* User info header */}
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : displayName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>

          {/* Menu items */}
          <button
            onClick={() => {
              setIsOpen(false)
              signOut()
            }}
            className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-accent flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
