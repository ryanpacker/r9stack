/**
 * User Management — Sync user data from WorkOS JWT identity.
 *
 * When a user authenticates, their profile information is available
 * in the JWT. This module syncs that data into the Convex database
 * so you can:
 * - Display user info without calling WorkOS APIs
 * - Query users for admin features
 * - Associate data with users via foreign keys
 *
 * The upsertFromIdentity mutation is called from the client after
 * authentication to ensure the user record exists in Convex.
 */

import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

/**
 * Create or update a user record from the authenticated identity.
 *
 * Call this after login to sync the user's profile from WorkOS
 * into the Convex database. Uses upsert pattern: creates if new,
 * updates if existing.
 */
export const upsertFromIdentity = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Check if user already exists
    const existing = await ctx.db
      .query('users')
      .withIndex('by_workos_id', (q) => q.eq('workosId', identity.subject))
      .first()

    const now = Date.now()

    if (existing) {
      // Update existing user with latest profile info from JWT
      await ctx.db.patch(existing._id, {
        email: identity.email ?? existing.email,
        firstName: identity.name?.split(' ')[0] ?? existing.firstName,
        lastName: identity.name?.split(' ').slice(1).join(' ') ?? existing.lastName,
        updatedAt: now,
      })
      return existing._id
    } else {
      // Create new user record
      return await ctx.db.insert('users', {
        workosId: identity.subject,
        email: identity.email ?? '',
        firstName: identity.name?.split(' ')[0],
        lastName: identity.name?.split(' ').slice(1).join(' '),
        profilePictureUrl: undefined,
        createdAt: now,
        updatedAt: now,
      })
    }
  },
})

/**
 * Get the current user's record from the database.
 */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }

    return await ctx.db
      .query('users')
      .withIndex('by_workos_id', (q) => q.eq('workosId', identity.subject))
      .first()
  },
})

/**
 * Get a user by their WorkOS ID.
 */
export const getByWorkosId = query({
  args: { workosId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    return await ctx.db
      .query('users')
      .withIndex('by_workos_id', (q) => q.eq('workosId', args.workosId))
      .first()
  },
})
