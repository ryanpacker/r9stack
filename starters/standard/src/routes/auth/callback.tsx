import { createFileRoute, redirect } from '@tanstack/react-router'
import { handleAuthCallback } from '../../lib/auth-server'

export const Route = createFileRoute('/auth/callback')({
  beforeLoad: async ({ search }) => {
    const code = (search as { code?: string }).code

    if (!code) {
      throw redirect({ to: '/', search: { error: 'no_code' } })
    }

    try {
      // Handle the callback - this creates the session
      await handleAuthCallback({ data: { code } })

      // Redirect to the app
      throw redirect({ to: '/app' })
    } catch (error) {
      // If it's a redirect, let it through
      if (error instanceof Response || (error as { to?: string })?.to) {
        throw error
      }

      console.error('Auth callback error:', error)
      throw redirect({ to: '/', search: { error: 'auth_failed' } })
    }
  },
  component: CallbackPage,
})

function CallbackPage() {
  // This should never render as beforeLoad handles the redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
