/**
 * PATTERN C: ROLE-BASED FUNCTIONS (RBAC)
 *
 * These functions require a specific WorkOS permission, carried in the JWT as
 * a `permissions` claim and read off the verified identity in Convex.
 *
 * When to use this pattern:
 * - Admin-only operations
 * - Features gated by subscription tier or organization capability
 *
 * Demo page: /app/demo/admin-panel
 *
 * SETUP REQUIRED (WorkOS Dashboard):
 * 1. Roles → create an "admin" role
 * 2. Permissions → create "settings:read" and "settings:write"
 * 3. Assign both permissions to the "admin" role
 * 4. Assign the "admin" role to your user in an Organization
 * Without this, the admin panel shows an "Access Denied" message.
 *
 * The functions are `authedQuery`/`authedMutation` (reject anonymous callers)
 * plus `requirePermission` (reject callers lacking the permission).
 */

import { v } from 'convex/values'
import { internal } from './_generated/api'
import {
  authedMutation,
  authedQuery,
  getPermissions,
  requirePermission,
} from './functions'

/**
 * List admin settings — requires "settings:read".
 */
export const list = authedQuery({
  args: {},
  handler: async (ctx) => {
    requirePermission(ctx.identity, 'settings:read')
    return await ctx.db.query('admin_settings').collect()
  },
})

/**
 * Update an admin setting — requires "settings:write".
 */
export const update = authedMutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    requirePermission(ctx.identity, 'settings:write')

    const existing = await ctx.db
      .query('admin_settings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedBy: ctx.userId,
        updatedAt: Date.now(),
      })
    } else {
      await ctx.db.insert('admin_settings', {
        key: args.key,
        value: args.value,
        updatedBy: ctx.userId,
        updatedAt: Date.now(),
      })
    }

    await ctx.runMutation(internal.auditLog.record, {
      action: 'setting:updated',
      userId: ctx.userId,
      details: `${existing ? 'Updated' : 'Created'} setting: ${args.key} = ${args.value}`,
    })
  },
})

/**
 * Report the caller's permissions so the UI can show/hide admin features
 * gracefully. Authenticated (it runs inside /app), but does not itself require
 * a permission — it just reports which ones are present.
 */
export const checkPermissions = authedQuery({
  args: {},
  handler: (ctx) => {
    const permissions = getPermissions(ctx.identity)
    return {
      authenticated: true,
      permissions,
      hasSettingsRead: permissions.includes('settings:read'),
      hasSettingsWrite: permissions.includes('settings:write'),
    }
  },
})
