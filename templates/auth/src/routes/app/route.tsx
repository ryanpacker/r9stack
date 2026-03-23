/**
 * App Layout Route — /app/*
 *
 * This is the auth guard for ALL routes under /app/.
 * Any child route (dashboard, demos, etc.) inherits this protection.
 *
 * How it works:
 * - beforeLoad runs BEFORE the page renders
 * - getAuth() checks the session cookie for a valid token
 * - If no valid session, redirects to the landing page
 * - If authenticated, the user can access any /app/* route
 *
 * This route also wraps all children in the AppShell layout
 * (sidebar + main content area).
 */

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getAuth } from '@workos/authkit-tanstack-react-start'
import { AppShell } from '../../components/AppShell'

export const Route = createFileRoute('/app')({
  beforeLoad: async () => {
    // getAuth() reads the session from the encrypted cookie
    // It's provided by the authkitMiddleware() in start.ts
    const auth = await getAuth()

    if (!auth?.user) {
      // Not authenticated — redirect to landing page
      // The user will see the "Sign In" button there
      throw redirect({ to: '/' })
    }

    // User is authenticated — allow access to all /app/* routes
    return {}
  },
  component: AppLayout,
})

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
