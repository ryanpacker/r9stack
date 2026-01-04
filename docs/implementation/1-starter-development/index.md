# Area 1: Starter Development

## Overview

This area covers the creation and maintenance of r9stack starter templates. Starters are TanStack Start projects that get compiled into distributable `starter.json` files.

## Goals

1. Create the `r9-starter-standard` template with all r9stack features
2. Establish a repeatable workflow for starter development
3. Document the compilation and publishing process

## Key Files

| Path | Purpose |
|------|---------|
| `/starters/standard/` | Standard starter source project |
| `/starters/standard/starter-info.json` | Starter metadata |
| `/starters/standard/starter.json` | Compiled starter (generated) |

## Dependencies

- TanStack Start's CTA CLI for compilation
- Understanding of the [starter system](../../tanstack-start-starter-system.md)

## Task Groups

- `1.1-standard-starter.md` - Building the r9-starter-standard template

## Architecture

```
/starters/standard/
├── .cta.json              # CTA config (records base project options)
├── starter-info.json      # Starter metadata (id, version, dependencies)
├── starter.json           # Compiled output (files, deletedFiles, packageAdditions)
├── src/
│   ├── components/        # UI components (AppShell, Sidebar, etc.)
│   ├── lib/               # Utilities (auth, cn helper)
│   └── routes/            # TanStack Router routes
├── convex/                # Convex backend
│   ├── schema.ts
│   └── *.ts               # Convex functions
├── public/                # Static assets
└── package.json           # With additional dependencies
```

