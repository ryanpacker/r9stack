# Product Requirements Document

## Overview

r9stack is an opinionated SaaS boilerplate that automates the tedious setup required for building modern SaaS applications. It provides a fully functional "walking skeleton"—a complete frontend, backend, and database stack with auth and payments pre-integrated—that developers can clone and immediately start building on.

The project addresses a key friction point in agentic coding workflows: while AI has dramatically accelerated feature development, initial project setup—configuring the frontend framework, wiring up the backend and database, integrating auth providers, setting up payments—remains tedious and error-prone.

## Goals

1. **Zero-to-running in minutes** – Clone the repo and have a working full-stack app (frontend, backend, database, auth, payments) immediately functional
2. **Production-ready foundations** – The skeleton should follow best practices for security, performance, and maintainability across all layers of the stack
3. **Agentic-coding friendly** – Structure and conventions that AI coding assistants can easily understand and extend
4. **Clear upgrade path** – Users can pull improvements from r9stack without breaking their customizations

## Non-Goals

- **Framework flexibility (v1)** – No choosing between Next.js vs TanStack Start; the stack is opinionated
- **CI/CD pipeline (v1)** – Deployment automation is planned for a future version
- **Multi-tenancy** – Not included in initial scope
- **Custom domain-specific features** – r9stack provides infrastructure, not business logic

## Tech Stack (v1)

| Layer | Technology |
|-------|------------|
| Frontend | React via TanStack Start |
| Backend | Convex |
| Database | Convex (built-in) |
| Auth | WorkOS (integrated with Convex) |
| Payments | Stripe |
| Styling | shadcn/ui (Tailwind CSS) |
| Hosting | TBD |

## User Stories

- **As a solo developer**, I want to clone a repo and have a complete full-stack app (frontend, backend, database, auth, payments) ready to extend so that I can focus on building my product's unique features
- **As an AI-assisted developer**, I want clear project structure and conventions across the frontend, backend, and API layers so that my coding agent can understand and extend the codebase effectively
- **As a bootstrapper**, I want production-ready infrastructure with all the major technology decisions already made so that I don't have to revisit foundational decisions later

## Walking Skeleton Features (v1)

- [ ] TanStack Start frontend with routing and basic application shell
- [ ] Convex backend with API patterns established
- [ ] Convex database configured and connected
- [ ] shadcn/ui component library configured with Tailwind
- [ ] User authentication via WorkOS + Convex integration
- [ ] Stripe payment integration (subscription-ready)
- [ ] Development environment setup

## Constraints

- **Solo maintainer** – Scope must remain achievable for one person
- **Opinionated stack** – Reduces flexibility but ensures cohesion and maintainability
- **Dependency on third-party services** – WorkOS, Stripe, Convex all have their own limitations and pricing

## Success Criteria

1. A new user can clone the repo and have a running full-stack app in under 10 minutes
2. The codebase is structured such that Claude Code or similar agents can effectively navigate and extend it
3. The user successfully uses r9stack as the foundation for at least one production SaaS application

