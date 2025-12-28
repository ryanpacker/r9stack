# Critical Learnings

A curated list of important insights, patterns, and decisions that should inform future work.

---

## Architecture

### TanStack Start Add-on System

**Context:** Session 2025-12-27 - investigating TanStack Start CLI capabilities

**Insight:** TanStack Start CLI has a comprehensive add-on system (`--add-ons`) that includes shadcn, Convex, WorkOS, Clerk, Prisma, Drizzle, tRPC, and many more. This eliminates the need to orchestrate multiple CLI tools.

**Implication:** r9stack's scaffolding engine can be much simpler than originally planned. Instead of running 3 separate CLIs and managing complex integration templates, we pass flags to a single TanStack Start invocation:
```bash
npm create @tanstack/start@latest <project> -- --add-ons shadcn,convex,workos
```

### Check Official CLI Capabilities First

**Context:** Session 2025-12-27 - planning CLI orchestration

**Insight:** Running `--help` on official CLIs often reveals capabilities not documented elsewhere. TanStack Start's non-interactive flags and add-on system were discovered this way.

**Implication:** Before building abstraction layers or integration code, thoroughly investigate what the underlying tools already provide. This can dramatically simplify implementation.


