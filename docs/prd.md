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

r9stack leverages TanStack Start's [starter system](tanstack-start-starter-system.md) to create projects. This approach:

1. **CLI invokes TanStack Start** with a `--starter` flag pointing to a hosted `starter.json`
2. **TanStack Start creates the base project** and applies r9stack customizations (files, dependencies, deletions)
3. **CLI performs post-creation steps** that the starter system cannot handle (interactive prompts, external service setup)

```
r9stack init [project-name]
    │
    ├─► Prompt for project name (if not provided)
    │
    ├─► npx @tanstack/create-start@latest <name> --starter https://r9stack.dev/starters/standard.json
    │
    ├─► Guide user through Convex setup
    │
    ├─► Guide user through WorkOS setup
    │
    ├─► Prompt: Create GitHub repository? (optional)
    │
    └─► Prompt: Deploy to Vercel? (optional)
```

### Starter Organization

Starters live in the `/starters/` directory of the r9stack repository:

| Directory | JSON ID | Hosted URL | Description |
|-----------|---------|------------|-------------|
| `/starters/standard/` | `r9-starter-standard` | `https://r9stack.dev/starters/standard.json` | Full-featured starter with auth, database, UI |

Future starters may include minimal versions, enterprise templates, etc.

### Website Integration

The r9stack.dev website (separate private repository) hosts:
- Compiled `starter.json` files at `/starters/*.json`
- Documentation and marketing content

The CLI hardcodes the starter URL. When a new starter version is ready, it is published to the website.

## Tech Stack

### CLI Tool

| Component | Technology |
|-----------|------------|
| Language | TypeScript |
| Runtime | Node.js |
| Distribution | npm package |
| Dependencies | commander, @inquirer/prompts, execa, picocolors |

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

Future versions may add commands for upgrades, component additions, etc.

## User Stories

- **As a solo developer**, I want to run a single command to scaffold a complete full-stack project (frontend, backend, database, auth) so that I can focus on building my product's unique features
- **As an AI-assisted developer**, I want clear project structure and conventions across the frontend, backend, and API layers so that my coding agent can understand and extend the codebase effectively
- **As a bootstrapper**, I want production-ready infrastructure with all the major technology decisions already made so that I don't have to revisit foundational decisions later
- **As a new user**, I want clear instructions with links for any manual setup steps (creating WorkOS account, Convex project) so that I can complete the full setup without searching for documentation
- **As a developer who uses GitHub**, I want the option to automatically create a GitHub repository for my new project
- **As a developer deploying to Vercel**, I want the option to automatically set up Vercel hosting for my new project

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

## Post-Creation Workflow

After the project is scaffolded, the CLI guides users through:

### 1. Convex Setup
- Instructions for running `npx convex dev`
- Link to Convex dashboard for project creation
- Explanation of environment variables needed

### 2. WorkOS Setup
- Link to WorkOS dashboard
- Instructions for configuring redirect URIs
- Explanation of required environment variables (client ID, API key, cookie password)

### 3. GitHub Repository (Optional)
- Prompt user: "Would you like to create a GitHub repository for this project?"
- If yes, use GitHub CLI or API to create repo and push initial commit
- Handle authentication if needed

### 4. Vercel Deployment (Optional)
- Prompt user: "Would you like to deploy this project to Vercel?"
- If yes, use Vercel CLI to link and deploy
- Configure environment variables in Vercel dashboard

## Constraints

- **Solo maintainer** – Scope must remain achievable for one person
- **Opinionated stack** – Reduces flexibility but ensures cohesion and maintainability
- **Dependency on third-party services** – WorkOS, Convex have their own limitations and pricing
- **Manual setup required** – The CLI cannot create accounts on behalf of users; clear guidance must bridge this gap
- **Interactive Convex setup** – `npx convex dev` requires user interaction (browser auth)
- **Starter URL requirement** – TanStack Start's `--starter` flag requires an HTTP/HTTPS URL; local file paths are not supported

## Success Criteria

1. A new user can run `r9stack init` and have a scaffolded full-stack project in under 5 minutes
2. The CLI provides clear, actionable instructions (with links) for all manual setup steps
3. The generated codebase is structured such that Claude Code or similar agents can effectively navigate and extend it
4. The user successfully uses an r9stack-generated project as the foundation for at least one production SaaS application
5. Optional GitHub/Vercel integrations work seamlessly for users who opt in

## Future Considerations (v2+)

These items are documented for future planning but explicitly deferred from v1:

### TanStack Start Options
The starter system overrides certain options (`framework`, `mode`, `typescript`, `tailwind`). The following options are NOT overridden and could be exposed in future versions:
- `packageManager` (npm, pnpm, yarn, bun) – currently defaults to npm
- `git` (initialize git repo) – currently defaults to true

### Multiple Starters
The architecture supports multiple starter templates. Future starters might include:
- `r9-starter-minimal` – Bare-bones setup without full UI
- `r9-starter-enterprise` – Additional features for larger teams

### Upgrade Command
A future `r9stack upgrade` command could update existing projects with newer starter changes (though the TanStack starter system doesn't natively support this).
