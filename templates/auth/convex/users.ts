/**
 * User Management — sync the user's profile from the verified JWT.
 *
 * When a user authenticates, their profile claims are available on the Convex
 * identity. `upsertFromIdentity` mirrors them into a `users` row so you can
 * display profile info and associate data with users without calling WorkOS.
 *
 * NOTE ON CLAIMS: Convex maps standard OIDC claims onto the identity
 * (`email`, `givenName`, `familyName`, `pictureUrl`, `name`). WorkOS access
 * tokens carry NONE of these by default — add them to the WorkOS Sessions JWT
 * template (alongside the required `aud` claim) so provisioning has real data.
 * Without them, email/name fall back to empty. See the README.
 */

import { v } from 'convex/values'
import { internalQuery } from './_generated/server'
import { authedMutation, authedQuery } from './functions'

/**
 * Create or update the caller's user record from their verified identity.
 * Call this once after login. Idempotent (upsert).
 */
export const upsertFromIdentity = authedMutation({
  args: {},
  handler: async (ctx) => {
    const { identity, userId } = ctx

    // Prefer discrete OIDC claims; fall back to splitting the display name.
    const firstName =
      identity.givenName ?? identity.name?.split(' ')[0] ?? undefined
    const lastName =
      identity.familyName ??
      identity.name?.split(' ').slice(1).join(' ') ??
      undefined

    const existing = await ctx.db
      .query('users')
      .withIndex('by_workos_id', (q) => q.eq('workosId', userId))
      .first()

    const now = Date.now()

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: identity.email ?? existing.email,
        firstName: firstName ?? existing.firstName,
        lastName: lastName ?? existing.lastName,
        profilePictureUrl: identity.pictureUrl ?? existing.profilePictureUrl,
        updatedAt: now,
      })
      return existing._id
    }

    return await ctx.db.insert('users', {
      workosId: userId,
      email: identity.email ?? '',
      firstName,
      lastName,
      profilePictureUrl: identity.pictureUrl ?? undefined,
      createdAt: now,
      updatedAt: now,
    })
  },
})

/**
 * Get the current user's record from the database.
 */
export const me = authedQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('users')
      .withIndex('by_workos_id', (q) => q.eq('workosId', ctx.userId))
      .first()
  },
})

/**
 * Look up a user by WorkOS id — INTERNAL ONLY.
 *
 * This takes a caller-supplied `workosId`, so it must never be public: a public
 * version would let any authenticated user read any other user's record by id.
 * Call it from other Convex functions via `internal.users.getByWorkosId`.
 */
export const getByWorkosId = internalQuery({
  args: { workosId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_workos_id', (q) => q.eq('workosId', args.workosId))
      .first()
  },
})
