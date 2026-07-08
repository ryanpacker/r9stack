/**
 * Convex Auth Configuration — WorkOS AuthKit (dual customJwt).
 *
 * This is the most critical auth file in the project: it tells Convex how to
 * validate the JWTs WorkOS issues, so `ctx.auth.getUserIdentity()` resolves.
 *
 * TWO providers, because WorkOS uses a different `iss` per login method:
 *   1. SSO / hosted AuthKit:     iss = https://api.workos.com/
 *   2. User Management sessions:  iss = https://api.workos.com/user_management/<clientId>
 * Both validate signatures against the same JWKS endpoint (RS256).
 *
 * Provider 1 sets `applicationID: clientId`, which requires the token's `aud`
 * claim to equal the client id. Provider 2 omits it (its issuer is
 * client-specific, so it is not on Convex's shared-issuer blocklist and does
 * not need an aud check).
 *
 * ── REQUIRED SETUP (read this — auth silently fails otherwise) ──────────────
 * • WORKOS_CLIENT_ID must be set ON THE CONVEX DEPLOYMENT, not just .env.local:
 *     npx convex env set WORKOS_CLIENT_ID <client_id>
 *     npx convex env set WORKOS_API_KEY  <api_key>
 *   Convex evaluates this file on its own servers and does NOT read .env.local.
 * • Real AuthKit access tokens carry no `aud` claim by default, so provider 1
 *   won't match until you add an `aud` claim to the WorkOS Sessions JWT
 *   template (Dashboard → Authentication → Sessions → Configure JWT Template),
 *   set to your client id. Convex's zero-config AuthKit (convex.json `authKit`
 *   block) does this automatically for dev on a Convex-managed WorkOS account;
 *   a bring-your-own WorkOS team must set it manually. See the README.
 */
import type { AuthConfig } from 'convex/server'

const clientId = process.env.WORKOS_CLIENT_ID
if (!clientId) {
  throw new Error(
    'WORKOS_CLIENT_ID is not set on the Convex deployment. Run ' +
      '`npx convex env set WORKOS_CLIENT_ID <client_id>` — Convex does not ' +
      'read .env.local.',
  )
}

export default {
  providers: [
    {
      type: 'customJwt',
      issuer: 'https://api.workos.com/',
      algorithm: 'RS256',
      jwks: `https://api.workos.com/sso/jwks/${clientId}`,
      applicationID: clientId,
    },
    {
      type: 'customJwt',
      issuer: `https://api.workos.com/user_management/${clientId}`,
      algorithm: 'RS256',
      jwks: `https://api.workos.com/sso/jwks/${clientId}`,
    },
  ],
} satisfies AuthConfig
