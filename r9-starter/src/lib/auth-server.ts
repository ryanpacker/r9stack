import { createServerFn } from '@tanstack/react-start'
import { getRequest, setCookie, deleteCookie } from '@tanstack/react-start/server'
import { getIronSession } from 'iron-session'
import { WorkOS } from '@workos-inc/node'
import type { SessionData, User } from './auth'

// Initialize WorkOS client
const workos = new WorkOS(process.env.WORKOS_API_KEY)
const clientId = process.env.WORKOS_CLIENT_ID!

// Session configuration
const sessionOptions = {
  password: process.env.WORKOS_COOKIE_PASSWORD!,
  cookieName: 'r9_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
}

/**
 * Get the authorization URL to redirect users to WorkOS AuthKit
 */
export const getAuthUrl = createServerFn({ method: 'GET' }).handler(async () => {
  const authorizationUrl = workos.userManagement.getAuthorizationUrl({
    provider: 'authkit',
    clientId,
    redirectUri: process.env.WORKOS_REDIRECT_URI!,
  })
  return authorizationUrl
})

/**
 * Get the current authenticated user
 */
export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<User | null> => {
    const request = getRequest()

    if (!request) {
      return null
    }

    const response = new Response()
    const session = await getIronSession<SessionData>(request, response, sessionOptions)

    if (!session.user) {
      return null
    }

    // Check if token is expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      return null
    }

    return session.user
  }
)

/**
 * Handle the OAuth callback and create session
 */
export const handleAuthCallback = createServerFn({ method: 'GET' }).handler(
  async (ctx: { data: { code: string } }): Promise<User> => {
    const { code } = ctx.data

    // Exchange code for tokens
    const authResponse = await workos.userManagement.authenticateWithCode({
      clientId,
      code,
    })

    const user: User = {
      id: authResponse.user.id,
      email: authResponse.user.email,
      firstName: authResponse.user.firstName,
      lastName: authResponse.user.lastName,
      profilePictureUrl: authResponse.user.profilePictureUrl,
    }

    // Get request to create session
    const request = getRequest()

    if (!request) {
      throw new Error('No request available')
    }

    const response = new Response()
    const session = await getIronSession<SessionData>(request, response, sessionOptions)

    session.user = user
    session.accessToken = authResponse.accessToken
    session.refreshToken = authResponse.refreshToken
    session.expiresAt = Date.now() + 60 * 60 * 1000 // 1 hour

    await session.save()

    // Set the cookie using TanStack Start's setCookie
    const cookieHeader = response.headers.get('Set-Cookie')
    if (cookieHeader) {
      // Parse and set the cookie
      // The cookie format is: name=value; options...
      const [nameValue] = cookieHeader.split(';')
      const [, value] = nameValue.split('=')
      setCookie('r9_session', value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      })
    }

    return user
  }
)

/**
 * Sign out and clear session
 */
export const signOutServer = createServerFn({ method: 'POST' }).handler(
  async () => {
    // Clear the session cookie
    deleteCookie('r9_session')
    return { success: true }
  }
)
