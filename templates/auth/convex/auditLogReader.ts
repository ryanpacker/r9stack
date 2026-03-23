/**
 * Audit Log Reader — Public wrapper around internal audit log functions.
 *
 * The audit log's write functions (record) are internal — only callable
 * from other Convex functions. But we need a way for the UI to READ
 * the audit log. This file provides an authenticated public query
 * that wraps the internal query.
 *
 * This is a common pattern:
 * - Internal functions handle sensitive writes (no client can fabricate entries)
 * - Public functions handle reads (with auth checks)
 */

import { query } from './_generated/server'
import { internal } from './_generated/api'

/**
 * List recent audit log entries — AUTHENTICATED read-only access.
 *
 * Any authenticated user can view the audit log. In a production app,
 * you might restrict this to admins only (Pattern C).
 */
export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated: you must be logged in to view the audit log')
    }

    // Call the internal query to get audit log entries
    return await ctx.runQuery(internal.auditLog.listAll)
  },
})
