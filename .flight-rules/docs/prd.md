# Product Requirements Document

## Overview

r9stack is a CLI tool that scaffolds opinionated SaaS projects with a fully functional "walking skeleton"—a complete frontend, backend, and database stack with auth pre-integrated. Developers run a single command and get a production-ready foundation to immediately start building on.

The project addresses a key friction point in agentic coding workflows: while AI has dramatically accelerated feature development, initial project setup—configuring the frontend framework, wiring up the backend and database, integrating auth providers—remains tedious and error-prone.

## Goals

1. **Zero-to-running in minutes** – Run `r9stack init` and have a scaffolded full-stack app (frontend, backend, database, auth) ready to configure and run
2. **Production-ready foundations** – The generated skeleton follows best practices for security, performance, and maintainability across all layers of the stack
3. **Agentic-coding friendly** – Structure and conventions that AI coding assistants can easily understand and extend
4. **Clear setup guidance** – For steps the CLI cannot automate (creating third-party accounts, obtaining API keys), provide clear, concise instructions with direct links to the relevant pages

## Non-Goals

- **Framework flexibility (v1)** – No choosing between Next.js vs TanStack Start; the stack is opinionated
- **CI/CD pipeline (v1)** – Deployment automation is planned for a future version
- **Multi-tenancy** – Not included in initial scope
- **Payments (v1)** – Stripe integration deferred to post-V1
- **Custom domain-specific features** – r9stack provides infrastructure, not business logic

## Tech Stack

### CLI Tool

| Component | Technology |
|-----------|------------|
| Language | TypeScript |
| Runtime | Node.js |
| Distribution | npm package |

### Generated Project

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | React 19 via TanStack Start | SSR, file-based routing |
| Backend | Convex | Real-time, serverless |
| Database | Convex (built-in) | — |
| Auth | WorkOS AuthKit | Hosted sign-in flow |
| Sessions | iron-session | Encrypted cookie sessions |
| Styling | shadcn/ui + Tailwind CSS 4 | — |

## CLI Commands (v1)

| Command | Description |
|---------|-------------|
| `r9stack init` | Scaffold a new project in the current directory |

Future versions may add commands for upgrades, component additions, etc.

## User Stories

- **As a solo developer**, I want to run a single command to scaffold a complete full-stack project (frontend, backend, database, auth) so that I can focus on building my product's unique features
- **As an AI-assisted developer**, I want clear project structure and conventions across the frontend, backend, and API layers so that my coding agent can understand and extend the codebase effectively
- **As a bootstrapper**, I want production-ready infrastructure with all the major technology decisions already made so that I don't have to revisit foundational decisions later
- **As a new user**, I want clear instructions with links for any manual setup steps (creating WorkOS account, Convex project) so that I can complete the full setup without searching for documentation

## Generated Project Features (v1)

The `r9stack init` command generates a project with:

- [x] TanStack Start frontend with SSR, file-based routing
- [ ] Convex backend with schema and example functions
- [ ] Convex database configured and connected
- [ ] shadcn/ui component library with Tailwind CSS 4
- [ ] User authentication via WorkOS AuthKit
- [ ] Session management with iron-session (encrypted cookies)
- [ ] Application shell with collapsible sidebar
- [ ] Protected routes pattern (`/app/*` authenticated, `/` public)
- [ ] Development environment setup with `.env.example`
- [ ] Setup instructions for third-party services (WorkOS, Convex)

## Route Structure

The generated project follows this route pattern:

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Public landing page | No |
| `/auth/sign-in` | Redirects to WorkOS AuthKit | No |
| `/auth/callback` | Handles OAuth callback | No |
| `/auth/sign-out` | Clears session, redirects home | No |
| `/app/*` | Protected application routes | Yes |

The `/app/route.tsx` file contains the auth guard that redirects unauthenticated users.

## Constraints

- **Solo maintainer** – Scope must remain achievable for one person
- **Opinionated stack** – Reduces flexibility but ensures cohesion and maintainability
- **Dependency on third-party services** – WorkOS, Convex have their own limitations and pricing
- **Manual setup required** – The CLI cannot create accounts on behalf of users; clear guidance must bridge this gap
- **Interactive Convex setup** – `npx convex dev` requires user interaction (browser auth)

## Success Criteria

1. A new user can run `r9stack init` and have a scaffolded full-stack project in under 5 minutes
2. The CLI provides clear, actionable instructions (with links) for all manual setup steps
3. The generated codebase is structured such that Claude Code or similar agents can effectively navigate and extend it
4. The user successfully uses an r9stack-generated project as the foundation for at least one production SaaS application
