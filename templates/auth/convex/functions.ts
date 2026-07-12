/**
 * Authenticated Convex function builders — the enforcement layer.
 *
 * The Convex function API is reachable by anyone with the deployment URL (it
 * ships in the client bundle). Route guards protect PAGES, not DATA. So every
 * public function must verify the caller itself. These builders make that the
 * default and hard to forget:
 *
 * - `authedQuery` / `authedMutation` / `authedAction` — reject unauthenticated
 *   callers, then inject the verified identity as `ctx.identity` and the WorkOS
 *   user id as `ctx.userId` (from the JWT `sub` claim). Scope per-user data by
 *   `ctx.userId`.
 * - `publicQuery` / `publicMutation` — explicit, greppable opt-outs for
 *   deliberately public endpoints. Using these (instead of the raw builders)
 *   is what lets the ESLint rule ban the raw `query`/`mutation` builders while
 *   still allowing intentional public functions. (see eslint.config.js)
 * - `requirePermission` — WorkOS RBAC check for role-gated functions.
 *
 * Internal functions (seeds, audit writes, crons) use `internalQuery` /
 * `internalMutation` / `internalAction` straight from `_generated/server`;
 * they are never exposed on the public API.
 *
 * This is the ONE file allowed to import the raw builders (the ESLint ban
 * excludes it); everything else imports from here.
 */
import {
  customAction,
  customCtx,
  customMutation,
  customQuery,
} from 'convex-helpers/server/customFunctions'
import { action, mutation, query } from './_generated/server'
import type { UserIdentity } from 'convex/server'
import type { ActionCtx, MutationCtx, QueryCtx } from './_generated/server'

/**
 * Require a verified caller. Throws if there is no valid WorkOS JWT.
 * Returns the identity; `identity.subject` is the WorkOS user id (`sub`).
 */
export async function requireIdentity(
  ctx: QueryCtx | MutationCtx | ActionCtx,
): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error('Unauthenticated: you must be signed in to call this')
  }
  return identity
}

/** Authenticated query. Adds `ctx.identity` and `ctx.userId`. */
export const authedQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const identity = await requireIdentity(ctx)
    return { identity, userId: identity.subject }
  }),
)

/** Authenticated mutation. Adds `ctx.identity` and `ctx.userId`. */
export const authedMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const identity = await requireIdentity(ctx)
    return { identity, userId: identity.subject }
  }),
)

/** Authenticated action. Adds `ctx.identity` and `ctx.userId`. */
export const authedAction = customAction(
  action,
  customCtx(async (ctx) => {
    const identity = await requireIdentity(ctx)
    return { identity, userId: identity.subject }
  }),
)

/**
 * Explicit public builders. Thin aliases of the raw builders whose only job is
 * to make "this endpoint is intentionally public" greppable and lint-approved.
 */
export const publicQuery = query
export const publicMutation = mutation

/**
 * Read WorkOS RBAC permissions from the verified identity. WorkOS includes them
 * as a `permissions` claim in the JWT.
 */
export function getPermissions(identity: UserIdentity): Array<string> {
  const permissions = (identity as unknown as Record<string, unknown>)
    .permissions
  return Array.isArray(permissions) ? (permissions as Array<string>) : []
}

/** Throw unless the identity carries the given WorkOS permission. */
export function requirePermission(
  identity: UserIdentity,
  permission: string,
): void {
  if (!getPermissions(identity).includes(permission)) {
    throw new Error(
      `Forbidden: requires "${permission}" permission. Configure roles and ` +
        'permissions in the WorkOS Dashboard (Roles & Permissions).',
    )
  }
}
