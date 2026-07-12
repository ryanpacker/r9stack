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

### 3. Start the Convex backend

```bash
npx convex dev
```

This sets `VITE_CONVEX_URL` in `.env.local` automatically. Leave it running.

### 4. Set the WorkOS variables ON the Convex deployment (required)

Convex validates WorkOS JWTs on **its own servers**, which do **not** read your
`.env`. Set them on the deployment, or every Convex call fails with
`Unauthenticated` even after you sign in — this is the #1 setup trap:

```bash
npx convex env set WORKOS_CLIENT_ID <your_client_id>
npx convex env set WORKOS_API_KEY  <your_api_key>
```

### 5. Configure WorkOS in the dashboard (required)

In the [WorkOS Dashboard](https://dashboard.workos.com):

1. **Redirects** → add the login redirect `http://localhost:3000/auth/callback`,
   and a **Sign-out redirect** `http://localhost:3000/`.
2. **Authentication → Sessions → Configure JWT Template** → add an **`aud`
   claim set to your Client ID**, plus profile claims. In the template editor:

   ```json
   {
     "aud": "client_YOUR_CLIENT_ID",
     "email": "{{ user.email }}",
     "given_name": "{{ user.first_name }}",
     "family_name": "{{ user.last_name }}",
     "picture": "{{ user.profile_picture_url }}"
   }
   ```

   Replace `client_YOUR_CLIENT_ID` with your literal Client ID. This is
   **mandatory**: real AuthKit access tokens carry no `aud` by default, so
   Convex's first provider (`applicationID: clientId`) never matches and
   `getUserIdentity()` stays null until you add it. The `email` / `given_name` /
   `family_name` / `picture` claims are what `users.upsertFromIdentity` reads to
   populate the user's profile — the dashboard editor lists the exact `{{ }}`
   variables available, so confirm the names there. There is no API for the JWT
   template; this step is dashboard-only.

   > Using Convex's zero-config AuthKit (`convex.json` `authKit` block, included)
   > with a Convex-managed WorkOS account? `npx convex dev` provisions the
   > redirect URIs, env vars, and JWT template for you in dev, so you can skip
   > steps 4–5 for local development. Steps 4–5 are the bring-your-own-WorkOS
   > and preview/prod path.
3. **Authentication** → enable the sign-in methods you want.

### 6. Start the frontend

```bash
npm run dev
```

### 7. (Optional) Configure RBAC

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
