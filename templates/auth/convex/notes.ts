/**
 * PATTERN B: AUTHENTICATED FUNCTIONS
 *
 * These functions require the caller to be authenticated (have a valid JWT).
 * Additionally, data is scoped per-user — each user can only see and modify
 * their own notes.
 *
 * When to use this pattern:
 * - User-owned data (notes, settings, profiles, order history)
 * - Any data that should be private to the user who created it
 * - CRUD operations on personal resources
 *
 * Demo page: /app/demo/private-notes
 *
 * KEY CONCEPT: identity.subject
 * When ctx.auth.getUserIdentity() returns a non-null identity, the `subject`
 * field contains the user's unique ID from WorkOS. This is what you use to
 * scope data per-user. It comes from the `sub` claim in the JWT.
 */

import { query, mutation } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'

/**
 * List the current user's notes — AUTHENTICATED, user-scoped.
 *
 * Returns only notes belonging to the authenticated user.
 * Returns an empty array if the user has no notes.
 * Throws an error if the user is not authenticated.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    // Step 1: Verify the caller is authenticated
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated: you must be logged in to view notes')
    }

    // Step 2: Only return notes belonging to THIS user
    // identity.subject is the WorkOS user ID (from the JWT's `sub` claim)
    return await ctx.db
      .query('notes')
      .withIndex('by_user_and_created', (q) =>
        q.eq('userId', identity.subject),
      )
      .order('desc')
      .collect()
  },
})

/**
 * Create a new note — AUTHENTICATED.
 *
 * Automatically stamps the note with the current user's ID.
 * Also creates an audit log entry (via internal function).
 */
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error(
        'Not authenticated: you must be logged in to create notes',
      )
    }

    // Insert the note with the user's ID — this is how we scope data per-user
    const noteId = await ctx.db.insert('notes', {
      userId: identity.subject,
      title: args.title,
      content: args.content,
      createdAt: Date.now(),
    })

    // Record this action in the audit log (via internal function)
    // This demonstrates how authenticated functions can trigger internal functions
    await ctx.runMutation(internal.auditLog.record, {
      action: 'note:created',
      userId: identity.subject,
      details: `Created note: ${args.title}`,
    })

    return noteId
  },
})

/**
 * Delete a note — AUTHENTICATED + OWNERSHIP CHECK.
 *
 * Not only must the user be logged in, but they must also own the note.
 * This prevents User A from deleting User B's notes.
 */
export const remove = mutation({
  args: {
    noteId: v.id('notes'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error(
        'Not authenticated: you must be logged in to delete notes',
      )
    }

    // Fetch the note to check ownership
    const note = await ctx.db.get(args.noteId)
    if (!note) {
      throw new Error('Note not found')
    }

    // Ownership check: only the creator can delete their own notes
    if (note.userId !== identity.subject) {
      throw new Error('Forbidden: you can only delete your own notes')
    }

    await ctx.db.delete(args.noteId)

    // Record the deletion in the audit log
    await ctx.runMutation(internal.auditLog.record, {
      action: 'note:deleted',
      userId: identity.subject,
      details: `Deleted note: ${note.title}`,
    })
  },
})

/**
 * Get the current user's identity info — useful for the debug panel.
 * Returns the raw identity object so the UI can display what Convex sees.
 */
export const getMyIdentity = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }
    // Return a plain object with the identity fields
    return {
      subject: identity.subject,
      issuer: identity.issuer,
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email,
      name: identity.name,
    }
  },
})
