/**
 * PATTERN B: AUTHENTICATED FUNCTIONS
 *
 * These functions require the caller to be authenticated, and data is scoped
 * per-user — each user only sees and modifies their own notes.
 *
 * When to use this pattern:
 * - User-owned data (notes, settings, profiles, order history)
 * - Any data that should be private to the user who created it
 *
 * Demo page: /app/demo/private-notes
 *
 * KEY CONCEPT: `authedQuery`/`authedMutation` (from ./functions) reject
 * unauthenticated callers before the handler runs and inject `ctx.userId` —
 * the caller's WorkOS user id (the JWT `sub` claim). Scope per-user data by
 * `ctx.userId`; it is verified and cannot be forged by a client argument.
 */

import { v } from 'convex/values'
import { internal } from './_generated/api'
import { authedMutation, authedQuery } from './functions'

/**
 * List the current user's notes — AUTHENTICATED, user-scoped.
 *
 * Returns only notes belonging to the authenticated caller (empty if none).
 * Unauthenticated calls are rejected by the wrapper before this runs.
 */
export const list = authedQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('notes')
      .withIndex('by_user_and_created', (q) => q.eq('userId', ctx.userId))
      .order('desc')
      .collect()
  },
})

/**
 * Create a new note — AUTHENTICATED.
 *
 * Stamps the note with the caller's verified id and writes an audit entry via
 * an internal function.
 */
export const create = authedMutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const noteId = await ctx.db.insert('notes', {
      userId: ctx.userId,
      title: args.title,
      content: args.content,
      createdAt: Date.now(),
    })

    await ctx.runMutation(internal.auditLog.record, {
      action: 'note:created',
      userId: ctx.userId,
      details: `Created note: ${args.title}`,
    })

    return noteId
  },
})

/**
 * Delete a note — AUTHENTICATED + OWNERSHIP CHECK.
 *
 * Being logged in is not enough — the caller must own the note. This prevents
 * user A from deleting user B's notes.
 */
export const remove = authedMutation({
  args: {
    noteId: v.id('notes'),
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId)
    if (!note) {
      throw new Error('Note not found')
    }

    // Ownership check: only the creator can delete their own notes
    if (note.userId !== ctx.userId) {
      throw new Error('Forbidden: you can only delete your own notes')
    }

    await ctx.db.delete(args.noteId)

    await ctx.runMutation(internal.auditLog.record, {
      action: 'note:deleted',
      userId: ctx.userId,
      details: `Deleted note: ${note.title}`,
    })
  },
})

/**
 * Return the caller's identity info — useful for the debug panel to show what
 * Convex actually sees in the verified JWT.
 */
export const getMyIdentity = authedQuery({
  args: {},
  handler: (ctx) => {
    return {
      subject: ctx.identity.subject,
      issuer: ctx.identity.issuer,
      tokenIdentifier: ctx.identity.tokenIdentifier,
      email: ctx.identity.email,
      name: ctx.identity.name,
    }
  },
})
