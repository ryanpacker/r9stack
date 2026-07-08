import { v } from 'convex/values'
import { action, internalMutation } from './_generated/server'
import { internal } from './_generated/api'
import { authedQuery } from './functions'
import type { Id } from './_generated/dataModel'

// ── TEMPLATE HOOK: restrict sign-ups by email domain (optional) ─────────────
// Leave empty to allow any email address to sign up. To restrict sign-ups
// (e.g. an internal tool for your company), list the allowed domains:
//
//   const ALLOWED_EMAIL_DOMAINS = ['yourcompany.com']
//
// The check runs server-side in `provision`, so it cannot be bypassed from
// the client. Existing users are grandfathered; only first-time provisioning
// is gated. If you enable this, update the message in
// `src/routes/auth/unauthorized.tsx` to tell users which domain is required.
const ALLOWED_EMAIL_DOMAINS: Array<string> = []
// ────────────────────────────────────────────────────────────────────────────

/**
 * Provision (or refresh) the caller's user record after login.
 *
 * Takes NO client args: the WorkOS user ID comes from the verified JWT and
 * the profile (email, name, picture) is fetched server-side from the WorkOS
 * API, so none of it can be spoofed.
 *
 * This is the one public function that runs before a `users` row exists —
 * everything else uses the authed wrappers from `functions.ts`.
 */
export const ensureUser = action({
  args: {},
  handler: async (ctx): Promise<Id<'users'>> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Unauthenticated: no valid token provided')
    }

    const apiKey = process.env.WORKOS_API_KEY
    if (!apiKey) {
      throw new Error('WORKOS_API_KEY not configured on the Convex deployment')
    }

    const response = await fetch(
      `https://api.workos.com/user_management/users/${identity.subject}`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    )
    if (!response.ok) {
      throw new Error(
        `Failed to fetch WorkOS user profile (${response.status})`,
      )
    }
    const profile = (await response.json()) as {
      id: string
      email: string
      first_name: string | null
      last_name: string | null
      profile_picture_url: string | null
    }

    return await ctx.runMutation(internal.users.provision, {
      workosId: profile.id,
      email: profile.email,
      firstName: profile.first_name ?? undefined,
      lastName: profile.last_name ?? undefined,
      profilePictureUrl: profile.profile_picture_url ?? undefined,
    })
  },
})

export const provision = internalMutation({
  args: {
    workosId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<'users'>> => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_workos_id', (q) => q.eq('workosId', args.workosId))
      .unique()

    if (existing) {
      if (
        existing.email !== args.email ||
        existing.firstName !== args.firstName ||
        existing.lastName !== args.lastName ||
        existing.profilePictureUrl !== args.profilePictureUrl
      ) {
        await ctx.db.patch(existing._id, {
          email: args.email,
          firstName: args.firstName,
          lastName: args.lastName,
          profilePictureUrl: args.profilePictureUrl,
          updatedAt: Date.now(),
        })
      }
      return existing._id
    }

    if (ALLOWED_EMAIL_DOMAINS.length > 0) {
      const emailDomain = args.email.split('@')[1]?.toLowerCase()
      if (!emailDomain || !ALLOWED_EMAIL_DOMAINS.includes(emailDomain)) {
        throw new Error('Sign-up is not allowed for this email domain.')
      }
    }

    const now = Date.now()
    return await ctx.db.insert('users', {
      workosId: args.workosId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      profilePictureUrl: args.profilePictureUrl,
      createdAt: now,
      updatedAt: now,
    })
  },
})

/**
 * Returns the current authenticated user's record.
 */
export const getCurrent = authedQuery({
  args: {},
  handler: (ctx) => {
    return ctx.user
  },
})
