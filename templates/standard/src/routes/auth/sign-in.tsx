import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAuthUrl } from '../../lib/auth-server'

export const Route = createFileRoute('/auth/sign-in')({
  beforeLoad: async () => {
    // Get the authorization URL and redirect to WorkOS
    const authUrl = await getAuthUrl()
    throw redirect({ href: authUrl })
  },
  component: SignInPage,
})

function SignInPage() {
  // This should never render as beforeLoad handles the redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to sign in...</p>
      </div>
    </div>
  )
}

