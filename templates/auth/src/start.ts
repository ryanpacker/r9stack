/**
 * TanStack Start server entry point.
 *
 * `authkitMiddleware()` runs on every request: it reads the encrypted WorkOS
 * session cookie, refreshes the access token when it has expired, updates the
 * cookie, and makes `getAuth()` available in route loaders and server handlers.
 * This is what replaces the manual iron-session handling in the standard
 * template — the SDK owns token refresh, cookie security, and session lifecycle.
 */

import { createStart } from '@tanstack/react-start'
import { authkitMiddleware } from '@workos/authkit-tanstack-react-start'

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [authkitMiddleware()],
  }
})
