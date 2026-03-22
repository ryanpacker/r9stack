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

| Technology | Purpose | Docs |
|-----------|---------|------|
| [TanStack Start](https://tanstack.com/start) | Full-stack React framework with SSR | [Docs](https://tanstack.com/start/latest/docs/overview) |
| [TanStack Router](https://tanstack.com/router) | Type-safe file-based routing | [Docs](https://tanstack.com/router/latest/docs/overview) |
| [React 19](https://react.dev) | UI rendering | [Docs](https://react.dev/reference/react) |
| [Convex](https://convex.dev) | Real-time backend and database | [Docs](https://docs.convex.dev) |
| [WorkOS AuthKit](https://workos.com) | Authentication and SSO | [Docs](https://workos.com/docs/user-management) |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first styling | [Docs](https://tailwindcss.com/docs) |
| [shadcn/ui](https://ui.shadcn.com) | UI component library | [Docs](https://ui.shadcn.com/docs) |
| [Vite](https://vite.dev) | Dev server and build tool | [Docs](https://vite.dev/guide) |

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

| Variable | Source |
|----------|--------|
| `WORKOS_CLIENT_ID` | [WorkOS Dashboard](https://dashboard.workos.com) > API Keys |
| `WORKOS_API_KEY` | [WorkOS Dashboard](https://dashboard.workos.com) > API Keys |
| `WORKOS_REDIRECT_URI` | Set to `http://localhost:3000/auth/callback` for local dev |
| `WORKOS_COOKIE_PASSWORD` | Any random string, 32+ characters |
| `VITE_CONVEX_URL` | Set automatically by `npx convex dev` |

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

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npx convex dev` | Start the Convex backend (required alongside dev server) |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |
| `npm run check` | Run both linting and formatting checks |
| `npm run test` | Run tests with Vitest |

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
└── *.ts             # Backend queries and mutations
```

See **[R9STACK.md](./R9STACK.md)** for detailed architecture documentation, code patterns, and conventions.

---

<!-- TODO: Add any additional sections relevant to your project (deployment, contributing, license, etc.) -->
