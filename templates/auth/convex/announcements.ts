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
 * IMPORTANT: The absence of ctx.auth.getUserIdentity() is a deliberate choice.
 * If you see a Convex function without an auth check, it means the developer
 * intentionally decided this data is public.
 */

import { query, mutation, internalQuery } from './_generated/server'
import { v } from 'convex/values'

/**
 * List all announcements — PUBLIC, no auth required.
 *
 * This query is reactive: any component using useQuery(api.announcements.list)
 * will automatically re-render when announcements are added or removed.
 */
export const list = query({
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
 * In a real app, you would likely add an auth check here to restrict
 * who can create announcements (e.g., only admins). We leave it public
 * in this demo so you can easily test the flow.
 */
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // In production, you'd add an auth check here:
    // const identity = await ctx.auth.getUserIdentity()
    // if (!identity) throw new Error('Not authenticated')

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
