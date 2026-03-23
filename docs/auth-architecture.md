# Auth Architecture: TanStack Start + Convex + WorkOS

This document explains how authentication works across the three components of the r9stack auth template. Read this before diving into the code — understanding the full picture will make every implementation detail click.

---

## Table of Contents

1. [The Three Components and Their Roles](#1-the-three-components-and-their-roles)
2. [The Token Flow (End-to-End)](#2-the-token-flow-end-to-end)
3. [The Five Convex Function Auth Patterns](#3-the-five-convex-function-auth-patterns)
4. [Convex Terminology Guide](#4-convex-terminology-guide)
5. [WorkOS RBAC Explained](#5-workos-rbac-explained)
6. [M2M Without Paid Features](#6-m2m-without-paid-features)
7. [Key Architectural Decisions](#7-key-architectural-decisions)
8. [Common Mistakes and Pitfalls](#8-common-mistakes-and-pitfalls)

---

## 1. The Three Components and Their Roles

Think of the auth system as three layers, each with a distinct job:

```
+-----------------------+
|     WorkOS AuthKit    |   <-- "The Bouncer"
|  Identity Provider    |   Issues JWT tokens, manages users,
|  Login UI, SSO, MFA   |   handles SSO, MFA, RBAC
+-----------------------+
          |
          | JWT tokens (access_token + refresh_token)
          v
+-----------------------+
|   TanStack Start      |   <-- "The Receptionist"
|  Full-Stack Framework  |   Manages sessions via cookies,
|  Routing, SSR, Server  |   refreshes tokens, serves pages,
|  Functions, Middleware  |   gates route access
+-----------------------+
          |
          | JWT token sent with every Convex call
          v
+-----------------------+
|       Convex          |   <-- "The Vault"
|   Backend Database    |   Validates JWT tokens, enforces
|   Real-time Sync      |   per-function access control,
|   Server Functions     |   stores and serves data
+-----------------------+
```

### WorkOS AuthKit — The Identity Provider

**What it does**: Handles everything about *who the user is*.

- Provides a hosted login UI (or you can build custom)
- Supports email/password, social login (Google, GitHub, etc.), SSO, MFA
- Manages user profiles, organizations, and team memberships
- Implements RBAC: roles and permissions, scoped to organizations
- Issues JWT tokens containing user identity and permission claims

**What it does NOT do**: Store your app data, enforce access to your API, or know anything about your business logic.

### TanStack Start — The Full-Stack Framework

**What it does**: Handles everything about *how the user interacts with your app*.

- Routes users to pages (file-based routing)
- Server-side renders pages for performance and SEO
- Manages auth sessions via encrypted cookies (HttpOnly, Secure)
- Provides middleware that automatically refreshes expired tokens
- Offers server functions (`createServerFn`) for server-only logic
- Gates access to routes (e.g., redirect to login if not authenticated)

**What it does NOT do**: Store data, validate tokens cryptographically, or enforce backend access control.

### Convex — The Backend

**What it does**: Handles everything about *your data and business logic*.

- Stores all application data in a real-time database
- Exposes functions (queries, mutations, actions) that the client calls
- Validates JWT tokens against WorkOS's JWKS (public keys)
- Provides `ctx.auth.getUserIdentity()` in every function to check who's calling
- Enforces per-function access control — the last line of defense
- Supports real-time subscriptions (UI auto-updates when data changes)

**What it does NOT do**: Handle login UI, manage sessions, or issue tokens.

### Why All Three Are Needed

| Concern | WorkOS | TanStack Start | Convex |
|---------|--------|---------------|--------|
| User login/signup | Yes | No | No |
| Session management | No | Yes | No |
| Route protection | No | Yes | No |
| Token issuance | Yes | No | No |
| Token refresh | No | Yes (middleware) | No |
| Token validation | No | No | Yes |
| Data storage | No | No | Yes |
| Per-function auth | No | No | Yes |
| RBAC config | Yes | No | No |
| RBAC enforcement | No | No | Yes |

**The key insight**: Route-level protection (TanStack Start) is *necessary but not sufficient*. A determined attacker could bypass your frontend and call Convex functions directly using your deployment URL. That's why Convex-level auth is the *last line of defense* — it validates the token and checks permissions on every function call.

---

## 2. The Token Flow (End-to-End)

Here's exactly what happens from the moment a user clicks "Sign In" to the moment they see protected data:

### Step 1: User Initiates Login

```
User clicks "Sign In" button
  --> Browser navigates to /auth/sign-in route
  --> TanStack Start server function calls getSignInUrl()
  --> Browser redirects to WorkOS hosted login page
```

### Step 2: WorkOS Authenticates the User

```
User enters credentials on WorkOS login page
  --> WorkOS validates credentials (password, SSO, social, MFA)
  --> WorkOS generates an authorization code
  --> WorkOS redirects to your callback URL: /auth/callback?code=xxx
```

### Step 3: Token Exchange (Server-Side)

```
TanStack Start receives the callback
  --> authkitMiddleware() exchanges the code for tokens:
      - access_token (JWT, short-lived ~5 min)
      - refresh_token (long-lived, used to get new access tokens)
  --> Tokens stored in an encrypted HttpOnly cookie
  --> Browser redirects to /app (the protected area)
```

### Step 4: On Every Request — Token Refresh

```
Browser makes any request (page load, navigation)
  --> authkitMiddleware() runs on EVERY request
  --> Reads the encrypted cookie
  --> If access_token is expired:
      - Uses refresh_token to get a new access_token from WorkOS
      - Updates the cookie with new tokens
  --> Makes getAuth() available in route loaders
```

### Step 5: Client Gets the Token

```
React app renders in the browser
  --> AuthKitProvider initializes
  --> useAuth() hook provides: user info, loading state, signOut
  --> useAccessToken() hook provides: the current JWT access token
```

### Step 6: Convex Receives the Token

```
ConvexProviderWithAuth wraps your app
  --> Uses a bridge hook (useAuthFromWorkOS) that:
      1. Gets isAuthenticated from WorkOS useAuth()
      2. Gets accessToken from useAccessToken()
      3. Returns { isLoading, isAuthenticated, fetchAccessToken }
  --> Convex client sends the JWT with EVERY request to Convex backend
```

### Step 7: Convex Validates the Token

```
Convex backend receives a function call + JWT
  --> Checks the JWT against auth.config.ts providers:
      - Verifies the signature using WorkOS's JWKS (public keys)
      - Checks expiration, issuer, audience
  --> If valid: ctx.auth.getUserIdentity() returns the user's identity
  --> If invalid/missing: ctx.auth.getUserIdentity() returns null
  --> Your function code decides what to do with that information
```

### The Complete Picture

```
                          WorkOS
                         (login UI)
                            |
                     auth code returned
                            |
                            v
  Browser  <--- cookies --- TanStack Start --- token exchange ---> WorkOS API
     |                      (middleware)
     |                         |
     |                    getAuth() for SSR
     |                         |
     v                         v
  React App               Route Loaders
  (useAuth,               (server-side
   useAccessToken)         rendering)
     |
     | JWT sent with every call
     v
   Convex
   (validates JWT,
    ctx.auth.getUserIdentity(),
    enforces per-function auth)
```

---

## 3. The Five Convex Function Auth Patterns

Every Convex function in your app will fall into one of these five patterns. The auth template includes a working example of each.

### Pattern A: Public Functions

**When to use**: Data that anyone should be able to read, whether logged in or not.

**Examples**: Public blog posts, product listings, FAQ content, system status.

```typescript
// convex/announcements.ts
import { query } from './_generated/server'

export const list = query({
  args: {},
  handler: async (ctx) => {
    // No auth check — intentionally public
    // Anyone can call this function, even without a JWT token
    return await ctx.db
      .query('announcements')
      .order('desc')
      .collect()
  },
})
```

**Key point**: The *absence* of `ctx.auth.getUserIdentity()` is a deliberate choice. You are saying: "This data is public and I'm okay with anyone accessing it."

### Pattern B: Authenticated Functions

**When to use**: Data that belongs to a specific user. The user must be logged in, and they can only see/modify their own data.

**Examples**: User's notes, their profile, their settings, their order history.

```typescript
// convex/notes.ts
import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Step 1: Check if the user is authenticated
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Step 2: Only return THIS user's data
    // identity.subject is the user's unique ID from WorkOS
    return await ctx.db
      .query('notes')
      .withIndex('by_user_id', (q) => q.eq('userId', identity.subject))
      .order('desc')
      .collect()
  },
})

export const create = mutation({
  args: { title: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Stamp the data with the user's ID — this is how we scope data per-user
    return await ctx.db.insert('notes', {
      userId: identity.subject,
      title: args.title,
      content: args.content,
      createdAt: Date.now(),
    })
  },
})
```

**Key point**: `identity.subject` is the WorkOS user ID. It comes from the `sub` claim in the JWT. This is your primary key for user-scoped data.

### Pattern C: Role-Based Functions

**When to use**: Operations that only certain users (e.g., admins) should be able to perform.

**Examples**: Managing system settings, viewing all users, deleting any content, accessing admin dashboards.

```typescript
// convex/adminSettings.ts
import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Check for specific permissions from WorkOS RBAC
    // These come from the JWT claims, set in the WorkOS Dashboard
    // The identity object may contain custom claims from your JWT
    // For WorkOS, permissions are typically in a custom claim
    const customClaims = identity as Record<string, unknown>
    const permissions = (customClaims.permissions as string[]) ?? []

    if (!permissions.includes('settings:read')) {
      throw new Error('Forbidden: requires settings:read permission')
    }

    return await ctx.db.query('admin_settings').collect()
  },
})
```

**Key point**: Permissions are configured in the WorkOS Dashboard, not in your code. Your code only *checks* what WorkOS already decided. See [Section 5](#5-workos-rbac-explained) for setup instructions.

### Pattern D: Internal Functions

**When to use**: Logic that should only run server-side, triggered by other Convex functions. Never callable from the client.

**Examples**: Audit logging, background jobs, data aggregation, sending notifications, cascading updates.

```typescript
// convex/auditLog.ts
import { internalMutation, internalQuery } from './_generated/server'
import { v } from 'convex/values'

// This function can ONLY be called from other Convex functions
// It does NOT appear in the client API — there is no api.auditLog.record
export const record = internalMutation({
  args: {
    action: v.string(),
    userId: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('audit_logs', {
      ...args,
      timestamp: Date.now(),
    })
  },
})
```

**How another function calls it**:
```typescript
// Inside a mutation in notes.ts
import { internal } from './_generated/api'

// After creating a note...
await ctx.runMutation(internal.auditLog.record, {
  action: 'note:created',
  userId: identity.subject,
  details: `Created note: ${args.title}`,
})
```

**Key point**: `internalMutation` and `internalQuery` use `internal.moduleName.functionName` instead of `api.moduleName.functionName`. The `api` object only contains public functions; `internal` contains internal ones.

### Pattern E: HTTP Actions with API Keys (M2M)

**When to use**: External systems (scripts, CI/CD, partner APIs, mobile backends) that need to access your Convex data programmatically, without a browser.

**Examples**: Webhook handlers, data import scripts, external service integrations, automated testing.

```typescript
// convex/http.ts
import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'

const http = httpRouter()

http.route({
  path: '/api/announcements',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    // Validate API key from Authorization header
    const authHeader = request.headers.get('Authorization')
    const apiKey = process.env.API_KEY

    if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // API key is valid — call internal function for data
    const data = await ctx.runQuery(internal.announcements.listInternal)

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }),
})

export default http
```

**Key point**: The API key is stored as a Convex environment variable (`npx convex env set API_KEY "your-secret-key"`). It never touches client-side code. HTTP actions are the only Convex functions exposed as HTTP endpoints.

---

## 4. Convex Terminology Guide

If you're new to Convex, here's a quick reference for the terms you'll encounter:

| Term | What It Is | Reactive? | Called From |
|------|-----------|-----------|-------------|
| **Query** | Read-only function. Returns data. | Yes — UI auto-updates when data changes | Client (`useQuery`) or other functions |
| **Mutation** | Read-write function. Can insert/update/delete data. | No — but triggers queries to re-run | Client (`useMutation`) or other functions |
| **Action** | Can call external APIs (fetch, third-party SDKs). Not transactional. | No | Client (`useAction`) or other functions |
| **HTTP Action** | A function exposed as an HTTP endpoint (GET, POST, etc.). | No | Any HTTP client (curl, fetch, Postman) |
| **Internal Function** | Any of the above, but NOT callable from the client. Only from other Convex functions. | Depends on type | Other Convex functions only |
| **Scheduled Function** | A function that runs at a specific time or on a recurring schedule. | No | Scheduled by other functions |

### The `ctx` Object

Every Convex function receives a `ctx` (context) object with these properties:

- **`ctx.db`** — Database operations (query, insert, patch, delete)
- **`ctx.auth`** — Authentication info
  - `ctx.auth.getUserIdentity()` — Returns the user's identity (from JWT) or `null`
- **`ctx.runQuery()`** — Call another query from within a function
- **`ctx.runMutation()`** — Call another mutation from within a function
- **`ctx.runAction()`** — Call another action from within a function
- **`ctx.scheduler`** — Schedule functions to run later

### The `identity` Object

When `ctx.auth.getUserIdentity()` returns a non-null value, it contains:

| Field | Type | Description |
|-------|------|-------------|
| `subject` | string | The user's unique ID (WorkOS user ID) |
| `issuer` | string | Who issued the token (WorkOS) |
| `tokenIdentifier` | string | A unique identifier combining issuer and subject |
| `email` | string? | User's email (if included in JWT) |
| `name` | string? | User's display name (if included in JWT) |

Additional custom claims from WorkOS (like `permissions`, `role`, `org_id`) may also be present on the identity object.

---

## 5. WorkOS RBAC Explained

### The Concept

RBAC (Role-Based Access Control) lets you define *what users can do* based on *which role they have*.

```
Roles       --->     Permissions       --->     Your Code Checks
"admin"              "settings:read"            if (permissions.includes('settings:read'))
                     "settings:write"
                     "users:manage"

"member"             "notes:read"               if (permissions.includes('notes:read'))
                     "notes:write"
```

### How It Works in WorkOS

1. **You define roles** in the WorkOS Dashboard (e.g., "admin", "member", "viewer")
2. **You define permissions** as slugs (e.g., "settings:read", "settings:write")
3. **You assign permissions to roles** (e.g., "admin" gets all permissions)
4. **You assign roles to users** within an organization
5. **WorkOS includes permissions in the JWT** automatically — no extra API calls

### Setting Up RBAC in WorkOS Dashboard

1. Go to **WorkOS Dashboard** > **Roles**
2. Create roles:
   - `admin` — Full access
   - `member` — Standard access (default for new users)
3. Go to **Permissions**
4. Create permissions:
   - `settings:read` — Can view admin settings
   - `settings:write` — Can modify admin settings
   - `users:manage` — Can manage other users
   - `notes:read` — Can read own notes
   - `notes:write` — Can create/edit own notes
5. Assign permissions to roles:
   - `admin`: all permissions
   - `member`: `notes:read`, `notes:write`
6. Create an **Organization** and add users with roles

### Organization Scoping

WorkOS RBAC is scoped to organizations. This means:
- The same user can be an `admin` in Organization A but a `member` in Organization B
- Permissions are evaluated as "does this user have this permission *in this organization*?"
- The JWT includes the user's role and permissions for their *currently active* organization

### Checking Permissions in Convex

```typescript
const identity = await ctx.auth.getUserIdentity()
if (!identity) throw new Error('Not authenticated')

// Access custom claims from the JWT
const claims = identity as Record<string, unknown>
const permissions = (claims.permissions as string[]) ?? []
const role = claims.role as string | undefined
const orgId = claims.org_id as string | undefined

// Check specific permission
if (!permissions.includes('settings:read')) {
  throw new Error('Forbidden')
}
```

---

## 6. M2M Without Paid Features

Machine-to-machine (M2M) access is when a non-browser client (script, server, CI/CD pipeline) needs to call your API. WorkOS offers M2M via OAuth client credentials, but it requires paid features.

**Our approach**: Use Convex HTTP Actions with simple API key validation. No external service needed.

### How It Works

```
External Client                          Convex
(script, server)                      (HTTP Action)

  1. Set API_KEY env var        --->   API_KEY stored as Convex env var
  2. Make HTTP request          --->   HTTP action receives request
     with Bearer token                 Validates: Authorization === Bearer ${API_KEY}
  3. Receive JSON response      <---   Calls internal functions, returns data
```

### Setting Up API Keys

```bash
# Generate a secure random key
openssl rand -base64 32

# Store it as a Convex environment variable
npx convex env set API_KEY "your-generated-key-here"
```

### Calling the API

```bash
# Get announcements via the HTTP action
curl -H "Authorization: Bearer your-generated-key-here" \
  https://your-deployment.convex.site/api/announcements
```

### When to Scale Beyond API Keys

Simple API keys are perfect for:
- Internal tools and scripts
- CI/CD pipelines
- A small number of known clients
- Development and testing

Consider upgrading to JWT-based M2M (WorkOS or custom) when you need:
- Multiple clients with different permissions
- Token expiration and rotation
- Audit trails per-client
- Revoking individual client access without rotating the shared key

---

## 7. Key Architectural Decisions

### Why `@workos/authkit-tanstack-react-start` Replaces `iron-session`

The standard template manually handles sessions with `iron-session`:
- Manually builds WorkOS authorization URLs
- Manually exchanges auth codes for tokens
- Manually stores tokens in encrypted cookies
- Manually checks token expiration

The AuthKit SDK does all of this automatically:
- `authkitMiddleware()` handles token refresh on every request
- `getAuth()` replaces manual cookie reading
- `getSignInUrl()` replaces manual URL construction
- `signOut()` replaces manual cookie deletion

**The result**: Less code to maintain, fewer bugs, automatic handling of edge cases (token rotation, concurrent refresh, cookie security).

### Why `ConvexProviderWithAuth` Replaces `ConvexProvider`

The standard template uses a plain `ConvexProvider`:
```tsx
// Old: Convex has NO idea who the user is
<ConvexProvider client={convex}>
  {children}
</ConvexProvider>
```

The auth template uses `ConvexProviderWithAuth`:
```tsx
// New: Convex receives the JWT with every call
<ConvexProviderWithAuth client={convex} useAuth={useAuthFromWorkOS}>
  {children}
</ConvexProviderWithAuth>
```

The `useAuth` prop is a hook that returns `{ isLoading, isAuthenticated, fetchAccessToken }`. Convex calls `fetchAccessToken()` to get the JWT and sends it with every request. This is what enables `ctx.auth.getUserIdentity()` to work in your Convex functions.

### Why Dual JWT Providers in `auth.config.ts`

WorkOS issues JWTs from two different issuers depending on how the user authenticated:

1. **SSO login** (via enterprise SAML/OIDC): Issuer is `https://api.workos.com/`
2. **User Management login** (email/password, social): Issuer is `https://api.workos.com/user_management/{clientId}`

Both use the same JWKS endpoint for key verification, but the `iss` claim differs. Your `auth.config.ts` must list both so Convex can validate either type.

### Why the Bridge Hook Pattern

`ConvexProviderWithAuth` expects a `useAuth` hook with a specific interface. WorkOS's `useAuth()` and `useAccessToken()` hooks have a different interface. The bridge hook translates between them:

```typescript
function useAuthFromWorkOS() {
  const { isLoaded, user } = useAuth()          // WorkOS hook
  const { accessToken } = useAccessToken()        // WorkOS hook

  const fetchAccessToken = useCallback(async () => {
    return accessToken ?? null
  }, [accessToken])

  return {
    isLoading: !isLoaded,
    isAuthenticated: !!user,
    fetchAccessToken,
  }
}
```

---

## 8. Common Mistakes and Pitfalls

### 1. Forgetting Convex-Level Auth

**Mistake**: Only checking auth in TanStack Start route guards, not in Convex functions.

**Why it's dangerous**: Anyone who knows your Convex deployment URL can call your functions directly via the Convex client SDK, bypassing your frontend entirely.

**Fix**: Always call `ctx.auth.getUserIdentity()` in Convex functions that need auth. Route guards are a UX feature (redirect to login), not a security feature.

### 2. Using `api` Instead of `internal` for Server-Only Functions

**Mistake**: Making a function public when it should be internal.

```typescript
// WRONG: This is callable from the client
export const record = mutation({ ... })

// RIGHT: This is only callable from other Convex functions
export const record = internalMutation({ ... })
```

### 3. Not Scoping Data by User

**Mistake**: Returning all notes instead of filtering by `userId`.

```typescript
// WRONG: Returns ALL users' notes
return await ctx.db.query('notes').collect()

// RIGHT: Only returns THIS user's notes
return await ctx.db
  .query('notes')
  .withIndex('by_user_id', (q) => q.eq('userId', identity.subject))
  .collect()
```

### 4. Infinite Loops in the Auth Bridge

**Mistake**: Creating a new `fetchAccessToken` callback on every render.

```typescript
// WRONG: New function reference every render = infinite Convex reconnections
const fetchAccessToken = async () => accessToken

// RIGHT: Stable reference with useCallback
const fetchAccessToken = useCallback(async () => {
  return accessToken ?? null
}, [accessToken])
```

### 5. Calling `getAuth()` in `beforeLoad` (Client-Side Execution)

**Mistake**: Using `getAuth()` in `beforeLoad` which runs on both server and client.

```typescript
// WRONG: beforeLoad runs on client during navigation
beforeLoad: async () => {
  const auth = await getAuth()  // Fails on client!
}

// RIGHT: Use in loader (server-only during SSR) or check differently
loader: async () => {
  const auth = await getAuth()  // Only runs on server
}
```

### 6. Hardcoding Permissions

**Mistake**: Defining role/permission logic in your code instead of using WorkOS RBAC.

```typescript
// WRONG: Hardcoded role check
if (user.email === 'admin@company.com') { ... }

// RIGHT: Check the permission from the JWT
if (permissions.includes('settings:read')) { ... }
```

Roles and permissions should be managed in the WorkOS Dashboard, not in your codebase.

---

## Summary

| Layer | Responsibility | Key Function/Hook |
|-------|---------------|-------------------|
| WorkOS | Issue JWT, manage users, define RBAC | Dashboard config |
| TanStack Start | Manage sessions, refresh tokens, gate routes | `authkitMiddleware()`, `getAuth()` |
| Convex | Validate JWT, enforce per-function auth | `ctx.auth.getUserIdentity()` |
| Bridge Hook | Connect WorkOS SDK to Convex provider | `useAuthFromWorkOS()` |
| HTTP Actions | Provide API access for non-browser clients | `httpAction()` + API key validation |

The golden rule: **Never trust the client. Always validate in Convex.**
