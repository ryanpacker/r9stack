/**
 * Convex Auth Configuration for WorkOS
 *
 * Note: For session-based auth with WorkOS AuthKit, the authentication
 * is handled at the TanStack Start layer using encrypted cookies.
 *
 * Convex queries will work in the authenticated context since the client
 * is already authenticated when making requests.
 *
 * For Convex-level authentication (validating tokens in Convex functions),
 * you would need to:
 * 1. Configure Convex with WorkOS as an OIDC provider
 * 2. Pass the access token from WorkOS to ConvexProviderWithAuth
 *
 * This file is a placeholder for that future enhancement.
 */

export default {
  providers: [
    // WorkOS OIDC provider configuration would go here
    // Example:
    // {
    //   domain: "https://api.workos.com",
    //   applicationID: process.env.WORKOS_CLIENT_ID,
    // }
  ],
}

