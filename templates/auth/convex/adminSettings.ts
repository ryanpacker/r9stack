/**
 * PATTERN C: ROLE-BASED FUNCTIONS (RBAC)
 *
 * These functions check for specific permissions from WorkOS RBAC.
 * The permissions are included in the JWT by WorkOS and are available
 * on the identity object in Convex.
 *
 * When to use this pattern:
 * - Admin-only operations
 * - Features gated by subscription tier
 * - Organization-specific capabilities
 * - Any action that requires a specific role or permission
 *
 * Demo page: /app/demo/admin-panel
 *
 * SETUP REQUIRED:
 * For this demo to work, you need to configure roles and permissions
 * in the WorkOS Dashboard:
 *
 * 1. Go to WorkOS Dashboard > Roles
 * 2. Create an "admin" role
 * 3. Go to Permissions
 * 4. Create "settings:read" and "settings:write" permissions
 * 5. Assign both permissions to the "admin" role
 * 6. Assign the "admin" role to your user in an Organization
 *
 * Without this setup, the admin panel demo will show an "Access Denied" message
 * with instructions for how to configure it.
 */

import { query, mutation } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'

/**
 * Helper: Extract permissions from the identity object.
 *
 * WorkOS includes permissions in the JWT as a custom claim.
 * The exact shape depends on your WorkOS configuration.
 * This helper safely extracts the permissions array.
 */
function getPermissions(identity: Record<string, unknown>): string[] {
  // WorkOS may include permissions as a top-level claim or nested
  const permissions = identity.permissions
  if (Array.isArray(permissions)) {
    return permissions as string[]
  }
  return []
}

/**
 * List admin settings — requires "settings:read" permission.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Check for the specific permission from WorkOS RBAC
    const permissions = getPermissions(
      identity as unknown as Record<string, unknown>,
    )
    if (!permissions.includes('settings:read')) {
      throw new Error(
        'Forbidden: requires "settings:read" permission. ' +
          'Configure this in the WorkOS Dashboard under Roles & Permissions.',
      )
    }

    return await ctx.db.query('admin_settings').collect()
  },
})

/**
 * Update an admin setting — requires "settings:write" permission.
 */
export const update = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const permissions = getPermissions(
      identity as unknown as Record<string, unknown>,
    )
    if (!permissions.includes('settings:write')) {
      throw new Error(
        'Forbidden: requires "settings:write" permission. ' +
          'Configure this in the WorkOS Dashboard under Roles & Permissions.',
      )
    }

    // Check if this setting already exists
    const existing = await ctx.db
      .query('admin_settings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first()

    if (existing) {
      // Update existing setting
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedBy: identity.subject,
        updatedAt: Date.now(),
      })
    } else {
      // Create new setting
      await ctx.db.insert('admin_settings', {
        key: args.key,
        value: args.value,
        updatedBy: identity.subject,
        updatedAt: Date.now(),
      })
    }

    // Record in audit log
    await ctx.runMutation(internal.auditLog.record, {
      action: 'setting:updated',
      userId: identity.subject,
      details: `${existing ? 'Updated' : 'Created'} setting: ${args.key} = ${args.value}`,
    })
  },
})

/**
 * Check if the current user has admin permissions.
 * Used by the UI to show/hide admin features gracefully.
 * Returns the permissions array so the UI knows exactly what's available.
 */
export const checkPermissions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return { authenticated: false, permissions: [] as string[] }
    }

    const permissions = getPermissions(
      identity as unknown as Record<string, unknown>,
    )

    return {
      authenticated: true,
      permissions,
      hasSettingsRead: permissions.includes('settings:read'),
      hasSettingsWrite: permissions.includes('settings:write'),
    }
  },
})
