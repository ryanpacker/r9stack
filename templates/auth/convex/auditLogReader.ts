/**
 * Audit Log Reader — authenticated public read over the internal audit log.
 *
 * The audit log's write/read functions in auditLog.ts are INTERNAL (only
 * callable from other Convex functions). This authenticated wrapper lets the
 * UI read the log.
 *
 * Common pattern:
 * - internal functions handle sensitive writes (no client can fabricate entries)
 * - a thin authenticated public function handles reads
 */

import { internal } from './_generated/api'
import { authedQuery } from './functions'
import type { Doc } from './_generated/dataModel'

/**
 * List recent audit log entries — AUTHENTICATED.
 *
 * ⚠️ PRODUCTION NOTE: this returns EVERY user's audit entries to any
 * authenticated caller, which is fine for the demo but usually too broad for
 * production. Gate it like Pattern C (adminSettings.ts) — add
 * `requirePermission(ctx.identity, 'audit:read')` — or scope the query to
 * `ctx.userId` so callers only see their own actions.
 */
export const listRecent = authedQuery({
  args: {},
  // Explicit return type: this public function calls an internal query via the
  // generated `internal` api, which would otherwise create a circular type
  // reference (the module is part of the api it references).
  handler: async (ctx): Promise<Array<Doc<'audit_logs'>>> => {
    return await ctx.runQuery(internal.auditLog.listAll)
  },
})
