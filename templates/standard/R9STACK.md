# R9STACK

This project was built using [r9stack](https://github.com/ryanpacker/r9stack), which provides a fully configured full-stack foundation with authentication, a real-time database, and a component library — all pre-wired and ready to build on.

The sections below describe the architecture, conventions, and patterns used throughout this project. This serves as a reference for both developers and coding agents working in this codebase.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | [TanStack Start](https://tanstack.com/start) | Full-stack React framework with SSR and file-based routing |
| UI | [React 19](https://react.dev) | Component rendering |
| Routing | [TanStack Router](https://tanstack.com/router) | Type-safe file-based routing |
| Backend & Database | [Convex](https://convex.dev) | Real-time backend with automatic subscriptions |
| Authentication | [WorkOS AuthKit](https://workos.com/docs/user-management) | SSO-ready authentication |
| Sessions | [iron-session](https://github.com/vvo/iron-session) | Encrypted cookie-based sessions |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) | Utility-first CSS |
| Components | [shadcn/ui](https://ui.shadcn.com) | Copy-paste component library built on Radix UI |
| Icons | [Lucide React](https://lucide.dev) | Icon library |
| Build | [Vite](https://vite.dev) | Dev server and bundler |

---

## Architecture

The application has three layers:

```
┌─────────────────────────────────────────────┐
│  TanStack Start (Frontend + Server Functions)│
│  React 19 · File-based routing · SSR        │
│  Auth via server functions + iron-session    │
├─────────────────────────────────────────────┤
│  Convex (Backend + Database)                │
│  Real-time queries · Mutations · Schema     │
│  Accessed via React hooks (useQuery, etc.)  │
├─────────────────────────────────────────────┤
│  WorkOS (Authentication Provider)           │
│  OAuth flow · User management · SSO         │
│  Integrated via server-side SDK             │
└─────────────────────────────────────────────┘
```

**Key architectural decisions:**
- Authentication is handled entirely server-side through TanStack Start server functions. The client receives auth state via a React context.
- Convex replaces a traditional REST/GraphQL API layer. There are no API routes. All data access goes through Convex queries and mutations.
- Server functions (`createServerFn`) run on the server within TanStack Start. They are used for auth operations, not for data access (that's Convex's job).

---

## Project Structure

```
src/
├── routes/                  # File-based routing (TanStack Router)
│   ├── __root.tsx           # Root layout — providers, meta tags, global styles
│   ├── index.tsx            # Public landing page (/)
│   ├── auth/
│   │   ├── sign-in.tsx      # Redirects to WorkOS sign-in
│   │   ├── callback.tsx     # Handles OAuth callback, creates session
│   │   └── sign-out.tsx     # Destroys session, redirects to /
│   └── app/
│       ├── route.tsx        # Auth guard + app shell layout for all /app/* routes
│       ├── index.tsx        # App home page (/app)
│       └── demo/
│           └── convex.messages.tsx  # Convex demo (/app/demo/convex/messages)
├── components/
│   ├── AuthProvider.tsx     # Auth context provider — hydrates user on mount
│   ├── ConvexClientProvider.tsx  # Convex client setup (client-side only)
│   ├── AppShell.tsx         # App layout with collapsible sidebar
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── NavGroup.tsx         # Collapsible nav section
│   ├── NavItem.tsx          # Individual nav link
│   ├── UserMenu.tsx         # User profile dropdown with sign-out
│   └── ui/                  # shadcn/ui components (add more with `npx shadcn add`)
├── lib/
│   ├── auth.ts              # Auth type definitions (User, SessionData)
│   ├── auth-client.ts       # useAuth() hook, AuthContext, signIn/signOut helpers
│   ├── auth-server.ts       # Server functions: getAuthUrl, getCurrentUser, handleAuthCallback, signOutServer
│   └── utils.ts             # cn() utility (clsx + tailwind-merge)
└── styles.css               # Tailwind config, CSS variables, theme tokens

convex/
├── schema.ts                # Database schema (tables, indexes)
├── messages.ts              # Message queries and mutations (demo)
└── auth.config.ts           # Auth config placeholder

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
WORKOS_COOKIE_PASSWORD=<32+ chars>   # Any random string, used to encrypt session cookies

VITE_CONVEX_URL=https://xxx.convex.cloud  # Set automatically by `npx convex dev`
```

Note: `VITE_CONVEX_URL` is set automatically when you run `npx convex dev` for the first time. The `WORKOS_*` variables must be configured manually from the [WorkOS Dashboard](https://dashboard.workos.com).

---

## Routing

Routes use **TanStack Router's file-based routing**. The file path determines the URL:

| File | URL | Purpose |
|------|-----|---------|
| `src/routes/index.tsx` | `/` | Public landing page |
| `src/routes/app/index.tsx` | `/app` | App home (protected) |
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

Authentication uses WorkOS AuthKit for the OAuth flow and iron-session for encrypted cookie-based sessions.

### How the auth flow works

1. User clicks "Sign In" → navigates to `/auth/sign-in`
2. `/auth/sign-in` calls `getAuthUrl()` server function → redirects to WorkOS hosted sign-in page
3. After sign-in, WorkOS redirects to `/auth/callback?code=xxx`
4. `/auth/callback` calls `handleAuthCallback()` → exchanges code for tokens, creates encrypted session cookie
5. User is redirected to `/app`

### How the auth guard works

`src/routes/app/route.tsx` has a `beforeLoad` hook that calls `getCurrentUser()`. If no session exists, the user is redirected to `/`. All routes under `/app/` inherit this guard automatically.

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

The `user` object has this shape:

```typescript
interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  profilePictureUrl: string | null
}
```

### Sign in and sign out

```tsx
import { useAuth } from '@/lib/auth-client'

function MyComponent() {
  const { signIn, signOut } = useAuth()

  return (
    <>
      <button onClick={signIn}>Sign In</button>
      <button onClick={signOut}>Sign Out</button>
    </>
  )
}
```

These functions navigate to `/auth/sign-in` and `/auth/sign-out` respectively.

---

## Convex Backend

[Convex](https://docs.convex.dev) is the backend and database layer. It provides real-time queries that automatically re-render components when data changes.

### Schema

The database schema is defined in `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  messages: defineTable({
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

Define a query in `convex/`:

```typescript
// convex/messages.ts
import { query } from './_generated/server'

export const list = query({
  handler: async (ctx) => {
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

Define a mutation in `convex/`:

```typescript
// convex/messages.ts
import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const send = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert('messages', {
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

### Adding a new table

1. Add the table definition to `convex/schema.ts`
2. Create a new file in `convex/` for its queries and mutations
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

<Button variant="outline" size="sm">Click me</Button>
```

Available button variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`.

### The `cn()` utility

Use `cn()` to conditionally combine class names:

```tsx
import { cn } from '@/lib/utils'

<div className={cn('p-4 rounded-lg', isActive && 'bg-primary text-primary-foreground')} />
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

## Server Functions

TanStack Start server functions run on the server and are called from route loaders or client code. They are defined with `createServerFn`:

```typescript
import { createServerFn } from '@tanstack/react-start/server'

const myServerFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    // Runs on the server
    return { data: 'hello' }
  })
```

In this project, server functions are used **only for authentication** (`src/lib/auth-server.ts`). Data access should go through Convex, not server functions.

---

## Common Mistakes to Avoid

**Don't use `fetch()` or API routes for data access.**
Convex replaces the traditional API layer. Use `useQuery` and `useMutation` from `convex/react` instead. There are no REST endpoints to call.

**Don't use `useEffect` for data fetching.**
Convex's `useQuery` hook handles data fetching and real-time subscriptions automatically. Using `useEffect` + `fetch` bypasses Convex's reactivity.

**Don't import `auth-server.ts` in client components.**
The server auth module (`src/lib/auth-server.ts`) uses Node.js APIs and server-only packages. Use `useAuth()` from `auth-client.ts` for client-side auth state.

**Don't confuse server functions with Next.js server actions.**
TanStack Start uses `createServerFn`, not `"use server"`. The syntax and behavior differ.

**Don't manually refetch Convex queries.**
Convex queries are live subscriptions. When a mutation changes data, all related queries automatically update. There's no need for `refetch()`, `invalidateQueries()`, or cache management.

**Don't put protected pages outside of `src/routes/app/`.**
The auth guard only covers routes under `/app/`. A route at `src/routes/dashboard.tsx` would be publicly accessible.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/routes/__root.tsx` | Root layout, providers, meta tags |
| `src/routes/app/route.tsx` | Auth guard and app shell layout |
| `src/lib/auth-server.ts` | Server-side auth functions (do not import on client) |
| `src/lib/auth-client.ts` | `useAuth()` hook and auth context |
| `src/lib/auth.ts` | User and session type definitions |
| `src/components/Sidebar.tsx` | Navigation — edit this to add nav items |
| `src/components/ui/` | shadcn/ui components — add more with `npx shadcn add` |
| `convex/schema.ts` | Database schema — add tables here |
| `src/styles.css` | Theme tokens and CSS variables |
| `components.json` | shadcn/ui configuration |
| `.env` | Environment variables (never commit) |
