# Handoff: Backport Convex Data-Plane Auth into the r9stack Starter

**Status:** ready to implement (uncommitted doc, 2026-07-06)
**Origin:** mission-control security incident, fixed in commit `7881222` on `security-convex-auth` (worktree `~/Projects/mc-security`)

## Why

Every r9stack-derived app ships with an **unauthenticated Convex data plane**. `starters/standard/convex/auth.config.ts` is an empty placeholder (`providers: []`), no function calls `ctx.auth.getUserIdentity()`, and the WorkOS/iron-session layer only guards the web app's routes — never Convex. `VITE_CONVEX_URL` is inlined in the served JS bundle, so anyone can call the public function API directly with forged identity args. This was found live in mission-control (2026-07-06): `users:listAll` dumped all users to an unauthenticated curl, and all permission checks were bypassable by supplying someone else's `workosId`.

The fix was applied per-project three times (starlog `9413c64`, fortcreek-pq Apr 2026, mission-control `7881222`) and never backported here. This handoff closes the loop so new projects are secure by default.

## The target architecture (proven, current best practice)

Confirmed July 2026 against Convex docs and WorkOS's own template — dual-issuer `customJwt` is the official pattern; nothing newer replaces it. Canonical reference implementation: **mission-control commit `7881222`** (most complete; use it as the copy source). Secondary: `~/Projects/fortcreek-pq`.

Three layers:

1. **Convex validates WorkOS JWTs** — `convex/auth.config.ts` with two `customJwt` providers (WorkOS issues different `iss` per auth method):
   - `https://api.workos.com/` (SSO) with `applicationID: clientId`
   - `https://api.workos.com/user_management/${clientId}` (AuthKit) **without** `applicationID` (these tokens carry no `aud` claim by default)
   - both use `jwks: https://api.workos.com/sso/jwks/${clientId}`, RS256
2. **Wrapper builders inject verified identity** — `convex/functions.ts` (new file) using `convex-helpers/server/customFunctions`: `authedQuery` / `authedMutation` resolve `identity.subject` (the WorkOS user id) → `users` row via `by_workos_id` and inject it as `ctx.user`; `requireActionUser(ctx)` for actions; internal `getUserByWorkosId` query supporting it. Public functions never take caller-identity args.
3. **Official AuthKit SDK replaces iron-session** — `@workos/authkit-tanstack-react-start` provides middleware (`src/start.ts`), PKCE sign-in/callback/sign-out routes, and client hooks; `ConvexProviderWithAuth` + a `useAuthFromAuthKit` adapter pushes the access token into the Convex websocket; `users.ensureUser` (zero-arg action) provisions the `users` row at login by fetching the profile **server-side from the WorkOS API** — nothing about identity is client-supplied.

## Concrete changes to `starters/standard/`

Copy each from mission-control `7881222` and de-project-ify (drop the @bamboohr.com domain gate — make the allowed-domain check an optional, clearly-marked template hook):

| File | Action |
|---|---|
| `convex/auth.config.ts` | Replace placeholder with dual-issuer customJwt config |
| `convex/functions.ts` | NEW — wrapper builders (`authedQuery`/`authedMutation`/`requireActionUser`/`getUserByWorkosId`) |
| `convex/users.ts` | NEW — `ensureUser` action + `provision` internalMutation + `getCurrent` authedQuery |
| `convex/messages.ts` | Migrate the demo to the wrappers so the starter *teaches* the pattern (`list`/`send` → `authedQuery`/`authedMutation`, attribute messages to `ctx.user`) |
| `convex/schema.ts` | Already has `users` + `by_workos_id`/`by_email` — no change needed |
| `src/start.ts` | NEW — `createStart` with `authkitMiddleware()` |
| `src/routes/auth/callback.tsx` | Replace with SDK `handleCallbackRoute({ returnPathname, errorRedirectUrl })` |
| `src/routes/auth/sign-in.tsx` | Replace with SDK `getSignInUrl`/`getSignUpUrl` redirect (PKCE requires sign-in to originate here) |
| `src/routes/auth/sign-out.tsx` | Client-side component calling SDK `signOut({ returnTo: window.location.origin + '/' })` — returnTo MUST be absolute |
| `src/routes/index.tsx`, `src/routes/app/route.tsx` | Route guards use SDK `getAuth()`; app layout wraps children in an `EnsureProvisioned` gate that runs `users.ensureUser` before rendering (see mc `src/routes/app/route.tsx`) |
| `src/components/ConvexClientProvider.tsx` | `ConvexProviderWithAuth` + `useAuthFromAuthKit` adapter (`forceRefreshToken` → SDK `refresh()`) |
| `src/lib/auth-client.ts` | Compat `useAuth()` over the SDK keeping `{ user, isAuthenticated, isLoading, signIn, signOut }` |
| `src/lib/auth.ts` | Re-export SDK `User` type |
| `src/lib/auth-server.ts`, `src/components/AuthProvider.tsx` | DELETE (iron-session plumbing) |
| `package.json` | ADD `@workos/authkit-tanstack-react-start@^0.8.2`, `convex-helpers@^0.1.114`; REMOVE `iron-session`, `@workos-inc/node` |
| `convex/__tests__/helpers.ts` | If the starter grows convex tests: `setupTestUser` pattern (insert row + `t.withIdentity({ subject: workosId })`) from mc |

**SDK version pin decision:** SDK 0.9.0+ requires `@tanstack/react-start >= 1.168.25`; the starter is on `^1.132.0`. Pin the SDK to `^0.8.2` (has the token-refresh fixes; peer deps allow react-start >=1.0) unless you also take the TanStack Start upgrade — do NOT couple that upgrade to this security backport.

## Setup steps code can't do (must land in starter README / onboarding docs)

Per new project, the developer must:

1. `npx convex env set WORKOS_CLIENT_ID ...` and `npx convex env set WORKOS_API_KEY ...` — `auth.config.ts` and `ensureUser` run **on the Convex deployment**, which does not read `.env.local`. This is the #1 setup trap.
2. WorkOS dashboard → Redirects: register the login redirect URI (`http://localhost:3000/auth/callback`), a **Sign-out redirect** (`http://localhost:3000/` — absolute; there is NO API for sign-out redirects, dashboard only), and ideally the Sign-in endpoint (`initiate_login_uri`).
3. `WORKOS_COOKIE_PASSWORD` ≥ 32 chars in `.env.local` (`openssl rand -base64 24`).

**Investigate while here:** Convex's "Zero-config AuthKit" (`npm create convex` / `authKit` section in `convex.json`, docs.convex.dev/auth/authkit/auto-provision) auto-provisions the WorkOS env (redirect URIs, env vars). If it fits the r9stack CLI flow it could eliminate step 1–2 for new projects; it still generates the same customJwt config, so it complements rather than replaces this backport.

## Known pitfalls (all hit during the mission-control fix)

- Issuer match is **exact including trailing slash** (`https://api.workos.com/`).
- AuthKit tokens may lack `aud` → omit `applicationID` on the user_management provider (or add a JWT template in the dashboard — don't, for shared envs).
- Since SDK 0.7.0, sign-in must start from the SDK's `getSignInUrl` (PKCE verifier cookie) — any hand-rolled `getAuthorizationUrl` flow 500s at the callback.
- Logout `returnTo` must be an **absolute URL matching a registered Sign-out redirect**, else the user strands on an AuthKit "Couldn't sign in" error page.
- SDK sign-out revokes the WorkOS session server-side — this also fixes the "sign-out silently re-authenticates" bug r9stack apps inherit from the old flow.

## Docs to update in this repo

- `docs/tech-stack.md` + starter `README.md` + `R9STACK.md`: auth section — iron-session is gone; describe the JWT→Convex architecture and the three manual setup steps.
- Starter `convex/README.md`: state the rule — *public functions use `authedQuery`/`authedMutation` from `functions.ts`, never raw builders, never caller-identity args; internal functions for seeds/migrations/crons.*
- `AGENTS.md` guidance emitted into generated projects: add the same rule so coding agents in downstream projects follow the pattern by default.

## Verification (template-level)

1. Generate a fresh project from the starter; complete the three setup steps.
2. `npx tsc --noEmit`, `npm run build`, tests green.
3. Adversarial: `curl -s https://<deployment>.convex.cloud/api/query -H 'Content-Type: application/json' -d '{"path":"messages:list","args":{},"format":"json"}'` → must return `Unauthenticated`; a call with a forged `workosId` arg must fail arg validation.
4. Browser: sign-in → provisioning → data loads → sign-out lands back on the app origin and next visit prompts for login.

## Follow-up beyond the starter

Audit any other r9stack-derived apps for the same hole (mission-control, fortcreek-pq, starlog are fixed; check for others). The tell: `convex/auth.config.ts` with `providers: []` + functions taking `workosId` args.

### Audit results (2026-07-08)

Backport landed in the starter. Machine-wide audit of every repo with a
`convex/` directory:

| Repo | State |
|---|---|
| `mission-control` | Fix authored but **not yet merged to `main`/`dev`** — commit `7881222` lives on the `security-convex-auth` branch (also on `track-1-planning-checkins` / `track-2-org-foundation`). Those branches still show 29 Convex modules, 16 taking `workosId` args, zero `getUserIdentity` calls. **Not currently exploitable: the underlying Convex projects are paused.** Merge before any redeploy. |
| `r9teststack` | **VULNERABLE** (`providers: []`, unauthenticated `messages:list`/`send`). Confirmed live: unauthenticated `curl` to `helpful-walrus-735` returns message rows. Throwaway test project. |
| `new-bhr-website` | **VULNERABLE**, same starter demo functions; shares deployment `helpful-walrus-735`. |
| `marathon-coach` | **VULNERABLE**, same starter demo functions. Deployment `grateful-salamander-504`. |
| `bamboohr.dev` | **VULNERABLE**, same starter demo functions. No deployment configured locally. |
| `demo.r9stack.dev` | **VULNERABLE**, same starter demo functions. No deployment configured locally. |
| `fortcreek-pq` | Fixed — wrappers named `queryWithAuth` / `mutationWithAuth`. |
| `starlog` | Fixed — wrappers named `authenticatedQuery` / `authenticatedMutation`. |
| `grant` | Not vulnerable — dual-issuer providers configured; every public function resolves the caller via a `getUser(ctx)` / `requireUser(ctx)` helper. |
| `mc-track1`, `mc-track2`, `mc-security` | Fixed (worktrees carrying `7881222`). |

The five starter-derived apps are all pre-backport clones of the old
`starters/standard` demo (`messages:list` / `messages:send` with no auth).
Regenerating or applying the wrapper pattern fixes each.

Note: wrapper names differ per project (`authedQuery`, `queryWithAuth`,
`authenticatedQuery`), so grep for `customQuery(`/`getUserIdentity` rather
than a single name when auditing.

### Extra fix made during the backport

The starter's checked-in `convex/_generated/server.js` stub aliased
`internalQuery`/`internalMutation` to the **public** generics. Convex's first
`npx convex dev` in a fresh project pushes that stub before codegen replaces
it, so every internal function (including `users.provision`) was briefly
callable on the public API. Reproduced on a fresh deployment, then fixed by
pointing the stub at `internalQueryGeneric`/`internalMutationGeneric`.
