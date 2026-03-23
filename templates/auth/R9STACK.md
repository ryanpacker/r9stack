# __PROJECT_NAME__ — Architecture Guide

This document covers the architecture, conventions, and patterns used in this project. It is the definitive reference for how things work and why they are structured this way.

---

## Table of Contents

1. [Stack Overview](#stack-overview)
2. [Project Structure](#project-structure)
3. [Authentication Architecture](#authentication-architecture)
4. [Convex Function Auth Patterns](#convex-function-auth-patterns)
5. [WorkOS RBAC Setup](#workos-rbac-setup)
6. [API Access (M2M)](#api-access-m2m)
7. [Routing](#routing)
8. [Styling](#styling)
9. [Common Patterns](#common-patterns)
10. [Common Mistakes](#common-mistakes)

---

## Stack Overview

| Layer | Technology | Role |
|-------|-----------|------|
| Framework | TanStack Start | SSR, routing, server functions, middleware |
| Router | TanStack Router | File-based routing with type safety |
| UI | React 19 | Component rendering |
| Styling | Tailwind CSS 4 + shadcn/ui | Design system |
| Backend | Convex | Real-time database, server functions |
| Auth Provider | WorkOS AuthKit | User management, SSO, RBAC |
| Auth Bridge | @workos/authkit-tanstack-react-start | Session management for TanStack Start |
| Build | Vite 7 | Development server and bundler |
| Server | Nitro | Server runtime |

---

## Project Structure

```
├── convex/                  # Backend (runs on Convex servers)
│   ├── _generated/          # Auto-generated types (do not edit)
│   ├── auth.config.ts       # JWT validation configuration
│   ├── schema.ts            # Database schema
│   ├── announcements.ts     # Pattern A: Public functions
│   ├── notes.ts             # Pattern B: Authenticated functions
│   ├── adminSettings.ts     # Pattern C: Role-based functions
│   ├── auditLog.ts          # Pattern D: Internal functions
│   ├── auditLogReader.ts    # Public read wrapper for audit log
│   ├── users.ts             # User sync from JWT identity
│   └── http.ts              # Pattern E: HTTP Actions (M2M)
│
├── src/
│   ├── start.ts             # Server entry: authkitMiddleware
│   ├── router.tsx            # Router configuration
│   ├── styles.css            # Tailwind theme (shadcn)
│   │
│   ├── lib/
│   │   ├── convex-auth.ts   # Auth bridge hook (WorkOS → Convex)
│   │   └── utils.ts          # cn() utility
│   │
│   ├── components/
│   │   ├── ConvexAuthProvider.tsx  # Provider chain (critical)
│   │   ├── AppShell.tsx      # Main layout
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   ├── NavItem.tsx       # Sidebar nav link
│   │   ├── NavGroup.tsx      # Collapsible nav section
│   │   ├── UserMenu.tsx      # User dropdown
│   │   └── ui/               # shadcn/ui components
│   │
│   └── routes/
│       ├── __root.tsx         # Root layout + providers
│       ├── index.tsx          # Landing page (public)
│       ├── auth/
│       │   ├── sign-in.tsx    # → WorkOS login
│       │   ├── callback.tsx   # ← WorkOS callback
│       │   └── sign-out.tsx   # Clear session
│       └── app/
│           ├── route.tsx      # Auth guard for all /app/* routes
│           ├── index.tsx      # Dashboard
│           └── demo/
│               ├── public-data.tsx     # Pattern A demo
│               ├── private-notes.tsx   # Pattern B demo
│               ├── admin-panel.tsx     # Pattern C demo
│               ├── audit-log.tsx       # Pattern D demo
│               └── api-access.tsx      # Pattern E demo
│
├── public/                   # Static assets
├── .env.example              # Environment variable template
├── package.json
├── vite.config.ts
└── README.md
```

---

## Authentication Architecture

### The Three Layers

```
WorkOS AuthKit — Issues JWT tokens, manages users, SSO, MFA, RBAC
       ↓
TanStack Start — Manages sessions (cookies), refreshes tokens, gates routes
       ↓
Convex — Validates JWT tokens, enforces per-function access control
```

### Provider Chain

The auth providers must be nested in this exact order:

```tsx
<AuthKitProvider>                    // WorkOS — provides auth context
  <ConvexProviderWithAuth            // Convex — sends JWT with every call
    client={convex}
    useAuth={useAuthFromWorkOS}      // Bridge hook
  >
    {children}                       // Your app
  </ConvexProviderWithAuth>
</AuthKitProvider>
```

This is set up in `src/components/ConvexAuthProvider.tsx`.

### Token Flow

1. User clicks Sign In → redirected to WorkOS hosted login
2. WorkOS authenticates → redirects back with auth code
3. `authkitMiddleware()` exchanges code for tokens → stores in encrypted cookie
4. On each request, middleware refreshes expired tokens automatically
5. Client gets token via `useAccessToken()` hook
6. `ConvexProviderWithAuth` sends JWT with every Convex function call
7. Convex validates JWT → `ctx.auth.getUserIdentity()` returns user identity

### Key Insight

Route-level protection (redirecting to login) is a **UX feature**, not a security feature. The real security is at the Convex level — each function validates the JWT and checks permissions independently.

---

## Convex Function Auth Patterns

### Pattern A: Public

```typescript
// No auth check — intentionally public
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query('announcements').collect()
  },
})
```

### Pattern B: Authenticated

```typescript
export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    return await ctx.db.query('notes')
      .withIndex('by_user_id', (q) => q.eq('userId', identity.subject))
      .collect()
  },
})
```

### Pattern C: Role-Based

```typescript
export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')

    const permissions = getPermissions(identity)
    if (!permissions.includes('settings:read')) {
      throw new Error('Forbidden')
    }

    return await ctx.db.query('admin_settings').collect()
  },
})
```

### Pattern D: Internal

```typescript
// Only callable from other Convex functions
export const record = internalMutation({
  args: { action: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert('audit_logs', { ...args, timestamp: Date.now() })
  },
})
```

### Pattern E: HTTP Actions

```typescript
http.route({
  path: '/api/announcements',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get('Authorization')
    if (authHeader !== `Bearer ${process.env.API_KEY}`) {
      return new Response('Unauthorized', { status: 401 })
    }
    const data = await ctx.runQuery(internal.announcements.listInternal)
    return new Response(JSON.stringify(data))
  }),
})
```

---

## WorkOS RBAC Setup

1. Create roles in WorkOS Dashboard (e.g., "admin", "member")
2. Create permissions (e.g., "settings:read", "settings:write")
3. Assign permissions to roles
4. Assign roles to users within organizations
5. Permissions are included in JWT automatically
6. Check permissions in Convex: `identity.permissions`

---

## API Access (M2M)

For non-browser clients (scripts, CI/CD, external services):

```bash
# 1. Generate API key
openssl rand -base64 32

# 2. Store in Convex
npx convex env set API_KEY "your-key"

# 3. Call the endpoint
curl -H "Authorization: Bearer your-key" \
  https://your-deployment.convex.site/api/announcements
```

---

## Routing

File-based routing via TanStack Router:

- Files in `src/routes/` automatically become routes
- `route.tsx` files define layouts and middleware (e.g., auth guards)
- `index.tsx` files define the default page for a directory
- Dots in filenames become slashes: `convex.messages.tsx` → `/convex/messages`

### Adding a Protected Page

1. Create a file in `src/routes/app/` — it's automatically protected by the auth guard in `app/route.tsx`
2. Add a nav item in `src/components/Sidebar.tsx`

---

## Styling

- Tailwind CSS 4 with Vite integration
- shadcn/ui components in `src/components/ui/`
- Theme tokens in `src/styles.css` (OKLch color space)
- `cn()` utility in `src/lib/utils.ts` for class merging

Add more shadcn components:
```bash
npx shadcn add <component-name>
```

---

## Common Patterns

### Using auth in a component
```tsx
import { useAuth } from '@workos/authkit-tanstack-react-start/client'
const { user, isLoaded } = useAuth()
```

### Using Convex data
```tsx
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

const data = useQuery(api.module.functionName)  // undefined | T[]
const doThing = useMutation(api.module.functionName)
await doThing({ arg: 'value' })
```

### Syncing user on login
```tsx
const upsertUser = useMutation(api.users.upsertFromIdentity)
// Call after authentication to ensure user record exists in Convex
useEffect(() => { if (isAuthenticated) upsertUser() }, [isAuthenticated])
```

---

## Common Mistakes

1. **Only checking auth in route guards** — Always validate in Convex functions too
2. **Using `api` for server-only functions** — Use `internalMutation`/`internalQuery` instead
3. **Not scoping data by user** — Filter by `identity.subject`, not just checking if authenticated
4. **Infinite loops in auth bridge** — Use `useCallback` with proper dependencies
5. **Hardcoding roles in code** — Use WorkOS RBAC permissions, not email/name checks
6. **Calling `getAuth()` in `beforeLoad`** — It runs on client during navigation; use `loader` for SSR-only
