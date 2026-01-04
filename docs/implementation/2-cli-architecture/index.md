# Area 2: CLI Architecture

## Overview

This area covers the r9stack CLI implementation, focusing on the starter-based project creation flow.

## Goals

1. Update CLI to use TanStack Start's `--starter` flag
2. Implement clean command structure with commander
3. Provide clear progress feedback during project creation

## Key Files

| Path | Purpose |
|------|---------|
| `/src/index.ts` | CLI entry point |
| `/src/commands/init.ts` | Init command implementation |
| `/src/utils/exec.ts` | Process execution utilities |
| `/src/utils/logger.ts` | Console output formatting |

## Current State

The CLI currently calls `npm create @tanstack/start@latest` with basic flags. This needs to be updated to use the `--starter` flag.

## Task Groups

- `2.1-starter-integration.md` - Updating CLI to use --starter flag
- `2.2-command-structure.md` - CLI argument handling and validation

## New Flow

```
r9stack init [project-name]
    │
    ├─► Validate/prompt for project name
    │
    ├─► Check if directory exists
    │
    ├─► Confirm with user
    │
    └─► npx @tanstack/create-start@latest <name> \
          --starter https://r9stack.dev/starters/standard.json
```

## Dependencies

- commander (already installed)
- @inquirer/prompts (already installed)
- execa (already installed)

