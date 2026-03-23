# __PROJECT_NAME__

A production-grade authentication template built with [TanStack Start](https://tanstack.com/start), [Convex](https://convex.dev), and [WorkOS AuthKit](https://authkit.com).

## What's Included

This template demonstrates **five auth patterns** for Convex functions:

| Pattern | Demo Page | Description |
|---------|-----------|-------------|
| **Public** | `/app/demo/public-data` | No auth check. Anyone can call. |
| **Authenticated** | `/app/demo/private-notes` | Requires JWT. Data scoped per-user. |
| **Role-Based** | `/app/demo/admin-panel` | Checks WorkOS RBAC permissions. |
| **Internal** | `/app/demo/audit-log` | Server-only. Cannot be called from client. |
| **API / M2M** | `/app/demo/api-access` | HTTP Actions with API key auth. |

## Quick Start

### Prerequisites

- Node.js 18+
- A [Convex](https://convex.dev) account (free)
- A [WorkOS](https://workos.com) account (free)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Fill in:
- `WORKOS_CLIENT_ID` — From [WorkOS Dashboard](https://dashboard.workos.com) > API Keys
- `WORKOS_API_KEY` — From WorkOS Dashboard > API Keys
- `WORKOS_REDIRECT_URI` — `http://localhost:3000/auth/callback`
- `WORKOS_COOKIE_PASSWORD` — Generate with `openssl rand -base64 32`

### 3. Start the Dev Servers

In one terminal, start the Convex backend:

```bash
npx convex dev
```

This will also set `VITE_CONVEX_URL` in your `.env.local` file automatically.

In another terminal, start the frontend:

```bash
npm run dev
```

### 4. Configure WorkOS

In the [WorkOS Dashboard](https://dashboard.workos.com):

1. Go to **Redirects** and add `http://localhost:3000/auth/callback`
2. Go to **Authentication** and enable the sign-in methods you want

### 5. (Optional) Configure RBAC

To enable the Admin Panel demo:

1. Go to **Roles** and create an `admin` role
2. Go to **Permissions** and create `settings:read` and `settings:write`
3. Assign both permissions to the `admin` role
4. Create an **Organization** and add your user with the admin role

### 6. (Optional) Configure API Access

To enable the API Access demo:

```bash
# Generate an API key
openssl rand -base64 32

# Store it in Convex
npx convex env set API_KEY "your-generated-key"
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start |
| Routing | TanStack Router (file-based) |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui |
| Backend | Convex |
| Auth | WorkOS AuthKit |
| Build | Vite 7 |
| Server | Nitro |

## Architecture

See `docs/auth-architecture.md` for a comprehensive explanation of how authentication works across all three components.

### Key Files

| File | Purpose |
|------|---------|
| `convex/auth.config.ts` | JWT provider configuration (dual WorkOS issuers) |
| `convex/schema.ts` | Database schema with auth-pattern annotations |
| `src/start.ts` | Server middleware (authkitMiddleware) |
| `src/lib/convex-auth.ts` | Bridge hook connecting WorkOS to Convex |
| `src/components/ConvexAuthProvider.tsx` | Provider chain setup |

## Adding shadcn/ui Components

```bash
npx shadcn add <component-name>
```

Components are installed to `src/components/ui/` and can be freely customized.

## Learn More

- [Auth Architecture Guide](docs/auth-architecture.md) — How the auth system works
- [Convex Docs](https://docs.convex.dev) — Database and functions
- [WorkOS Docs](https://workos.com/docs) — Authentication and RBAC
- [TanStack Start Docs](https://tanstack.com/start) — Framework
