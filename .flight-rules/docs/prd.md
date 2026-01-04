# Product Requirements Document

## Overview

r9stack is a CLI tool that scaffolds opinionated SaaS projects with a fully functional "walking skeleton"—a complete frontend, backend, and database stack with auth pre-integrated. Developers run a single command and get a production-ready foundation to immediately start building on.

The project addresses a key friction point in agentic coding workflows: while AI has dramatically accelerated feature development, initial project setup—configuring the frontend framework, wiring up the backend and database, integrating auth providers—remains tedious and error-prone.

## Goals

1. **Zero-to-running in minutes** – Run `r9stack init` and have a scaffolded full-stack app (frontend, backend, database, auth) ready to configure and run
2. **Production-ready foundations** – The generated skeleton follows best practices for security, performance, and maintainability across all layers of the stack
3. **Agentic-coding friendly** – Structure and conventions that AI coding assistants can easily understand and extend
4. **Clear setup guidance** – For steps the CLI cannot automate (creating third-party accounts, obtaining API keys), provide clear, concise instructions with direct links to the relevant pages
5. **Optional deployment integration** – Offer to create GitHub repositories and deploy to Vercel for users who want a complete CI/CD pipeline from the start

## Non-Goals

- **Framework flexibility (v1)** – No choosing between Next.js vs TanStack Start; the stack is opinionated
- **TanStack Start option configurability (v1)** – Options like package manager, git initialization are not exposed; sensible defaults are used (documented for future versions)
- **Multi-tenancy** – Not included in initial scope
- **Payments (v1)** – Stripe integration deferred to post-V1
- **Custom domain-specific features** – r9stack provides infrastructure, not business logic

## Architecture

### Starter-Based Project Creation

r9stack leverages TanStack Start's starter system to create projects. This approach:

1. **CLI invokes TanStack Start** with a `--starter` flag pointing to a hosted `starter.json`
2. **TanStack Start creates the base project** and applies r9stack customizations (files, dependencies, deletions)
3. **CLI performs post-creation steps** that the starter system cannot handle (interactive prompts, external service setup)

### Starter Organization

Starters live in the `/starters/` directory of the r9stack repository:

| Directory | JSON ID | Hosted URL | Description |
|-----------|---------|------------|-------------|
| `/starters/standard/` | `r9-starter-standard` | `https://r9stack.dev/starters/standard.json` | Full-featured starter with auth, database, UI |

### Website Integration

The r9stack.dev website (separate private repository) hosts:
- Compiled `starter.json` files at `/starters/*.json`
- Documentation and marketing content

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
| `r9stack init [project-name]` | Scaffold a new project |

## User Stories

- **As a solo developer**, I want to run a single command to scaffold a complete full-stack project so that I can focus on building my product's unique features
- **As an AI-assisted developer**, I want clear project structure and conventions so that my coding agent can understand and extend the codebase effectively
- **As a bootstrapper**, I want production-ready infrastructure with all the major technology decisions already made
- **As a new user**, I want clear instructions with links for any manual setup steps
- **As a developer who uses GitHub**, I want the option to automatically create a GitHub repository for my new project
- **As a developer deploying to Vercel**, I want the option to automatically set up Vercel hosting

## Generated Project Features (v1)

- [x] TanStack Start frontend with SSR, file-based routing
- [ ] Convex backend with schema and example functions
- [ ] shadcn/ui component library with Tailwind CSS 4
- [ ] User authentication via WorkOS AuthKit
- [ ] Session management with iron-session
- [ ] Application shell with collapsible sidebar
- [ ] Protected routes pattern (`/app/*` authenticated, `/` public)
- [ ] Development environment setup with `.env.example`

## Route Structure

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Public landing page | No |
| `/auth/sign-in` | Redirects to WorkOS AuthKit | No |
| `/auth/callback` | Handles OAuth callback | No |
| `/auth/sign-out` | Clears session, redirects home | No |
| `/app/*` | Protected application routes | Yes |

## Constraints

- **Solo maintainer** – Scope must remain achievable for one person
- **Opinionated stack** – Reduces flexibility but ensures cohesion
- **Dependency on third-party services** – WorkOS, Convex have their own limitations
- **Manual setup required** – CLI cannot create accounts on behalf of users
- **Starter URL requirement** – TanStack Start's `--starter` flag requires HTTP/HTTPS URL

## Success Criteria

1. New user can run `r9stack init` and have a scaffolded project in under 5 minutes
2. CLI provides clear, actionable instructions for all manual setup steps
3. Generated codebase works well with AI coding assistants
4. Optional GitHub/Vercel integrations work seamlessly

## Future Considerations (v2+)

- Package manager selection (npm, pnpm, yarn, bun)
- Multiple starter templates (minimal, enterprise)
- Upgrade command for existing projects
