# __PROJECT_NAME__

<!-- TODO: Replace this with a description of your project -->

A web application built with [r9stack](https://github.com/ryanpacker/r9stack).

## Features

<!-- TODO: Replace these with your project's actual features -->

- Feature one
- Feature two
- Feature three

---

## Tech Stack

This project was scaffolded with r9stack and includes the following technologies:

| Technology                                     | Purpose                             | Docs                                                     |
| ---------------------------------------------- | ----------------------------------- | -------------------------------------------------------- |
| [TanStack Start](https://tanstack.com/start)   | Full-stack React framework with SSR | [Docs](https://tanstack.com/start/latest/docs/overview)  |
| [TanStack Router](https://tanstack.com/router) | Type-safe file-based routing        | [Docs](https://tanstack.com/router/latest/docs/overview) |
| [React 19](https://react.dev)                  | UI rendering                        | [Docs](https://react.dev/reference/react)                |
| [Convex](https://convex.dev)                   | Real-time backend and database      | [Docs](https://docs.convex.dev)                          |
| [WorkOS AuthKit](https://workos.com)           | Authentication and SSO              | [Docs](https://workos.com/docs/user-management)          |
| [Tailwind CSS 4](https://tailwindcss.com)      | Utility-first styling               | [Docs](https://tailwindcss.com/docs)                     |
| [shadcn/ui](https://ui.shadcn.com)             | UI component library                | [Docs](https://ui.shadcn.com/docs)                       |
| [Vite](https://vite.dev)                       | Dev server and build tool           | [Docs](https://vite.dev/guide)                           |

For a detailed guide on the architecture, patterns, and conventions used in this project, see **[R9STACK.md](./R9STACK.md)**.

## Getting Started

### Prerequisites

- Node.js 18+
- A [Convex](https://dashboard.convex.dev) account
- A [WorkOS](https://dashboard.workos.com) account

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable                 | Source                                                      |
| ------------------------ | ----------------------------------------------------------- |
| `WORKOS_CLIENT_ID`       | [WorkOS Dashboard](https://dashboard.workos.com) > API Keys |
| `WORKOS_API_KEY`         | [WorkOS Dashboard](https://dashboard.workos.com) > API Keys |
| `WORKOS_REDIRECT_URI`    | Set to `http://localhost:3000/auth/callback` for local dev  |
| `WORKOS_COOKIE_PASSWORD` | Random string, 32+ characters (`openssl rand -base64 24`)   |
| `VITE_CONVEX_URL`        | Set automatically by `npx convex dev`                       |

### One-Time Auth Setup (required)

Authentication won't work until you complete these three steps:

1. **Set the WorkOS variables on the Convex deployment.** Convex validates
   auth tokens and provisions users on its own servers, which do **not** read
   your `.env` file:

   ```bash
   npx convex env set WORKOS_CLIENT_ID client_xxx
   npx convex env set WORKOS_API_KEY sk_xxx
   ```

   This is the #1 setup trap — if you skip it, every Convex call fails with
   `Unauthenticated` even after signing in.

2. **Register redirect URIs in the WorkOS dashboard** (Redirects section):
   - **Login redirect:** `http://localhost:3000/auth/callback`
   - **Sign-out redirect:** `http://localhost:3000/` — must be added in the
     dashboard (there is no API for sign-out redirects). Without it, signing
     out strands users on a WorkOS error page.
   - Optionally set the **Sign-in endpoint** (initiate login URL) to
     `http://localhost:3000/auth/sign-in`.

3. **Generate a session cookie password** (32+ characters) for
   `WORKOS_COOKIE_PASSWORD` in `.env`:

   ```bash
   openssl rand -base64 24
   ```

### Running the App

The app requires two processes running simultaneously:

```bash
# Terminal 1 — Start the Convex backend
npx convex dev

# Terminal 2 — Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

## Development

### Commands

| Command          | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `npm run dev`    | Start the development server                             |
| `npx convex dev` | Start the Convex backend (required alongside dev server) |
| `npm run build`  | Build for production                                     |
| `npm run start`  | Start the production server                              |
| `npm run lint`   | Run ESLint                                               |
| `npm run format` | Run Prettier                                             |
| `npm run check`  | Run both linting and formatting checks                   |
| `npm run test`   | Run tests with Vitest                                    |

### Adding UI Components

This project uses [shadcn/ui](https://ui.shadcn.com). To add a new component:

```bash
npx shadcn add <component-name>
```

For example:

```bash
npx shadcn add dialog
npx shadcn add card
npx shadcn add input
```

Components are installed to `src/components/ui/` and can be freely modified.

### Project Structure

```
src/
├── routes/          # File-based routing
│   ├── index.tsx    # Public landing page (/)
│   ├── auth/        # Auth flow routes
│   └── app/         # Protected application routes (/app/*)
├── components/      # React components
│   └── ui/          # shadcn/ui components
└── lib/             # Utilities, auth, and shared code

convex/
├── schema.ts        # Database schema
├── auth.config.ts   # WorkOS JWT validation (Convex-side auth)
├── functions.ts     # authedQuery/authedMutation wrappers — use these for all public functions
├── users.ts         # Login-time user provisioning (ensureUser)
└── *.ts             # Backend queries and mutations
```

### Security Model

Convex functions are authenticated at the data plane: every public function
validates the caller's WorkOS JWT and resolves the verified user as
`ctx.user`. When adding functions, always use `authedQuery` / `authedMutation`
from `convex/functions.ts` (never the raw builders) and never accept caller
identity as an argument. See [convex/README.md](./convex/README.md) and
[AGENTS.md](./AGENTS.md) for the full rules.

See **[R9STACK.md](./R9STACK.md)** for detailed architecture documentation, code patterns, and conventions.

---

<!-- TODO: Add any additional sections relevant to your project (deployment, contributing, license, etc.) -->
