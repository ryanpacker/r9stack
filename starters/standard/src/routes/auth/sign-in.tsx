import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  getSignInUrl,
  getSignUpUrl,
} from '@workos/authkit-tanstack-react-start'

export const Route = createFileRoute('/auth/sign-in')({
  validateSearch: (search: Record<string, unknown>) => ({
    screen_hint: search.screen_hint as 'sign-up' | 'sign-in' | undefined,
  }),
  beforeLoad: async ({ search }) => {
    // The SDK's sign-in URL sets the PKCE verifier cookie the callback
    // requires — sign-in must always start here.
    const authUrl =
      search.screen_hint === 'sign-up'
        ? await getSignUpUrl()
        : await getSignInUrl()
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
