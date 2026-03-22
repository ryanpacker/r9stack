import { createFileRoute, redirect } from '@tanstack/react-router'
import { signOutServer } from '../../lib/auth-server'

export const Route = createFileRoute('/auth/sign-out')({
  beforeLoad: async () => {
    // Sign out and redirect to home
    await signOutServer()
    throw redirect({ to: '/' })
  },
  component: SignOutPage,
})

function SignOutPage() {
  // This should never render as beforeLoad handles the redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Signing out...</p>
      </div>
    </div>
  )
}

