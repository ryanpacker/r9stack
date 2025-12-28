# Implementation Overview

This document lists the major implementation areas for r9stack.

## Implementation Approach

r9stack uses a **script-first approach**: execute official CLI tools (TanStack Start, shadcn/ui, Convex) in sequence, then apply minimal integration templates for the glue code that connects them.

### Initialization Order (V1)

```
1. TanStack Start CLI with add-ons  →  Complete project scaffold
   - Base React project with routing
   - Tailwind CSS (--tailwind)
   - shadcn/ui (--add-ons shadcn)
   - Convex backend (--add-ons convex)
   - WorkOS auth (--add-ons workos)
2. r9stack templates                →  App shell, protected routes
3. Post-scaffold                    →  Configuration, setup instructions
```

> **V1 Scope:** Payments (Stripe) integration is deferred to post-V1.

> **Simplified Architecture:** TanStack Start's add-on system handles most integrations, reducing CLI orchestration complexity.

## Implementation Areas

1. **CLI Tool** – The r9stack npm package, CLI orchestration, and scaffolding engine
   - Status: 🟡 In Progress
   - See: [`1-cli-tool/`](1-cli-tool/)

2. **Project Scaffold** – Target state specification of a generated r9stack project
   - Status: 🔵 Planned
   - See: [`2-project-scaffold/`](2-project-scaffold/)

## Architecture Overview

```mermaid
flowchart LR
    subgraph cli [Area 1: CLI Tool]
        A1[Package Setup]
        A2[CLI Commands]
        A3[Scaffolding Engine]
    end
    
    subgraph scaffold [Area 2: Project Scaffold]
        B1[Frontend - from TanStack + shadcn]
        B2[Backend - from Convex]
        B3[Auth - r9stack integration]
        B4[Payments - r9stack integration]
        B5[Dev Environment]
    end
    
    A3 -->|executes CLIs| B1
    A3 -->|executes CLIs| B2
    A3 -->|applies templates| B3
    A3 -->|applies templates| B4
    A3 -->|configures| B5
```

## What Comes From Where

| Component | Source | Notes | Version |
|-----------|--------|-------|---------|
| React + File-based Routing | TanStack Start CLI | `npm create @tanstack/start@latest` | V1 |
| Tailwind CSS + UI Components | TanStack Start CLI | `--tailwind --add-ons shadcn` | V1 |
| Backend + Database | TanStack Start CLI | `--add-ons convex` | V1 |
| Authentication | TanStack Start CLI | `--add-ons workos` | V1 |
| App Shell + Navigation | r9stack templates | Header, user menu, protected routes | V1 |
| Payments | r9stack templates | Stripe + Convex integration | Post-V1 |

> **Key Discovery (2025-12-27):** TanStack Start has built-in add-ons for shadcn, Convex, and WorkOS. This eliminates the need to orchestrate multiple CLIs—we pass flags to a single TanStack Start invocation.

## How to Use This

1. Each numbered area has its own directory: `{N}-{kebab-topic}/`
2. Inside each directory:
   - `index.md` – Overview and goals for that area
   - `{N}.{M}-topic.md` – Task Groups with detailed tasks
3. Status is tracked at the Task level within Task Group files
4. Tasks are refined at the start of coding sessions, not all upfront
