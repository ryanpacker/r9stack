/**
 * PATTERN A: PUBLIC FUNCTIONS
 *
 * These functions have NO auth checks. Anyone can call them — logged in or not,
 * browser client or external script. This is intentional.
 *
 * When to use this pattern:
 * - Public content (blog posts, product listings, FAQ)
 * - Data that should be accessible without an account
 * - Read-only endpoints for SEO or public APIs
 *
 * Demo page: /app/demo/public-data
 *
 * IMPORTANT: `publicQuery`/`publicMutation` (from ./functions) are the raw
 * builders under an explicit name. Using them — rather than the banned raw
 * `query`/`mutation` — is a deliberate, greppable statement that "this data is
 * public on purpose." If you see one, the developer chose to expose it.
 */

import { v } from 'convex/values'
import { internalQuery } from './_generated/server'
import { publicMutation, publicQuery } from './functions'

/**
 * List all announcements — PUBLIC, no auth required.
 *
 * This query is reactive: any component using useQuery(api.announcements.list)
 * will automatically re-render when announcements are added or removed.
 */
export const list = publicQuery({
  args: {},
  handler: async (ctx) => {
    // No auth check — this is intentionally public.
    // Anyone with your Convex deployment URL can call this function.
    return await ctx.db
      .query('announcements')
      .withIndex('by_created_at')
      .order('desc')
      .collect()
  },
})

/**
 * Create an announcement — PUBLIC for demo purposes.
 *
 * In a real app you would gate this (e.g. authedMutation + an admin
 * permission — see adminSettings.ts). We leave it public in this demo so you
 * can test the flow without configuring RBAC.
 */
export const create = publicMutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('announcements', {
      title: args.title,
      content: args.content,
      createdAt: Date.now(),
    })
  },
})

/**
 * Internal version of list — only callable from other Convex functions.
 * Used by the HTTP action in http.ts for the M2M/API access demo.
 */
export const listInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('announcements')
      .withIndex('by_created_at')
      .order('desc')
      .collect()
  },
})
