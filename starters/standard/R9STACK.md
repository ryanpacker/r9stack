# R9STACK

This project was built using [r9stack](https://github.com/ryanpacker/r9stack), which provides a fully configured full-stack foundation with authentication, a real-time database, and a component library — all pre-wired and ready to build on.

The sections below describe the architecture, conventions, and patterns used throughout this project. This serves as a reference for both developers and coding agents working in this codebase.

---

## Tech Stack

| Layer              | Technology                                                                                                                                                     | Purpose                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Framework          | [TanStack Start](https://tanstack.com/start)                                                                                                                   | Full-stack React framework with SSR and file-based routing  |
| UI                 | [React 19](https://react.dev)                                                                                                                                  | Component rendering                                         |
| Routing            | [TanStack Router](https://tanstack.com/router)                                                                                                                 | Type-safe file-based routing                                |
| Backend & Database | [Convex](https://convex.dev)                                                                                                                                   | Real-time backend with automatic subscriptions              |
| Authentication     | [WorkOS AuthKit](https://workos.com/docs/user-management) via [`@workos/authkit-tanstack-react-start`](https://github.com/workos/authkit-tanstack-react-start) | PKCE sign-in flow, session cookies, JWT access tokens       |
| Auth helpers       | [convex-helpers](https://github.com/get-convex/convex-helpers)                                                                                                 | Custom function builders (`authedQuery` / `authedMutation`) |
| Styling            | [Tailwind CSS 4](https://tailwindcss.com)                                                                                                                      | Utility-first CSS                                           |
| Components         | [shadcn/ui](https://ui.shadcn.com)                                                                                                                             | Copy-paste component library built on Radix UI              |
| Icons              | [Lucide React](https://lucide.dev)                                                                                                                             | Icon library                                                |
| Build              | [Vite](https://vite.dev)                                                                                                                                       | Dev server and bundler                                      |

---

## Architecture

The application has three layers:

```
┌──────────────────────────────────────────────────┐
│  TanStack Start (Frontend + Server Routes)       │
│  React 19 · File-based routing · SSR             │
│  AuthKit SDK middleware + PKCE sign-in routes    │
├──────────────────────────────────────────────────┤
│  Convex (Backend + Database)                     │
│  Validates WorkOS JWTs (auth.config.ts)          │
│  authedQuery/authedMutation inject ctx.user      │
├──────────────────────────────────────────────────┤
│  WorkOS (Authentication Provider)                │
│  AuthKit hosted login · JWKS · User management   │
└──────────────────────────────────────────────────┘
```

**Key architectural decisions:**

- **The Convex data plane is authenticated.** The Convex deployment URL ships in the client JS bundle, so anyone can call public functions directly — route guards in the web app protect nothing at the data layer. Every public Convex function therefore validates the caller's WorkOS JWT itself and derives identity from the verified token, never from client-supplied arguments.
- Authentication uses the official WorkOS AuthKit SDK (`@workos/authkit-tanstack-react-start`): request middleware in `src/start.ts`, PKCE sign-in/callback/sign-out routes, and client hooks. The SDK's access token is pushed into the Convex websocket via `ConvexProviderWithAuth`.
- Convex replaces a traditional REST/GraphQL API layer. There are no API routes. All data access goes through Convex queries, mutations, and actions.

---

## Project Structure

```
src/
├── start.ts                 # createStart with authkitMiddleware() — SDK session handling
├── routes/                  # File-based routing (TanStack Router)
│   ├── __root.tsx           # Root layout — AuthKitProvider, ConvexClientProvider, meta tags
│   ├── index.tsx            # Public landing page (/)
│   ├── auth/
│   │   ├── sign-in.tsx      # Redirects to WorkOS via SDK getSignInUrl (sets PKCE cookie)
│   │   ├── callback.tsx     # SDK handleCallbackRoute — completes the PKCE exchange
│   │   ├── sign-out.tsx     # SDK signOut — revokes the WorkOS session, absolute returnTo
│   │   └── unauthorized.tsx # Shown when server-side provisioning rejects the account
│   └── app/
│       ├── route.tsx        # Auth guard (getAuth) + EnsureProvisioned gate + app shell
│       ├── index.tsx        # App home page (/app)
│       └── demo/
│           └── convex.messages.tsx  # Convex demo (/app/demo/convex/messages)
├── components/
│   ├── ConvexClientProvider.tsx  # ConvexProviderWithAuth — bridges the AuthKit JWT to Convex
│   ├── AppShell.tsx         # App layout with collapsible sidebar
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── NavGroup.tsx         # Collapsible nav section
│   ├── NavItem.tsx          # Individual nav link
│   ├── UserMenu.tsx         # User profile dropdown with sign-out
│   └── ui/                  # shadcn/ui components (add more with `npx shadcn add`)
├── lib/
│   ├── auth.ts              # Re-exports the SDK User type
│   ├── auth-client.ts       # useAuth() hook and signIn helper (wraps the AuthKit SDK)
│   └── utils.ts             # cn() utility (clsx + tailwind-merge)
└── styles.css               # Tailwind config, CSS variables, theme tokens

convex/
├── schema.ts                # Database schema (tables, indexes)
├── auth.config.ts           # WorkOS JWT validation (dual customJwt providers)
├── functions.ts             # authedQuery / authedMutation / requireActionUser wrappers
├── users.ts                 # ensureUser provisioning action + getCurrent query
└── messages.ts              # Message queries and mutations (demo of the authed pattern)

.env                         # Environment variables (never commit)
```

---

## Running the App

The app requires two processes running simultaneously:

```bash
# Terminal 1 — Convex backend (connects to Convex cloud)
npx convex dev

# Terminal 2 — TanStack Start dev server
npm run dev
```

The app runs at `http://localhost:3000` by default.

---

## Environment Variables

Required in `.env`:

```
WORKOS_CLIENT_ID=client_xxx          # From WorkOS Dashboard > API Keys
WORKOS_API_KEY=sk_xxx                # From WorkOS Dashboard > API Keys
WORKOS_REDIRECT_URI=http://localhost:3000/auth/callback
WORKOS_COOKIE_PASSWORD=<32+ chars>   # openssl rand -base64 24

VITE_CONVEX_URL=https://xxx.convex.cloud  # Set automatically by `npx convex dev`
```

**The Convex deployment needs its own copies of the WorkOS variables** — `convex/auth.config.ts` (JWT validation) and `users.ensureUser` (provisioning) run on Convex's servers, which do not read `.env`:

```bash
npx convex env set WORKOS_CLIENT_ID client_xxx
npx convex env set WORKOS_API_KEY sk_xxx
```

If you skip this, every Convex call fails with `Unauthenticated` even after signing in. See the README's "One-Time Auth Setup" for the full checklist (including the WorkOS dashboard redirect registrations).

---

## Routing

Routes use **TanStack Router's file-based routing**. The file path determines the URL:

| File                                      | URL                         | Purpose               |
| ----------------------------------------- | --------------------------- | --------------------- |
| `src/routes/index.tsx`                    | `/`                         | Public landing page   |
| `src/routes/app/index.tsx`                | `/app`                      | App home (protected)  |
| `src/routes/app/demo/convex.messages.tsx` | `/app/demo/convex/messages` | Demo page (protected) |

### Route conventions

- **Public routes** go directly in `src/routes/`. They have no auth guard.
- **Protected routes** go in `src/routes/app/`. The auth guard in `src/routes/app/route.tsx` protects all child routes automatically.
- **Dots in filenames become URL slashes.** `convex.messages.tsx` becomes `/convex/messages`.
- **`route.tsx`** files define layouts and middleware for a route segment and its children.
- **`index.tsx`** files define the default page for a route segment.

### How to add a new protected page

Create a file in `src/routes/app/`:

```tsx
// src/routes/app/settings.tsx → /app/settings
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
    </div>
  )
}
```

Then add a nav item in `src/components/Sidebar.tsx` to link to it.

### How to add a new public page

Create a file in `src/routes/`:

```tsx
// src/routes/pricing.tsx → /pricing
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
})

function PricingPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Pricing</h1>
    </div>
  )
}
```

---

## Authentication

Authentication uses the official WorkOS AuthKit SDK for TanStack Start (`@workos/authkit-tanstack-react-start`). The SDK owns the session cookie, the PKCE flow, and token refresh; Convex validates the SDK's access token (a WorkOS-issued JWT) on every function call.

### How the auth flow works

1. User clicks "Sign In" → navigates to `/auth/sign-in`
2. `/auth/sign-in` redirects to the WorkOS hosted login via the SDK's `getSignInUrl()`. **Sign-in must always start here** — this step sets the PKCE verifier cookie the callback requires.
3. After sign-in, WorkOS redirects to `/auth/callback?code=xxx`, handled by the SDK's `handleCallbackRoute` (code exchange + session cookie), then redirects to `/app`
4. The app-layout gate (`EnsureProvisioned` in `src/routes/app/route.tsx`) calls the zero-argument `users.ensureUser` action, which fetches the user's profile **server-side from the WorkOS API** and creates/refreshes their `users` row in Convex
5. `ConvexClientProvider` pushes the SDK's access token into the Convex websocket, so every Convex function sees the verified identity via `ctx.auth.getUserIdentity()`

### How the auth guard works

`src/routes/app/route.tsx` has a `beforeLoad` hook that calls the SDK's `getAuth()`. If no session exists, the user is redirected to `/auth/sign-in`. All routes under `/app/` inherit this guard automatically. The guard controls page access only — data access is independently enforced by Convex (see below).

### Sign-out

Sign-out (`/auth/sign-out`) uses the SDK's `signOut({ returnTo })`, which clears the cookie **and revokes the WorkOS session server-side** — without revocation, the next sign-in silently reuses the old session. `returnTo` must be an **absolute URL matching a Sign-out redirect registered in the WorkOS dashboard**, which is why sign-out runs client-side where the origin is known.

### Accessing the authenticated user

On the client, use the `useAuth()` hook:

```tsx
import { useAuth } from '@/lib/auth-client'

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return null

  return <div>Hello, {user.firstName}</div>
}
```

The `user` object is the WorkOS AuthKit `User` (re-exported from `src/lib/auth.ts`): `id`, `email`, `firstName`, `lastName`, `profilePictureUrl`, etc.

Inside Convex functions, the authenticated caller's `users` row is `ctx.user` (see the next section) — use that, not client-passed identity.

### Sign in and sign out

```tsx
import { useAuth } from '@/lib/auth-client'

function MyComponent() {
  const { signIn, signOut } = useAuth()

  return (
    <>
      <button onClick={() => signIn()}>Sign In</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </>
  )
}
```

`signIn` navigates to `/auth/sign-in` (pass `'sign-up'` to show the registration screen); `signOut` revokes the session and returns to the origin.

### Restricting sign-ups (optional)

`convex/users.ts` has an `ALLOWED_EMAIL_DOMAINS` template hook. Leave it empty to allow anyone; list domains (e.g. `['yourcompany.com']`) to restrict sign-up to those email domains, enforced server-side during provisioning. Rejected users land on `/auth/unauthorized`.

---

## Convex Backend

[Convex](https://docs.convex.dev) is the backend and database layer. It provides real-time queries that automatically re-render components when data changes.

### The security rule (read this before writing any Convex function)

The Convex function API is reachable by anyone with the deployment URL, which ships in the client bundle. So:

- **Public queries and mutations use `authedQuery` / `authedMutation` from `convex/functions.ts`** — never the raw `query` / `mutation` builders from `_generated/server`. The wrappers reject unauthenticated callers and inject the verified caller's `users` row as `ctx.user`.
- **Public actions call `requireActionUser(ctx)`** at the top of the handler.
- **Never accept caller identity as an argument** (`workosId`, `email`, caller `userId`) — arguments are forgeable. The caller is always `ctx.user`.
- **Seeds, migrations, and crons use `internalQuery` / `internalMutation` / `internalAction`**, which are not exposed on the public API.
- The one exception is `users.ensureUser`, which provisions the `users` row at login and performs its own JWT check.

### Schema

The database schema is defined in `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  messages: defineTable({
    userId: v.id('users'),
    text: v.string(),
    createdAt: v.number(),
  }).index('by_created_at', ['createdAt']),

  users: defineTable({
    workosId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_workos_id', ['workosId'])
    .index('by_email', ['email']),
})
```

### Reading data (queries)

Define a query in `convex/` using the authed wrapper:

```typescript
// convex/messages.ts
import { authedQuery } from './functions'

export const list = authedQuery({
  args: {},
  handler: async (ctx) => {
    // ctx.user is the verified caller — available in every authed function
    return await ctx.db
      .query('messages')
      .withIndex('by_created_at')
      .order('desc')
      .collect()
  },
})
```

Use it in a component with `useQuery`:

```tsx
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

function MessageList() {
  const messages = useQuery(api.messages.list)

  if (messages === undefined) return <div>Loading...</div>

  return (
    <ul>
      {messages.map((msg) => (
        <li key={msg._id}>{msg.text}</li>
      ))}
    </ul>
  )
}
```

`useQuery` returns `undefined` while loading, then the data. It **automatically re-renders** when the data changes — no manual refetching needed.

### Writing data (mutations)

Define a mutation using the authed wrapper, attributing writes to `ctx.user`:

```typescript
// convex/messages.ts
import { v } from 'convex/values'
import { authedMutation } from './functions'

export const send = authedMutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert('messages', {
      userId: ctx.user._id, // the verified caller — never a client arg
      text: args.text,
      createdAt: Date.now(),
    })
  },
})
```

Use it in a component with `useMutation`:

```tsx
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

function SendMessage() {
  const sendMessage = useMutation(api.messages.send)

  const handleSubmit = async (text: string) => {
    await sendMessage({ text })
  }

  // ...
}
```

### Actions

Actions (for calling external APIs) authenticate with `requireActionUser`:

```typescript
// convex/myActions.ts
import { action } from './_generated/server'
import { requireActionUser } from './functions'

export const doSomething = action({
  args: {},
  handler: async (ctx) => {
    const user = await requireActionUser(ctx)
    // ... call external services as `user`
  },
})
```

### Adding a new table

1. Add the table definition to `convex/schema.ts`
2. Create a new file in `convex/` for its queries and mutations — public functions via `authedQuery` / `authedMutation`
3. Run `npx convex dev` (if not already running) — it auto-syncs schema changes

### Path alias for Convex imports

Convex auto-generates types in `convex/_generated/`. Import the API object from there:

```tsx
import { api } from '../../convex/_generated/api'
```

The path is relative because Convex's generated code lives outside `src/`. Use the relative import — don't try to alias it.

---

## UI and Styling

### Tailwind CSS

Use Tailwind utility classes directly in JSX:

```tsx
<div className="flex items-center gap-4 p-6 bg-background text-foreground">
  <h1 className="text-2xl font-bold">Title</h1>
</div>
```

Theme colors are defined as CSS variables in `src/styles.css` using OKLch color space. Use semantic color names like `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`, etc.

### shadcn/ui components

The project includes shadcn/ui with the `button` component pre-installed. To add more components:

```bash
npx shadcn add dialog
npx shadcn add card
npx shadcn add input
```

This copies components into `src/components/ui/`. They are regular React components you can modify freely.

Use them like:

```tsx
import { Button } from '@/components/ui/button'

;<Button variant="outline" size="sm">
  Click me
</Button>
```

Available button variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`.

### The `cn()` utility

Use `cn()` to conditionally combine class names:

```tsx
import { cn } from '@/lib/utils'

;<div
  className={cn(
    'p-4 rounded-lg',
    isActive && 'bg-primary text-primary-foreground',
  )}
/>
```

### Path aliases

The project uses `@/` as an alias for `src/`:

```tsx
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
```

---

## App Shell and Navigation

The application layout uses `AppShell` with a collapsible `Sidebar`. To add navigation items, edit `src/components/Sidebar.tsx`:

```tsx
<NavGroup label="Main" icon={LayoutDashboard}>
  <NavItem href="/app" icon={Home} label="Home" />
  <NavItem href="/app/settings" icon={Settings} label="Settings" />
</NavGroup>
```

`NavItem` uses TanStack Router's `Link` component and automatically highlights the active route.

---

## Common Mistakes to Avoid

**Don't use the raw `query` / `mutation` builders for public functions.**
Public Convex functions are callable by anyone with the deployment URL. Always use `authedQuery` / `authedMutation` from `convex/functions.ts` (or `requireActionUser` in actions). Reserve the raw builders' internal variants (`internalQuery`, `internalMutation`, `internalAction`) for seeds, migrations, and crons.

**Don't pass caller identity as a function argument.**
`workosId`, `email`, or caller-`userId` args can be forged by any caller. The verified caller is always `ctx.user` inside authed functions.

**Don't use `fetch()` or API routes for data access.**
Convex replaces the traditional API layer. Use `useQuery` and `useMutation` from `convex/react` instead. There are no REST endpoints to call.

**Don't use `useEffect` for data fetching.**
Convex's `useQuery` hook handles data fetching and real-time subscriptions automatically. Using `useEffect` + `fetch` bypasses Convex's reactivity.

**Don't hand-roll the sign-in redirect.**
Sign-in must start at `/auth/sign-in`, which uses the SDK's `getSignInUrl()` to set the PKCE verifier cookie. A hand-built WorkOS authorization URL will fail at the callback.

**Don't use a relative `returnTo` on sign-out.**
WorkOS requires an absolute URL matching a Sign-out redirect registered in the dashboard; a relative one strands users on an AuthKit error page.

**Don't manually refetch Convex queries.**
Convex queries are live subscriptions. When a mutation changes data, all related queries automatically update. There's no need for `refetch()`, `invalidateQueries()`, or cache management.

**Don't put protected pages outside of `src/routes/app/`.**
The auth guard only covers routes under `/app/`. A route at `src/routes/dashboard.tsx` would be publicly accessible.

**Don't forget the Convex deployment env vars.**
`npx convex env set WORKOS_CLIENT_ID ...` and `npx convex env set WORKOS_API_KEY ...` are required — Convex does not read `.env`.

---

## Key Files Reference

| File                                      | Purpose                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/start.ts`                            | AuthKit request middleware (SDK session handling)                                     |
| `src/routes/__root.tsx`                   | Root layout, AuthKitProvider + ConvexClientProvider, meta tags                        |
| `src/routes/app/route.tsx`                | Auth guard, provisioning gate, and app shell layout                                   |
| `src/lib/auth-client.ts`                  | `useAuth()` hook and `signIn` helper                                                  |
| `src/lib/auth.ts`                         | Re-export of the SDK `User` type                                                      |
| `src/components/ConvexClientProvider.tsx` | Bridges the AuthKit access token into Convex                                          |
| `src/components/Sidebar.tsx`              | Navigation — edit this to add nav items                                               |
| `src/components/ui/`                      | shadcn/ui components — add more with `npx shadcn add`                                 |
| `convex/auth.config.ts`                   | Convex-side WorkOS JWT validation                                                     |
| `convex/functions.ts`                     | `authedQuery` / `authedMutation` / `requireActionUser` — use for all public functions |
| `convex/users.ts`                         | Login-time provisioning (`ensureUser`) + optional email-domain restriction            |
| `convex/schema.ts`                        | Database schema — add tables here                                                     |
| `src/styles.css`                          | Theme tokens and CSS variables                                                        |
| `components.json`                         | shadcn/ui configuration                                                               |
| `.env`                                    | Environment variables (never commit)                                                  |
