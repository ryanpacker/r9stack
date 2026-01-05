# Progress

A running log of sessions and milestones.

---

## Session Logs

### 2026-01-04 - CLI Update for Starter System

- Updated CLI to use TanStack Start's `--starter` flag
- Created `src/utils/starters.ts` to fetch starters from GitHub-hosted `starters.json`
- Modified `src/utils/exec.ts` to pass starter URL to `npx @tanstack/create-start`
- Updated `src/commands/init.ts` with post-creation guidance for Convex and WorkOS
- Added `--starter-list` option to display available starters
- Updated README with new status, usage, and tech stack

Key changes:
- CLI now fetches default starter automatically (no `--starter` flag needed by user)
- Post-creation messages guide users through Convex and WorkOS setup
- Starters index hosted at GitHub raw URL

---

### 2026-01-03 19:54 - Standard Starter Project Build

- Built the standard starter project in `/starters/standard/` using TanStack Start + shadcn add-ons
- Synced all custom files from `tmp/r9teststack` (auth, components, routes, Convex)
- Resolved dev server issues (port conflicts, missing dependencies)
- Starter project verified running at localhost:3000

See: [Session Log](session_logs/20260103_1954_session.md)

---

### 2026-01-03 - Architecture Overhaul Planning

- Planned significant architectural overhaul to use TanStack Start's starter system
- Created comprehensive documentation for the starter-based approach
- Established directory structure: `/starters/`, `/tests/`
- Created implementation areas (1-5) with index files
- Updated PRD, README, and all supporting documentation

Key decisions:
- CLI will use `--starter` flag to create projects from hosted `starter.json`
- Starters hosted at r9stack.dev (separate private repository)
- Starter naming: directory `/starters/standard/`, JSON ID `r9-starter-standard`
- Optional GitHub/Vercel integration added to scope

Documentation created:
- `docs/tanstack-start-starter-system.md` - Comprehensive starter system reference
- `docs/starter-development.md` - Guide for creating/modifying starters
- `docs/implementation/*/index.md` - Implementation area overviews
- Updated `docs/prd.md` with new architecture

Next steps:
- Build the `r9-starter-standard` template in `/starters/standard/`
- Update CLI to use `--starter` flag
- Implement post-creation workflow (Convex/WorkOS guidance)
- Add optional GitHub/Vercel integration

---

## Milestones

### v0.1.0 - Initial CLI
- Basic CLI scaffolding with TanStack Start
- Published to npm as `r9stack`

### v0.2.0 - Starter-Based Architecture
- Migrated to TanStack Start's starter system
- Full walking skeleton with Convex + WorkOS + shadcn/ui
- Post-creation setup guidance
- `--starter-list` option to view available starters

### v0.3.0 (Planned) - Optional Integrations
- GitHub repository creation
- Vercel deployment
