import { useAuth as useAuthKitAuth } from '@workos/authkit-tanstack-react-start/client'
import type { User } from './auth'

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (screenHint?: 'sign-up' | 'sign-in') => void
  signOut: () => void
}

/**
 * App-facing auth hook, backed by the WorkOS AuthKit SDK.
 * Exposes a stable shape ({ user, isAuthenticated, isLoading, signIn,
 * signOut }) so components don't depend on the SDK directly.
 */
export function useAuth(): AuthContextValue {
  const { user, loading, signOut: authKitSignOut } = useAuthKitAuth()

  return {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    signIn,
    signOut: () => {
      // Revokes the WorkOS session server-side and redirects. returnTo must
      // be absolute — WorkOS strands relative URLs on an AuthKit error page.
      void authKitSignOut({ returnTo: `${window.location.origin}/` })
    },
  }
}

/**
 * Redirect to sign-in page
 */
export function signIn(screenHint?: 'sign-up' | 'sign-in') {
  const params = screenHint ? `?screen_hint=${screenHint}` : ''
  window.location.href = `/auth/sign-in${params}`
}
