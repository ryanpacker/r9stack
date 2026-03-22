import { createContext, useContext } from 'react'
import type { User } from './auth'

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: () => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Redirect to sign-in page
 */
export function signIn() {
  window.location.href = '/auth/sign-in'
}

/**
 * Redirect to sign-out page
 */
export function signOut() {
  window.location.href = '/auth/sign-out'
}
