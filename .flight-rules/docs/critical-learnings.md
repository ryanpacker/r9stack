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

---

## Convex

### Reserved Index Names

**Context:** r9teststack sandbox - defining Convex schema

**Insight:** Convex reserves certain index names. `by_id` and `by_creation_time` cannot be used as index names—they conflict with built-in indices.

**Implication:** Use alternative names like `by_created_at` instead of `by_creation_time`. Example:
```typescript
// Wrong - will fail
.index('by_creation_time', ['createdAt'])

// Correct
.index('by_created_at', ['createdAt'])
```

### SSR-Safe Convex Provider Pattern

**Context:** r9teststack sandbox - integrating Convex with TanStack Start SSR

**Insight:** Convex's React client is client-only. With TanStack Start's SSR, you must create the `ConvexReactClient` inside `useEffect` to avoid hydration errors.

**Implication:** Use this pattern for the Convex provider:
```typescript
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ConvexReactClient | null>(null);

  useEffect(() => {
    const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
    if (convexUrl) {
      setClient(new ConvexReactClient(convexUrl));
    }
  }, []);

  if (!client) {
    return <>{children}</>;  // Render children without Convex during SSR
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
```

---

## TanStack Start

### Scaffolding Into Existing Directory

**Context:** r9teststack sandbox - project setup

**Insight:** When scaffolding TanStack Start into an existing directory, use `.` as the project name to avoid creating a nested directory.

**Implication:** 
```bash
# In existing 'my-project' directory:
npm create @tanstack/start@latest . --template start
```

### Server Function Pattern

**Context:** r9teststack sandbox - implementing auth server functions

**Insight:** TanStack Start server functions use a specific pattern. The `.validator()` chaining approach from some examples doesn't work in current versions.

**Implication:** Use this pattern:
```typescript
export const myServerFn = createServerFn({ method: 'GET' }).handler(
  async (ctx?: { data: { param: string } }): Promise<Result> => {
    // Implementation
  }
)
```

### Request Access in Server Functions

**Context:** r9teststack sandbox - accessing cookies in server functions

**Insight:** To access the request object in TanStack Start server functions, use `getRequest()` from `@tanstack/react-start/server`.

**Implication:**
```typescript
import { getRequest } from '@tanstack/react-start/server'

export const myServerFn = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  // Now you can access cookies, headers, etc.
})
```

---

## shadcn/ui

### Tailwind v4 Support

**Context:** r9teststack sandbox - setting up shadcn with Tailwind v4

**Insight:** shadcn requires the `-t start` flag when initializing with TanStack Start to properly support Tailwind v4's CSS-first configuration.

**Implication:**
```bash
npx shadcn@latest init "https://ui.shadcn.com/init?style=vega&baseColor=gray" -t start --force
```

### RSC Setting

**Context:** r9teststack sandbox - shadcn configuration

**Insight:** TanStack Start is not Next.js, so the `rsc` (React Server Components) setting in `components.json` must be `false`.

**Implication:** Ensure `components.json` has:
```json
{
  "rsc": false
}
```

---

## Development

### Cache Clearing

**Context:** r9teststack sandbox - debugging dev server issues

**Insight:** If the TanStack Start dev server behaves unexpectedly (stale routes, missing components), clearing cache directories often resolves it.

**Implication:**
```bash
rm -rf node_modules/.vite .tanstack/tmp .output
```

### Port Conflicts

**Context:** r9teststack sandbox - running dev server

**Insight:** TanStack devtools uses port 42069 by default. If you have multiple projects running, you may see port conflicts.

**Implication:** Be aware of port usage when running multiple TanStack projects simultaneously.

---

## Iron-Session

### Session Cookie Configuration

**Context:** r9teststack sandbox - implementing WorkOS session management

**Insight:** Iron-session requires a 32+ character password for cookie encryption. The cookie must be httpOnly and secure in production.

**Implication:**
```typescript
const sessionOptions = {
  password: process.env.WORKOS_COOKIE_PASSWORD!, // 32+ chars
  cookieName: 'r9_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
}
```

Generate password with: `openssl rand -base64 32`
