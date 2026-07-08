import {
  Outlet,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { getAuth } from '@workos/authkit-tanstack-react-start'
import { useAction, useConvexAuth } from 'convex/react'
import { useEffect, useState } from 'react'
import { api } from '../../../convex/_generated/api'
import { AppShell } from '../../components/AppShell'
import type { ReactNode } from 'react'

export const Route = createFileRoute('/app')({
  beforeLoad: async () => {
    const { user } = await getAuth()

    if (!user) {
      throw redirect({
        to: '/auth/sign-in',
        search: { screen_hint: undefined },
      })
    }

    // User is authenticated, allow access
    return {}
  },
  component: AppLayout,
})

function AppLayout() {
  return (
    <AppShell>
      <EnsureProvisioned>
        <Outlet />
      </EnsureProvisioned>
    </AppShell>
  )
}

/**
 * Provisions (or refreshes) the caller's Convex `users` row before rendering
 * the app. All authed Convex functions require the row to exist, so nothing
 * under /app may run queries until this resolves. If provisioning is rejected
 * server-side (e.g. the optional email-domain restriction in
 * `convex/users.ts`), the user lands on /auth/unauthorized.
 */
function EnsureProvisioned({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const ensureUser = useAction(api.users.ensureUser)
  const [status, setStatus] = useState<'pending' | 'ready' | 'blocked'>(
    'pending',
  )
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoading || !isAuthenticated || status !== 'pending') return
    let cancelled = false
    ensureUser()
      .then(() => {
        if (!cancelled) setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('blocked')
      })
    return () => {
      cancelled = true
    }
  }, [isLoading, isAuthenticated, status, ensureUser])

  useEffect(() => {
    if (status === 'blocked') {
      void navigate({ to: '/auth/unauthorized' })
    }
  }, [status, navigate])

  if (status !== 'ready') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return children
}
