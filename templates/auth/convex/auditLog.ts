/**
 * PATTERN D: INTERNAL FUNCTIONS
 *
 * These functions can ONLY be called from other Convex functions.
 * They do NOT appear in the client API — there is no api.auditLog.record.
 * The client cannot call them directly, no matter what.
 *
 * When to use this pattern:
 * - Audit logging (you don't want clients fabricating log entries)
 * - Background processing triggered by other operations
 * - Data aggregation or denormalization
 * - Cascading updates (e.g., when a user is deleted, clean up their data)
 * - Any server-side logic that should never be directly triggered by a client
 *
 * Demo page: /app/demo/audit-log
 *
 * KEY CONCEPT: internal vs api
 * - `api.moduleName.functionName` — public functions, callable from the client
 * - `internal.moduleName.functionName` — internal functions, server-only
 *
 * To call an internal function from another function:
 *   await ctx.runMutation(internal.auditLog.record, { ... })
 */

import { internalMutation, internalQuery } from './_generated/server'
import { v } from 'convex/values'

/**
 * Record an audit log entry — INTERNAL ONLY.
 *
 * This mutation can only be called from other Convex functions using:
 *   await ctx.runMutation(internal.auditLog.record, { ... })
 *
 * It cannot be called from the client. If someone tries to call
 * api.auditLog.record from React, it won't exist — TypeScript
 * will catch this at compile time.
 */
export const record = internalMutation({
  args: {
    action: v.string(),
    userId: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('audit_logs', {
      action: args.action,
      userId: args.userId,
      details: args.details,
      timestamp: Date.now(),
    })
  },
})

/**
 * List recent audit log entries — INTERNAL ONLY.
 *
 * We expose this via a public wrapper (listRecent below) that
 * requires authentication, so the UI can display the audit log.
 */
export const listAll = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('audit_logs')
      .withIndex('by_timestamp')
      .order('desc')
      .take(50)
  },
})
