/**
 * Convex Auth Configuration — Dual JWT Provider Setup
 *
 * This is the most critical auth file in the entire project. It tells Convex
 * HOW to validate the JWT tokens that WorkOS issues.
 *
 * WHY TWO PROVIDERS?
 * WorkOS issues JWTs from different "issuers" depending on how the user logged in:
 *
 * 1. SSO login (enterprise SAML/OIDC):
 *    - Issuer: "https://api.workos.com/"
 *
 * 2. User Management login (email/password, social login, magic link):
 *    - Issuer: "https://api.workos.com/user_management/{clientId}"
 *
 * Both use the SAME JWKS endpoint (public keys) for signature verification,
 * but the `iss` claim in the JWT differs. We must list both so Convex can
 * validate tokens from either login method.
 *
 * HOW IT WORKS:
 * When ConvexProviderWithAuth sends a JWT with a function call, Convex:
 * 1. Reads the `iss` claim from the JWT
 * 2. Matches it against the providers listed here
 * 3. Fetches the public keys from the JWKS endpoint
 * 4. Verifies the JWT signature
 * 5. If valid, populates ctx.auth.getUserIdentity() with the token claims
 *
 * SETUP:
 * Replace YOUR_WORKOS_CLIENT_ID with your actual WorkOS Client ID.
 * You can find it in the WorkOS Dashboard under API Keys.
 */

const clientId = process.env.WORKOS_CLIENT_ID ?? 'WORKOS_CLIENT_ID_NOT_SET'

export default {
  providers: [
    {
      // Provider 1: SSO-based authentication
      // Validates JWTs issued when users log in via enterprise SSO (SAML/OIDC)
      domain: 'https://api.workos.com',
      applicationID: 'convex',
    },
    {
      // Provider 2: User Management authentication
      // Validates JWTs issued when users log in via email/password, social, or magic link
      domain: `https://api.workos.com/user_management/${clientId}`,
      applicationID: 'convex',
    },
  ],
}
