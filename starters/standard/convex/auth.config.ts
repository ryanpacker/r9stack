/**
 * Convex Auth Configuration for WorkOS AuthKit.
 *
 * Validates WorkOS-issued JWTs against the WorkOS JWKS endpoint so Convex
 * functions can call `ctx.auth.getUserIdentity()`. Two customJwt providers
 * are required because WorkOS issues tokens with different `iss` values
 * depending on the auth method:
 * - SSO: `https://api.workos.com/`
 * - User management (AuthKit): `https://api.workos.com/user_management/{clientId}`
 * Both use the same JWKS endpoint for signature validation.
 *
 * Requires WORKOS_CLIENT_ID to be set in the Convex deployment environment
 * (npx convex env set WORKOS_CLIENT_ID ... — .env.local is NOT read here).
 */

const clientId = process.env.WORKOS_CLIENT_ID

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
      // AuthKit user-management access tokens carry no `aud` claim by
      // default, so no applicationID on this provider.
      issuer: `https://api.workos.com/user_management/${clientId}`,
      algorithm: 'RS256',
      jwks: `https://api.workos.com/sso/jwks/${clientId}`,
    },
  ],
}
