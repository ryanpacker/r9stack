# Starter Development Guide

This guide explains how to create, modify, and publish r9stack starters.

## Overview

Starters are TanStack Start projects that get compiled into a `starter.json` file. When users run `r9stack init`, the CLI fetches this JSON and TanStack Start applies it as a diff on top of a base project.

## Directory Structure

```
starters/
└── standard/                    # Starter name
    ├── .cta.json               # TanStack CTA config (auto-generated)
    ├── starter-info.json       # Starter metadata (you edit this)
    ├── starter.json            # Compiled starter (auto-generated)
    ├── src/                    # Your source files
    ├── convex/                 # Convex setup
    ├── public/                 # Static assets
    └── ...
```

## Creating a New Starter

### 1. Create the Base Project

```bash
cd starters/standard
npx @tanstack/create-start@latest . --tailwind
```

This creates a base TanStack Start project with Tailwind CSS.

### 2. Customize the Project

Make all your modifications:
- Add components
- Modify routes
- Add dependencies
- Delete unwanted files
- Configure styling

### 3. Initialize the Starter

```bash
npx @tanstack/create-start@latest starter init
```

This creates:
- `starter-info.json` - Metadata you should edit
- `starter.json` - Compiled starter

### 4. Edit Starter Metadata

Edit `starter-info.json`:

```json
{
  "id": "r9-starter-standard",
  "name": "r9stack Standard Starter",
  "version": "1.0.0",
  "description": "Full-featured starter with auth, database, and UI",
  "author": "r9stack",
  "license": "Apache-2.0",
  "link": "https://github.com/ryanpacker/r9stack",
  "framework": "react-cra",
  "mode": "file-router",
  "typescript": true,
  "tailwind": true,
  "type": "starter",
  "dependsOn": ["start", "tailwind"],
  "packageAdditions": {
    "scripts": {},
    "dependencies": {},
    "devDependencies": {}
  }
}
```

### 5. Compile the Starter

After any changes, recompile:

```bash
npx @tanstack/create-start@latest starter compile
```

## What Gets Included

The compilation process:
1. Creates a virtual reference project with the same base options
2. Compares your project against the reference
3. Includes only the differences in `starter.json`

### Included
- New or modified files (stored as content)
- Deleted files (stored as paths to delete)
- New dependencies, devDependencies, and scripts
- Binary files (stored as base64)

### Excluded (automatically ignored)
- `.git/`
- `node_modules/`
- Lock files (`package-lock.json`, `yarn.lock`, etc.)
- Build output (`dist/`, `build/`, `.output/`)
- Starter metadata files (`.cta.json`, `starter-info.json`, `starter.json`)

## Testing Locally

Since `--starter` requires an HTTP URL, you have options:

### Option 1: Local HTTP Server

```bash
# In one terminal
cd starters/standard
npx serve -p 3333

# In another terminal
npx @tanstack/create-start@latest test-project \
  --starter http://localhost:3333/starter.json
```

### Option 2: Use the Full CLI

Build and link the r9stack CLI, then test the full flow:

```bash
# From r9stack root
npm run build
npm link

# Test
cd /tmp
r9stack init my-test-project
```

## Publishing

1. Compile the starter to generate fresh `starter.json`
2. Copy `starter.json` to the r9stack.dev website repository
3. Deploy the website

The hosted URL will be:
```
https://r9stack.dev/starters/standard.json
```

## Naming Convention

| Aspect | Pattern | Example |
|--------|---------|---------|
| Directory | `/starters/{name}/` | `/starters/standard/` |
| JSON ID | `r9-starter-{name}` | `r9-starter-standard` |
| Hosted URL | `r9stack.dev/starters/{name}.json` | `r9stack.dev/starters/standard.json` |

## Common Issues

### Changes Not Appearing in Compiled Starter

Run `starter compile` after every change. The compile process is not automatic.

### Binary Files

Images and other binary files are automatically handled. They're stored as base64 in the JSON and decoded during project creation.

### Package.json Conflicts

If you add a dependency that the base project also adds, there may be version conflicts. The starter's version takes precedence.

### Empty Directories

The starter system deletes files but doesn't remove empty directories. If you delete all files from a directory, the empty directory may remain in created projects.

## Reference

See [tanstack-start-starter-system.md](tanstack-start-starter-system.md) for comprehensive documentation of the TanStack Start starter system.

