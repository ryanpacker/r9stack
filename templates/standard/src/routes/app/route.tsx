import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '../../lib/auth-server'
import { AppShell } from '../../components/AppShell'

export const Route = createFileRoute('/app')({
  beforeLoad: async () => {
    const user = await getCurrentUser()

    if (!user) {
      throw redirect({ to: '/' })
    }

    // User is authenticated, allow access
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
