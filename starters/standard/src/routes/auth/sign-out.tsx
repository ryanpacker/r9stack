import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@workos/authkit-tanstack-react-start/client'
import { useEffect, useRef } from 'react'

export const Route = createFileRoute('/auth/sign-out')({
  component: SignOutPage,
})

function SignOutPage() {
  const { signOut } = useAuth()
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    // Clears the session cookie, revokes the WorkOS session, and navigates
    // to WorkOS's logout URL. returnTo must be ABSOLUTE: WorkOS can't use a
    // relative return_to and instead strands the user on an AuthKit error
    // page, so this runs client-side where the origin is known.
    void signOut({ returnTo: `${window.location.origin}/` })
  }, [signOut])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Signing out...</p>
      </div>
    </div>
  )
}
