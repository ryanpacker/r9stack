/**
 * Custom Convex function builders with authentication.
 *
 * Use these instead of the raw `query` and `mutation` from `_generated/server`
 * for every public function. They validate the caller's WorkOS JWT, look up
 * the matching `users` record, and inject it as `ctx.user` so handlers never
 * take identity (workosId/email) from client-supplied args.
 *
 * - authedQuery / authedMutation — any authenticated, provisioned user
 * - requireActionUser — equivalent check for `action` handlers (actions
 *   cannot use the customCtx builders; call this at the top of the handler)
 *
 * Provisioning of the `users` row happens in `users.ensureUser`, which is the
 * one deliberate exception that runs before a row exists.
 */
import { v } from 'convex/values'
import {
  customCtx,
  customMutation,
  customQuery,
} from 'convex-helpers/server/customFunctions'
import { internalQuery, mutation, query } from './_generated/server'
import { internal } from './_generated/api'
import type { ActionCtx, MutationCtx, QueryCtx } from './_generated/server'
import type { Doc } from './_generated/dataModel'

/**
 * Resolve the authenticated caller to their `users` record.
 * Throws if there is no valid token or no provisioned user row.
 */
export async function getUserFromIdentity(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<'users'>> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Unauthenticated: no valid token provided')
  }

  // `subject` is the WorkOS user ID from the verified JWT
  const user = await ctx.db
    .query('users')
    .withIndex('by_workos_id', (q) => q.eq('workosId', identity.subject))
    .unique()

  if (!user) {
    throw new Error(
      'User not provisioned: authenticated but no user record exists',
    )
  }

  return user
}

export const authedQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const user = await getUserFromIdentity(ctx)
    return { user }
  }),
)

export const authedMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const user = await getUserFromIdentity(ctx)
    return { user }
  }),
)

export const getUserByWorkosId = internalQuery({
  args: { workosId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_workos_id', (q) => q.eq('workosId', args.workosId))
      .unique()
  },
})

/**
 * Action-context equivalent of the wrappers: validates the token and
 * resolves the `users` row via an internal query.
 */
export async function requireActionUser(ctx: ActionCtx): Promise<Doc<'users'>> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Unauthenticated: no valid token provided')
  }

  const user: Doc<'users'> | null = await ctx.runQuery(
    internal.functions.getUserByWorkosId,
    { workosId: identity.subject },
  )

  if (!user) {
    throw new Error(
      'User not provisioned: authenticated but no user record exists',
    )
  }

  return user
}
