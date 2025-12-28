# Product Requirements Document

## Overview

r9stack is a CLI tool that scaffolds opinionated SaaS projects with a fully functional "walking skeleton"—a complete frontend, backend, and database stack with auth and payments pre-integrated. Developers run a single command and get a production-ready foundation to immediately start building on.

The project addresses a key friction point in agentic coding workflows: while AI has dramatically accelerated feature development, initial project setup—configuring the frontend framework, wiring up the backend and database, integrating auth providers, setting up payments—remains tedious and error-prone.

## Goals

1. **Zero-to-running in minutes** – Run `r9stack init` and have a scaffolded full-stack app (frontend, backend, database, auth, payments) ready to configure and run
2. **Production-ready foundations** – The generated skeleton follows best practices for security, performance, and maintainability across all layers of the stack
3. **Agentic-coding friendly** – Structure and conventions that AI coding assistants can easily understand and extend
4. **Clear setup guidance** – For steps the CLI cannot automate (creating third-party accounts, obtaining API keys), provide clear, concise instructions with direct links to the relevant pages

## Non-Goals

- **Framework flexibility (v1)** – No choosing between Next.js vs TanStack Start; the stack is opinionated
- **CI/CD pipeline (v1)** – Deployment automation is planned for a future version
- **Multi-tenancy** – Not included in initial scope
- **Custom domain-specific features** – r9stack provides infrastructure, not business logic

## Tech Stack

### CLI Tool

| Component | Technology |
|-----------|------------|
| Language | TypeScript |
| Runtime | Node.js |
| Distribution | npm package |

### Generated Project

| Layer | Technology |
|-------|------------|
| Frontend | React via TanStack Start |
| Backend | Convex |
| Database | Convex (built-in) |
| Auth | WorkOS (integrated with Convex) |
| Payments | Stripe |
| Styling | shadcn/ui (Tailwind CSS) |
| Hosting | TBD |

## CLI Commands (v1)

| Command | Description |
|---------|-------------|
| `r9stack init` | Scaffold a new project in the current directory |

Future versions may add commands for upgrades, component additions, etc.

## User Stories

- **As a solo developer**, I want to run a single command to scaffold a complete full-stack project (frontend, backend, database, auth, payments) so that I can focus on building my product's unique features
- **As an AI-assisted developer**, I want clear project structure and conventions across the frontend, backend, and API layers so that my coding agent can understand and extend the codebase effectively
- **As a bootstrapper**, I want production-ready infrastructure with all the major technology decisions already made so that I don't have to revisit foundational decisions later
- **As a new user**, I want clear instructions with links for any manual setup steps (creating WorkOS account, Convex project, Stripe keys) so that I can complete the full setup without searching for documentation

## Generated Project Features (v1)

The `r9stack init` command generates a project with:

- [ ] TanStack Start frontend with routing and basic application shell
- [ ] Convex backend with API patterns established
- [ ] Convex database configured and connected
- [ ] shadcn/ui component library configured with Tailwind
- [ ] User authentication via WorkOS + Convex integration
- [ ] Stripe payment integration (subscription-ready)
- [ ] Development environment setup
- [ ] Setup instructions for third-party services (WorkOS, Convex, Stripe)

## Constraints

- **Solo maintainer** – Scope must remain achievable for one person
- **Opinionated stack** – Reduces flexibility but ensures cohesion and maintainability
- **Dependency on third-party services** – WorkOS, Stripe, Convex all have their own limitations and pricing
- **Manual setup required** – The CLI cannot create accounts on behalf of users; clear guidance must bridge this gap

## Success Criteria

1. A new user can run `r9stack init` and have a scaffolded full-stack project in under 5 minutes
2. The CLI provides clear, actionable instructions (with links) for all manual setup steps
3. The generated codebase is structured such that Claude Code or similar agents can effectively navigate and extend it
4. The user successfully uses an r9stack-generated project as the foundation for at least one production SaaS application
