import { useState, useEffect, type ReactNode } from 'react'
import { AuthContext, signIn, signOut } from '../lib/auth-client'
import { getCurrentUser } from '../lib/auth-server'
import type { User } from '../lib/auth'

interface AuthProviderProps {
  children: ReactNode
  initialUser?: User | null
}

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [isLoading, setIsLoading] = useState(initialUser === null)

  useEffect(() => {
    // If we have an initial user from SSR, don't fetch again
    if (initialUser !== null) {
      setUser(initialUser)
      setIsLoading(false)
      return
    }

    // Fetch current user on mount
    async function fetchUser() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [initialUser])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
