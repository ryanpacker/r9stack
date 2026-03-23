/**
 * TanStack Start Server Entry Point
 *
 * This file configures the server-side middleware that runs on EVERY request.
 * The key addition is authkitMiddleware() from the WorkOS SDK, which:
 *
 * 1. Reads the encrypted session cookie from the request
 * 2. Checks if the access token is expired
 * 3. If expired, uses the refresh token to get a new access token from WorkOS
 * 4. Updates the cookie with the new tokens
 * 5. Makes getAuth() available in route loaders and server functions
 *
 * This replaces the manual iron-session handling in the standard template.
 * The WorkOS SDK handles all the complexity of token refresh, cookie security,
 * and session lifecycle automatically.
 */

import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'
import { getRouter } from './router'
import { authkitMiddleware } from '@workos/authkit-tanstack-react-start'

export default createStartHandler({
  createRouter: getRouter,
  middleware: [
    // WorkOS AuthKit middleware — handles session management automatically
    // This must be included for getAuth() to work in route loaders
    authkitMiddleware(),
  ],
})(defaultStreamHandler)
