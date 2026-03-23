/**
 * Convex Auth Provider — The Critical Provider Chain
 *
 * This component sets up the auth provider chain in the correct order:
 *
 *   AuthKitProvider (WorkOS)
 *     → ConvexProviderWithAuth (Convex + auth bridge)
 *       → Your App
 *
 * WHY THIS ORDER MATTERS:
 * - AuthKitProvider must be the OUTER provider because it provides the
 *   auth context that ConvexProviderWithAuth needs to read tokens from
 * - ConvexProviderWithAuth uses the bridge hook (useAuthFromWorkOS) to
 *   get tokens from AuthKitProvider and pass them to the Convex client
 * - If you reverse the order, the bridge hook can't access WorkOS context
 *
 * SSR HANDLING:
 * The Convex client is only created on the client side. During SSR,
 * we render children without the Convex provider. This is because:
 * - The ConvexReactClient uses WebSockets which don't exist on the server
 * - Auth tokens are handled differently during SSR (via getAuth() in loaders)
 * - Convex queries in SSR use a different mechanism (server-side HTTP client)
 */

'use client'

import { useState, type ReactNode } from 'react'
import { ConvexProviderWithAuth, ConvexReactClient } from 'convex/react'
import { AuthKitProvider } from '@workos/authkit-tanstack-react-start/client'
import { useAuthFromWorkOS } from '../lib/convex-auth'

interface ConvexAuthProviderProps {
  children: ReactNode
}

export function ConvexAuthProvider({ children }: ConvexAuthProviderProps) {
  // Create the Convex client only on the client side
  // useState with an initializer function ensures it's only created once
  const [convexClient] = useState(() => {
    if (typeof window === 'undefined') {
      return null
    }
    const url = import.meta.env.VITE_CONVEX_URL
    if (!url) {
      console.warn(
        'VITE_CONVEX_URL not set. Run `npx convex dev` to configure.',
      )
      return null
    }
    return new ConvexReactClient(url)
  })

  // During SSR or if Convex URL is not configured, render without providers
  if (!convexClient) {
    return <>{children}</>
  }

  // The provider chain:
  // 1. AuthKitProvider — provides WorkOS auth context (user, tokens)
  // 2. ConvexProviderWithAuth — reads tokens via bridge hook, sends to Convex
  return (
    <AuthKitProvider>
      <ConvexProviderWithAuth client={convexClient} useAuth={useAuthFromWorkOS}>
        {children}
      </ConvexProviderWithAuth>
    </AuthKitProvider>
  )
}
