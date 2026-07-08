import { createFileRoute } from '@tanstack/react-router'
import { ShieldAlert } from 'lucide-react'

export const Route = createFileRoute('/auth/unauthorized')({
  component: UnauthorizedPage,
})

/**
 * Shown when server-side provisioning rejects the account — e.g. the
 * email-domain restriction in `convex/users.ts` (see ALLOWED_EMAIL_DOMAINS).
 * If you enable that restriction, update this copy to tell users which
 * email domain is required.
 */
function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Access Restricted
        </h1>
        <p className="text-muted-foreground mb-8">
          Your account isn't authorized for this application. If you believe
          this is a mistake, contact the application owner.
        </p>
        {/* Sign out first: it revokes the blocked WorkOS session so the
            next sign-in shows a fresh login instead of silently reusing it */}
        <a
          href="/auth/sign-out"
          className="inline-flex items-center px-6 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          Try Again
        </a>
      </div>
    </div>
  )
}
