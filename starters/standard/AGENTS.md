# Agent Guidelines — __PROJECT_NAME__

Rules for coding agents (Claude Code, Cursor, Codex, etc.) working in this
codebase. For the full architecture reference, read [R9STACK.md](./R9STACK.md).

## Security rule: the Convex data plane is authenticated — keep it that way

The Convex deployment URL ships in the client JS bundle, so anyone can call
public Convex functions directly. Route guards in the web app do NOT protect
Convex. Every public function must verify the caller itself. Non-negotiable
rules when writing Convex functions:

1. **Public queries and mutations use `authedQuery` / `authedMutation` from
   `convex/functions.ts`** — never the raw `query` / `mutation` builders from
   `convex/_generated/server`. The wrappers validate the caller's WorkOS JWT
   and inject the verified `users` row as `ctx.user`.
2. **Public actions call `requireActionUser(ctx)`** (also from
   `convex/functions.ts`) at the top of the handler.
3. **Never accept caller identity as an argument.** No `workosId`, `email`,
   or caller `userId` args — they are forgeable by anyone with the deployment
   URL. The caller is always `ctx.user`.
4. **Seeds, migrations, and crons use `internalQuery` / `internalMutation` /
   `internalAction`** — internal functions are not exposed on the public API.
5. The only sanctioned exception is `convex/users.ts` `ensureUser`, which
   provisions the `users` row at login and does its own JWT check.

If you find a public function using raw builders or identity args, treat it
as a security bug and fix it.

## Other conventions

- Data access goes through Convex (`useQuery` / `useMutation` /
  `useAction`) — no REST endpoints, no `fetch()` for app data.
- Protected pages live under `src/routes/app/` (guarded by
  `src/routes/app/route.tsx`); public pages live directly in `src/routes/`.
- Client auth state comes from `useAuth()` in `src/lib/auth-client.ts`;
  sign-in must start at `/auth/sign-in` (the SDK sets the PKCE cookie there).
- UI components come from shadcn/ui (`npx shadcn add <component>`); use
  Tailwind theme tokens (`bg-background`, `text-foreground`, …).

See [R9STACK.md](./R9STACK.md) for details on each of these.
