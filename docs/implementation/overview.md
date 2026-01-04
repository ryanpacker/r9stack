# Implementation Overview

This document lists the major implementation areas for the r9stack CLI project.

## Implementation Areas

1. **Starter Development** – Build and maintain starter project templates
   - Status: 🔵 Planned
   - See: `1-starter-development/`

2. **CLI Architecture** – Starter-based project creation flow
   - Status: 🟡 In Progress (partial implementation exists)
   - See: `2-cli-architecture/`

3. **Post-Creation Workflow** – Convex/WorkOS guidance, GitHub/Vercel integration
   - Status: 🔵 Planned
   - See: `3-post-creation-workflow/`

4. **Testing Infrastructure** – E2E tests for project creation
   - Status: 🔵 Planned
   - See: `4-testing/`

5. **Website Integration** – Publishing starters to r9stack.dev
   - Status: 🔵 Planned
   - See: `5-website-integration/`

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           r9stack CLI                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  User Input  →  TanStack Create  →  Post-Setup  →  Optional Steps      │
│               (--starter flag)     (Convex/WorkOS) (GitHub/Vercel)      │
└─────────────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    /starters/standard/                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  Source Project  →  starter init/compile  →  starter.json              │
└─────────────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    r9stack.dev (separate repo)                          │
├─────────────────────────────────────────────────────────────────────────┤
│  Hosts starter.json files at /starters/*.json                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Decisions

### Starter-Based Architecture
The CLI uses TanStack Start's `--starter` flag rather than manually copying files. This provides:
- Automatic handling of file additions, modifications, and deletions
- Proper package.json merging
- Binary file support (images as base64)
- Integration with TanStack Start's add-on system

### Starter Naming Convention
- Directory: `/starters/{name}/` (e.g., `/starters/standard/`)
- JSON ID: `r9-starter-{name}` (e.g., `r9-starter-standard`)
- Hosted URL: `https://r9stack.dev/starters/{name}.json`

### Separate Website Repository
The r9stack.dev website is a separate private repository. The CLI references hosted starter URLs, keeping the open-source CLI decoupled from the proprietary website.

## How to Use This

1. Each numbered area has its own directory: `{N}-{kebab-topic}/`
2. Inside each directory:
   - `index.md` – Overview and goals for that area
   - `{N}.{M}-topic.md` – Detailed specs for sub-areas
3. Status is tracked in the detailed spec files, not here
