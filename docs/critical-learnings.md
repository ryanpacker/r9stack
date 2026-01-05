# Critical Learnings

A curated list of important insights, patterns, and decisions that should inform future work.

---

## TanStack Start Starter System

### Starter Compilation Workflow

**Context:** Researching how to create distributable project templates for r9stack.

**Insight:** TanStack Start has a built-in starter system that:
1. Creates a "virtual" reference project in memory
2. Compares your customized project against the reference
3. Outputs only the differences (added/modified files, deleted files, package.json additions)
4. Produces a portable `starter.json` that can be hosted at any URL

**Implication:** r9stack should use this system rather than manually copying files. The CLI invokes `npx @tanstack/create-start@latest <name> --starter <url>` and lets TanStack handle file operations.

### Starter Overrides vs User Options

**Context:** Understanding what the starter controls vs what users can configure.

**Insight:** When using `--starter`, the following are **overridden** by the starter and cannot be changed by CLI flags:
- `framework` (react-cra)
- `mode` (file-router vs code-router)
- `typescript` (true/false)
- `tailwind` (true/false)

The following remain potentially configurable:
- `packageManager` (npm, pnpm, yarn, bun)
- `git` (initialize git repo)
- `projectName` (always user-provided)

**Implication:** For v1, we use sensible defaults for configurable options. Future versions could expose these via CLI flags.

### URL Requirement for Starters

**Context:** Testing local starter development.

**Insight:** The `--starter` flag requires an HTTP/HTTPS URL. Local file paths are not supported.

**Implication:** For local development, options include:
1. Start a temporary local HTTP server
2. Embed starter.json and serve via data URL
3. Use a tunneling service during development

### GitHub Raw Content CDN Caching

**Context:** Starter updates not reflecting immediately after push.

**Insight:** GitHub's raw.githubusercontent.com CDN has a cache that can take 5-10 minutes to refresh. When testing immediately after pushing changes, the old `starter.json` may still be served.

**Workaround:** Use the commit hash in the URL instead of `main`:
```
https://raw.githubusercontent.com/user/repo/c7a05db/path/to/starter.json
```

**Implication:** When testing immediately after pushing starter changes:
1. Use commit hash URLs during development/testing
2. Wait 5-10 minutes for CDN cache to refresh before testing with `main` branch URL
3. Consider this when designing CI/CD pipelines for starter publishing

---

## TanStack Start CLI

### Available Add-ons Are Limited

**Context:** Attempting to create a project with Convex, WorkOS, and shadcn via CLI flags.

**Insight:** Only two add-ons are officially supported:
- `tailwind` - Tailwind CSS integration
- `shadcn` - shadcn/ui component library

Other integrations (Convex, WorkOS, etc.) are not available as add-ons and must be added via the starter system or manual installation.

**Implication:** The starter project must include all custom integrations. Users cannot add them via CLI flags.

### CLI Flag Syntax

**Context:** Creating a TanStack Start project without git initialization.

**Insight:** Boolean flags use the `--no-` prefix, not `--flag false`:
- ✅ Correct: `--no-git`
- ❌ Wrong: `--git false`

**Implication:** When scripting project creation, use the `--no-git` syntax.

### Dev Tools Port Conflicts

**Context:** Dev server failing to start with "EADDRINUSE: address already in use :::42069".

**Insight:** TanStack Devtools uses port 42069. If a dev server crashes or is killed improperly, this port can remain occupied.

**Solution:**
```bash
lsof -ti :42069 | xargs kill -9
```

**Implication:** Document this troubleshooting step for developers.

### DevTools triggerImage Persistence

**Context:** Changing the DevTools trigger button image doesn't update immediately.

**Insight:** TanStack DevTools stores the `triggerImage` configuration in localStorage. Once set, it persists even if the code changes. This only affects the first load for returning users.

**Solution:** Clear the relevant localStorage item or use browser DevTools to clear all site data.

**Implication:** New projects will show the correct trigger image. Existing development environments may need localStorage cleared. This is not a bug - it's intentional persistence for user customization.

---

## TanStack Start Integration

### Server Functions Pattern

**Context:** Implementing server-side auth with TanStack Start.

**Insight:** Use `createServerFn({ method: 'GET' }).handler(async () => {...})` pattern. The `.validator()` chaining shown in some docs doesn't work in current versions.

**Implication:** Check actual API rather than relying on docs that may be outdated.

### Cache Clearing for Dev Issues

**Context:** Changes not reflecting during development.

**Insight:** When TanStack Start/Vite behaves unexpectedly, clear all caches:
```bash
rm -rf node_modules/.vite .tanstack/tmp .output
npm run dev
```

**Implication:** Document this for troubleshooting generated projects.

---

## WorkOS AuthKit

### Hosted vs Custom UI

**Context:** Choosing auth implementation approach.

**Insight:** WorkOS AuthKit (hosted) handles the sign-in/sign-up UI, email verification, and password reset. Custom UI requires more work but offers more control.

**Implication:** r9stack uses the hosted approach for faster implementation. Users can customize later if needed.

### iron-session for Sessions

**Context:** Managing auth sessions in TanStack Start.

**Insight:** iron-session works well for encrypted cookie-based sessions. No external session store needed.

**Implication:** Use iron-session for session management in generated projects.

---

## Project Structure

### Route Organization

**Context:** Deciding on route structure for authenticated apps.

**Insight:** Using `/app` prefix for authenticated routes provides clear URL distinction between public and private areas. Easier to understand than pathless layout routes.

**Implication:** Generated projects use:
- `/` - Public landing
- `/auth/*` - Auth flow
- `/app/*` - Protected application
