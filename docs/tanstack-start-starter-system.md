# TanStack Start Starter System - Comprehensive Documentation

This document provides comprehensive documentation of the TanStack Start starter template system based on source code analysis and practical testing.

> **Version Tested:** @tanstack/create-start@0.44.0, @tanstack/cta-cli@0.44.0, @tanstack/cta-engine@0.44.0

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [The `starter init` Command](#the-starter-init-command)
4. [The `starter compile` Command](#the-starter-compile-command)
5. [Using the `--starter` Flag](#using-the---starter-flag)
6. [Starter JSON Schema](#starter-json-schema)
7. [Project Creation Flow](#project-creation-flow)
8. [File Handling Details](#file-handling-details)
9. [Key Files and Locations](#key-files-and-locations)
10. [Practical Example](#practical-example)
11. [Limitations and Considerations](#limitations-and-considerations)
12. [For R9Stack: Implementation Strategy](#for-r9stack-implementation-strategy)

---

## Overview

The TanStack Start starter system allows developers to create reusable project templates that can be distributed and consumed via a simple URL reference. The system works by:

1. **Creating** a base TanStack Start project with desired configurations
2. **Customizing** the project with your own files, modifications, and deletions
3. **Compiling** the differences into a portable `starter.json` file
4. **Distributing** the JSON file via any HTTP endpoint
5. **Consuming** the starter via the `--starter` flag during project creation

The starter system is built on top of the "Create TanStack App" (CTA) engine, which is the underlying scaffolding tool used by `@tanstack/create-start`.

---

## Architecture

The starter system is implemented across two main packages:

### @tanstack/cta-cli
- **Entry point:** Provides the CLI commands (`starter init`, `starter compile`)
- **Location:** `src/cli.ts` - Registers the `starter` command group
- **Key imports from cta-engine:** `initStarter`, `compileStarter`, `loadStarter`

### @tanstack/cta-engine
- **Core logic:** `src/custom-add-ons/starter.ts`
- **Project creation:** `src/create-app.ts`
- **Types and schemas:** `src/types.ts`
- **File comparison:** `src/custom-add-ons/shared.ts`

---

## The `starter init` Command

```bash
npx @tanstack/create-start@latest starter init
```

### What It Does

1. **Reads the `.cta.json` config file** from the current project directory
2. **Generates or reads `starter-info.json`** - metadata about your starter
3. **Runs `compileStarter`** to generate the `starter.json` file

### Behavior

When run for the first time in a project:
- If `starter-info.json` doesn't exist, it auto-generates default metadata
- Creates both `starter-info.json` and `starter.json`

When run subsequently:
- Reads existing `starter-info.json` for metadata
- Regenerates `starter.json` with current differences

### Default `starter-info.json` Structure

```json
{
  "id": "{projectName}-starter",
  "name": "{projectName}-starter",
  "version": "0.0.1",
  "description": "Project starter",
  "author": "Jane Smith <jane.smith@example.com>",
  "license": "MIT",
  "link": "https://github.com/jane-smith/{projectName}-starter",
  "shadcnComponents": [],
  "framework": "react-cra",
  "mode": "file-router",
  "routes": [],
  "warning": "",
  "type": "starter",
  "packageAdditions": {
    "scripts": {},
    "dependencies": {},
    "devDependencies": {}
  },
  "dependsOn": ["array", "of", "addon", "ids"],
  "typescript": true,
  "tailwind": true
}
```

### Source Code Reference

```typescript
// From: @tanstack/cta-engine/src/custom-add-ons/starter.ts

export async function initStarter(environment: Environment) {
  await updateStarterInfo(environment)
  await compileStarter(environment)
}
```

---

## The `starter compile` Command

```bash
npx @tanstack/create-start@latest starter compile
```

### What It Does

1. **Loads current project options** from `.cta.json`
2. **Reads `starter-info.json`** for metadata
3. **Creates a "virtual" reference project** using `runCreateApp()` in memory
4. **Compares the current project** against the reference project
5. **Identifies changed/added files** and **deleted files**
6. **Outputs `starter.json`** containing only the differences

### The Comparison Algorithm

```typescript
// Simplified from: @tanstack/cta-engine/src/custom-add-ons/shared.ts

async function compareFilesRecursively(path, ignore, original, changedFiles) {
  for (const file of files) {
    if (file.isDirectory()) {
      await compareFilesRecursively(...)
    } else {
      const contents = await readFileHelper(filePath)
      // If file doesn't exist in original OR content is different
      if (!original[filePath] || original[filePath] !== contents) {
        changedFiles[filePath] = contents
      }
    }
  }
}
```

### Files That Are Ignored

The following files/directories are automatically ignored during comparison:

```javascript
const IGNORE_FILES = [
  '.starter',
  '.add-on',
  '.cta.json',
  '.git',
  'add-on-info.json',
  'add-on.json',
  'build',
  'bun.lock',
  'bun.lockb',
  'deno.lock',
  'dist',
  'node_modules',
  'package-lock.json',
  'pnpm-lock.yaml',
  'starter.json',
  'starter-info.json',
  'yarn.lock',
]
```

Additionally, `.gitignore` patterns are respected.

### Package.json Additions

The system also detects differences in `package.json`:
- New or modified scripts
- New or modified dependencies
- New or modified devDependencies

These are stored in `packageAdditions` within the starter.

---

## Using the `--starter` Flag

```bash
npx @tanstack/create-start@latest my-project --starter https://example.com/starter.json
```

### What Happens

1. **Fetches the starter JSON** from the provided URL
2. **Validates the JSON** against the `StarterCompiledSchema`
3. **Extracts configuration** (framework, mode, typescript, tailwind)
4. **Resolves dependencies** listed in `dependsOn`
5. **Creates the base project** with framework and add-ons
6. **Applies starter customizations** (files, deletions, package additions)

### Source Code - Loading a Starter

```typescript
// From: @tanstack/cta-engine/src/custom-add-ons/starter.ts

export async function loadStarter(url: string): Promise<Starter> {
  const response = await fetch(url)
  const jsonContent = await response.json()

  const checked = StarterCompiledSchema.safeParse(jsonContent)
  if (!checked.success) {
    throw new Error(`Invalid starter: ${url}`)
  }

  const starter = checked.data
  starter.id = url
  return {
    ...starter,
    getFiles: () => Promise.resolve(Object.keys(starter.files)),
    getFileContents: (path: string) => Promise.resolve(starter.files[path]),
    getDeletedFiles: () => Promise.resolve(starter.deletedFiles),
  }
}
```

### CLI Options Overridden by Starter

When a starter is used, the following options are **overridden** by the starter's configuration:

```typescript
// From: @tanstack/cta-cli/src/command-line.ts

if (starter) {
  tailwind = starter.tailwind
  typescript = starter.typescript
  cliOptions.framework = starter.framework
  mode = starter.mode
}
```

---

## Starter JSON Schema

The `starter.json` file follows the `StarterCompiledSchema`:

```typescript
// From: @tanstack/cta-engine/src/types.ts

export const StarterSchema = AddOnBaseSchema.extend({
  framework: z.string(),       // e.g., "react-cra"
  mode: z.string(),            // e.g., "file-router"
  typescript: z.boolean(),
  tailwind: z.boolean(),
  banner: z.string().optional(),
})

export const StarterCompiledSchema = StarterSchema.extend({
  files: z.record(z.string(), z.string()),      // { path: content }
  deletedFiles: z.array(z.string()),            // ["./path/to/delete"]
})
```

### Full Example

```json
{
  "id": "my-starter",
  "name": "My Custom Starter",
  "version": "1.0.0",
  "description": "A custom starter template",
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "link": "https://github.com/you/my-starter",
  "framework": "react-cra",
  "mode": "file-router",
  "typescript": true,
  "tailwind": true,
  "type": "starter",
  "dependsOn": ["start", "tailwind"],
  "packageAdditions": {
    "scripts": {
      "custom-script": "echo 'Hello'"
    },
    "dependencies": {
      "custom-package": "^1.0.0"
    },
    "devDependencies": {}
  },
  "files": {
    "./src/components/MyComponent.tsx": "// Component content...",
    "./src/routes/__root.tsx": "// Modified root route content..."
  },
  "deletedFiles": [
    "./src/routes/demo/api.names.ts",
    "./src/routes/demo/start.api-request.tsx"
  ]
}
```

---

## Project Creation Flow

When `npx @tanstack/create-start my-project --starter <url>` is executed:

### 1. Option Normalization (`command-line.ts`)
```typescript
const starter = cliOptions.starter
  ? await loadStarter(cliOptions.starter)
  : undefined

if (starter) {
  tailwind = starter.tailwind
  typescript = starter.typescript
  cliOptions.framework = starter.framework
  mode = starter.mode
}
```

### 2. Finalize Add-ons
The add-ons from `starter.dependsOn` are automatically included:
```typescript
const selectedAddOns = new Set<string>([
  ...(starter?.dependsOn || []),
  ...(forcedAddOns || []),
])
```

### 3. Create App (`create-app.ts`)

The `createApp` function executes in this order:

```typescript
export async function createApp(environment, options) {
  // 1. Write all files
  await writeFiles(environment, options)

  // 2. Run commands and install dependencies
  await runCommandsAndInstallDependencies(environment, options)

  // 3. Show completion report
  report(environment, options)
}
```

### 4. Write Files Sequence

Files are written in this specific order:

```typescript
async function writeFiles(environment, options) {
  // Step 1: Write framework base files
  await writeFileBundle(options.framework)

  // Step 2: Write add-on files (by type and phase)
  for (const type of ['add-on', 'example', 'toolchain', 'deployment']) {
    for (const phase of ['setup', 'add-on', 'example']) {
      for (const addOn of options.chosenAddOns.filter(...)) {
        await writeFileBundle(addOn)
      }
    }
  }

  // Step 3: Write starter files LAST (overrides everything)
  if (options.starter) {
    await writeFileBundle(options.starter)
  }

  // Step 4: Write package.json (merges all additions)
  await environment.writeFile(
    'package.json',
    JSON.stringify(createPackageJSON(options), null, 2),
  )

  // Step 5: Write .cta.json config file
  await writeConfigFileToEnvironment(environment, options)
}
```

### 5. Write File Bundle (includes deletion)

```typescript
async function writeFileBundle(bundle) {
  // Write new/modified files
  const files = await bundle.getFiles()
  for (const file of files) {
    const contents = await bundle.getFileContents(file)
    // Handle binary vs text files
    await templateFileFromContent(file, contents)
  }

  // Delete files that should be removed
  const deletedFiles = await bundle.getDeletedFiles()
  for (const file of deletedFiles) {
    await environment.deleteFile(resolve(options.targetDir, file))
  }
}
```

---

## File Handling Details

### Binary Files

Binary files (images, etc.) are handled specially:
- Stored as base64 with prefix `base64::`
- Decoded and written as binary during project creation

```javascript
const BINARY_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico']

function readFileHelper(path: string): string {
  if (isBinaryFile(path)) {
    return `base64::${readFileSync(path).toString('base64')}`
  }
  return readFileSync(path, 'utf-8').toString()
}
```

### Template Processing

Files can contain EJS templates that are processed during creation:

```javascript
const templateValues = {
  packageManager: options.packageManager,
  projectName: options.projectName,
  typescript: options.typescript,
  tailwind: options.tailwind,
  js: options.typescript ? 'ts' : 'js',
  jsx: options.typescript ? 'tsx' : 'jsx',
  fileRouter: options.mode === 'file-router',
  codeRouter: options.mode === 'code-router',
  addOnEnabled: {...},
  addOnOption: options.addOnOptions,
}
```

---

## Key Files and Locations

| File | Purpose |
|------|---------|
| `.cta.json` | Project configuration (persisted options) |
| `starter-info.json` | Starter metadata (editable by developer) |
| `starter.json` | Compiled starter (distributable) |

### .cta.json Example
```json
{
  "projectName": "my-project",
  "mode": "file-router",
  "typescript": true,
  "tailwind": true,
  "packageManager": "npm",
  "git": true,
  "addOnOptions": {},
  "version": 1,
  "framework": "react-cra",
  "chosenAddOns": ["start", "nitro"],
  "starter": "https://example.com/starter.json"
}
```

---

## Practical Example

### Creating a Starter Template

```bash
# 1. Create a base project
npx @tanstack/create-start@latest my-template --tailwind

# 2. Navigate into the project
cd my-template

# 3. Customize the project
# - Modify files
# - Add new components
# - Delete unwanted files
# - Update package.json

# 4. Initialize the starter
npx @tanstack/create-start@latest starter init

# 5. Edit starter-info.json with your metadata
vim starter-info.json

# 6. Recompile after any changes
npx @tanstack/create-start@latest starter compile

# 7. Host starter.json somewhere accessible
# Example: GitHub raw, S3, your own server
```

### Using a Starter Template

```bash
# Create a new project from the starter
npx @tanstack/create-start@latest new-project \
  --starter https://raw.githubusercontent.com/you/repo/main/starter.json
```

---

## Limitations and Considerations

### 1. Empty Directories
- The system deletes **files** but does not remove **empty directories**
- After deletion, empty parent directories may remain

### 2. Configuration Override
- Starter completely overrides: `framework`, `mode`, `typescript`, `tailwind`
- Users cannot mix-and-match with CLI flags when using a starter

### 3. Add-on Dependencies
- The `dependsOn` array must contain valid add-on IDs
- Invalid add-ons will cause the creation to fail
- Add-ons are resolved at creation time, so version compatibility matters

### 4. No Incremental Updates
- There's no mechanism to update an existing project from a newer starter
- Starters are only applied during initial project creation

### 5. URL Requirements
- The `--starter` flag requires an HTTP/HTTPS URL
- Local file paths are not supported
- The URL must return valid JSON

### 6. Package.json Merging
- `packageAdditions` are merged, not replaced
- Conflicts may arise if the base adds the same dependency

---

## For R9Stack: Implementation Strategy

Based on this research, here's how R9Stack can leverage the starter system:

### Option 1: Distribute a starter.json

1. Create your ideal R9Stack base project
2. Customize it with all your patterns, components, and configurations
3. Run `starter init` and `starter compile`
4. Host `starter.json` alongside the R9Stack CLI (or in a CDN)
5. R9Stack CLI can then invoke:
   ```bash
   npx @tanstack/create-start@latest <project-name> \
     --starter https://r9stack.dev/starter.json
   ```

### Option 2: Embed starter.json in R9Stack

1. Include the compiled `starter.json` as a bundled asset
2. Start a temporary local server or use a data URL
3. Invoke create-start with the local/embedded URL

### What Starter Can Handle

- Modified/added files (routes, components, styles, configs)
- Deleted files from base template
- Additional dependencies
- Additional scripts
- Framework/mode/typescript/tailwind settings
- Required add-ons (via `dependsOn`)

### What Starter Cannot Handle

- Post-creation commands (use add-on's `command` field instead)
- Interactive prompts during setup
- Conditional file inclusion (all files in starter are always applied)
- Runtime customization based on user input

### Recommended Approach for R9Stack

The starter system is ideal for establishing a **baseline project structure**. For any additional customization that the starter can't handle:

1. Use the starter for the base project with all file modifications
2. Have R9Stack CLI perform post-creation modifications:
   - Additional file edits
   - Running specific commands
   - Applying user-selected options

