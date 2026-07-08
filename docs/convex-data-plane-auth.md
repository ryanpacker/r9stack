# Convex Data-Plane Auth (r9stack templates)

**Status (2026-07-08):** Phase 1 (stub-exposure fix + standard relabel + CI
guard) and Phase 2 (auth-template rebuild) are both committed on branch
`fix/convex-data-plane-secure-defaults` (PR #2), not yet merged to `main`. The
only unfinished item is the live auth check — see
[Phase 2 status](#phase-2--auth-template-rebuild-committed).

This is the canonical reference. It supersedes the original handoff doc (which
prompted this work and is preserved on branch `wip/convex-auth-backport-prerename`),
whose specifics were found stale or wrong by a multi-agent research +
adversarial-review pass on 2026-07-08 (see
[Corrections](#corrections-to-the-original-handoff)).

## The core problem

A Convex deployment's function API is reachable by anyone with the deployment
URL, and that URL ships in the client JS bundle. Route guards in the web app
gate *pages*, not *data*. Auth providers (WorkOS/Clerk/Convex Auth) only
populate `ctx.auth`; `getUserIdentity()` returns `null` for an anonymous caller
rather than rejecting. So **every public Convex function body is the only gate**,
and each one must check auth itself and derive identity from the verified token
-- never from a client-supplied argument.

## Target architecture (corrected, verified 2026-07-08)

WorkOS AuthKit for identity; Convex validates the WorkOS-issued JWT; per-function
enforcement via wrapper builders. Mirror Convex's own official
`get-convex/templates/template-tanstack-start-authkit` (dual `customJwt`,
unchanged since 2025-10-28).

1. **`convex/auth.config.ts` -- two `customJwt` providers** (NOT the OIDC
   `{ domain, applicationID }` form):
   - issuer `https://api.workos.com/`, `applicationID: <clientId>`, jwks
     `https://api.workos.com/sso/jwks/<clientId>`, RS256. `applicationID` is
     mandatory here -- Convex rejects a shared-issuer provider without it at
     push time.
   - issuer `https://api.workos.com/user_management/<clientId>`, no
     `applicationID`, same jwks/RS256.
2. **Mandatory manual step, no tooling scaffolds it:** real AuthKit access
   tokens have `iss=https://api.workos.com` and **no `aud` claim**, so the config
   above fails with `NoAuthProvider` until you add `{"aud": "<client_id>"}` to
   the WorkOS Sessions JWT template (Dashboard -> Authentication -> Sessions ->
   Configure JWT Template). Convex's `authKit` auto-provisioning does this for
   dev on a Convex-managed WorkOS account only; bring-your-own-team and
   preview/prod are manual. Add the profile claims (`email`, `first_name`,
   `last_name`, `profile_picture_url`) in the same template so provisioning
   needs no WorkOS API call.
3. **Per-function enforcement:** `convex/functions.ts` exporting
   `authedQuery`/`authedMutation`/`authedAction` (via convex-helpers
   `customQuery`/`customMutation`/`customAction` + `customCtx` resolving
   `ctx.user` from `identity.subject`), plus explicit `publicQuery`/
   `publicMutation` opt-outs. Wrappers are opt-in, so back them with:
   - a `no-restricted-imports` ESLint ban on the raw builders **and** on
     `convex/server`'s `queryGeneric`/`mutationGeneric`/`actionGeneric`/
     `httpActionGeneric` re-exports (Convex's own rule misses the latter), and
   - a CI `npx convex function-spec --file` check diffing deployed public
     functions against a checked-in allowlist (survives eslint-disable and the
     stub bug below).
4. **Provisioning:** a zero-arg `upsertFromIdentity` **mutation** (transactional,
   idempotent, no API key on Convex) that reads the profile from JWT claims. Use
   an `internalAction` fetch from the WorkOS Management API only for
   Management-API-only fields, scheduled fire-and-forget, never awaited behind a
   loading gate.
5. **Client bridge:** `ConvexProviderWithAuth` + a `useAuth`-adapter that reads
   `{ loading, user }` from the SDK's `useAuth()` and `getAccessToken`/`refresh`
   from `useAccessToken()`, honoring `forceRefreshToken`.
6. **SDK target: `@workos/authkit-tanstack-react-start ^0.11.0`** (floor 0.10.1 =
   first published fix for the `getOrganizationAction` IDOR present in
   0.8.2--0.9.x). Adds peer `@workos-inc/node ^10.7.0`; requires Node >=22.11;
   leave `@tanstack/react-start` as-is (already resolves >=1.168.25). Crossing
   0.7.0 requires setting `initiate_login_uri` in the WorkOS dashboard (PKCE).

## The `_generated/server.js` stub exposure (fixed Phase 1)

Convex keys a function's public/internal visibility off the *builder* that
defines it. A committed `convex/_generated/server.js` stub that aliases
`internalQuery`/`internalMutation`/`internalAction` to the **public** generics
(`queryGeneric`/`mutationGeneric`/`actionGeneric`) registers every internal
function on the public API. Because Convex CLI >= 1.39.0 skips rewriting
`server.js` when the file already exists, the wrong committed stub is what gets
bundled and pushed on `convex dev`/`convex deploy` -- so it ships to real
deployments, and `_generated` being git-tracked means every clean-clone CI
deploy re-pushes it. Empirically reproduced this session: unauthenticated `curl`
to `users:provision` returned success with the buggy stub; "Could not find
public function" after the fix.

Both templates shipped the buggy stub. In `standard` it was inert (no internal
functions); in `auth` it exposed `auditLog.record` (anonymous forged-audit
write) and `auditLog.listAll` (anonymous full-table read).

**Fix:** committed genuine codegen output (`server.js` mapping internal builders
to the internal generics) in both templates, plus `tests/guard-generated-server.mjs`
(run by `npm test` and `.github/workflows/ci.yml`) that fails if any template's
committed `server.js` regresses.

## Phase 1 -- landed on `main` (this change)

- `templates/standard` + `templates/auth`: `convex/_generated/server.js`
  replaced with real codegen (internal builders -> internal generics).
- `tests/guard-generated-server.mjs` + `npm test` + `.github/workflows/ci.yml`:
  regression guard.
- `templates/standard`: the `messages` demo relabeled everywhere (function
  headers, schema comment, demo-page banner, R9STACK.md) as an **intentionally
  public, unauthenticated guestbook** -- it was world-read/write behind a login
  page that implied protection. `convex` bumped `^1.31.2` -> `^1.42.0`.
- `templates/standard/template.json`: re-synced from source; also removed the
  leaked `./template.json` / `./template-info.json` file entries (a
  starter->template rename left the compiler's ignore-list matching `starter*`
  but not `template*`, so authoring files -- including a stale self-copy with the
  old buggy stub -- were being written into every generated project).
- Versions: standard 1.1.1 -> 1.2.0, auth 1.0.0 -> 1.0.1, in `template.json`,
  `template-info.json` (standard), and `templates.json`.

Phase 1 was verified by generating a fresh project from the updated standard
`template.json` (`@tanstack/cli create --template`): generated `server.js` has
the internal generics, no authoring artifacts leak, convex is `^1.42.0`.

**Note on `template.json`:** Phase 1 edited the compiled artifacts directly
(surgical file-content sync), because only file *contents* changed and a full
`@tanstack/cli` recompile is fragile (auth lacks `template-info.json`). Phase 2
should do a proper `tanstack template compile` -- and fix the ignore-list so
`template*.json` stop leaking.

## Phase 2 -- auth-template rebuild (committed)

As shipped, the `auth` template authenticated no requests and didn't even
generate a building project. Defects found and fixed:
- `auth.config.ts` used the OIDC `{ domain, applicationID: 'convex' }` form,
  which cannot work (WorkOS serves no `.well-known/openid-configuration`, and no
  token carries `aud='convex'`) -> now dual `customJwt`, and throws on a missing
  `WORKOS_CLIENT_ID` instead of a silent placeholder.
- the client bridge destructured `{ isLoaded }` but the SDK field is `loading`,
  so Convex's "auth ready" signal was permanently wrong; and it ignored
  `forceRefreshToken` -> rewritten to the canonical hook.
- `src/start.ts` used the old `createStartHandler` API -> `createStart`.
- `users.getByWorkosId` (public query taking a client `workosId`) -> `internalQuery`.
- `auditLogReader.listRecent` kept as authed with a production-gating note
  (hard-gating it would break the demo for non-RBAC users).

Enforcement added: `convex/functions.ts` (authedQuery/authedMutation/authedAction
+ publicQuery/publicMutation + requirePermission), all modules migrated onto it,
and an ESLint ban on the raw builders (functions.ts is the sole exemption).
Config/deps: `convex.json` zero-config authKit block; SDK `^0.11.0` (0.8.2–0.9.x
carry an IDOR); added `@workos-inc/node ^10.7.0`, `convex-helpers ^0.1.120`,
`convex ^1.42.0`, Node `>=22.11`; created the missing `template-info.json`; README
now documents the mandatory JWT-template `aud` + profile-claims step. auth 2.0.0.

Also fixed template/base drift that broke generation for BOTH templates under the
current `@tanstack/cli` base: `vite-tsconfig-paths` missing from packageAdditions,
deprecated `baseUrl` in tsconfig, removed devtools `triggerImage` prop, and auth's
`template.json` lacked the required `deletedFiles` field.

**Verified:** both templates generate via `@tanstack/cli create`; the generated
auth project typechecks and builds clean; the generated standard project builds
clean (its 5 tsc errors are pre-existing iron-session legacy); the ESLint ban
fires on a raw-builder import.

**NOT verified (needs Ryan) -- the one open item:** a real signed-in token
resolving to a non-null `getUserIdentity()` against a live deployment. This is
blocked on two things only Ryan can do: (1) `npx convex login` on the **personal**
Convex team (the machine's token is the BambooHR account; per policy we don't
create scratch deployments there), and (2) the dashboard-only WorkOS Sessions
JWT-template `aud` step. Once logged in, `npx convex dev` on the auth template
regenerates `_generated` for real, and the curl matrix below can be run. The
negative/security cases are deterministic from the code + were proven live in
Phase 1 (the internal-function-not-found mechanism); only the positive path is
unproven.

## Verification method (unauthenticated-curl checks)

Against a dev deployment `https://<dep>.convex.cloud`:
- internal function unreachable: `curl -s .../api/mutation -H 'content-type:
  application/json' -d '{"path":"auditLog:record","args":{"action":"x","userId":"forged"},"format":"json"}'`
  must return `Could not find public function` (before the stub fix it
  *succeeds* -- that is the proof of the vuln).
- authed function rejects anonymous: same shape against `notes:list` must return
  the unauthenticated error, not data.
- `npx convex function-spec` lists no unexpected public functions.
- end-to-end: sign in through the UI, confirm data loads and
  `getUserIdentity()` is non-null.

## Corrections to the original handoff

The original `handoff-convex-data-plane-auth.md` was directionally right
(data-plane auth is real, wrappers are the mechanism, identity must not come
from client args) but wrong on specifics:
- **customJwt vs OIDC:** customJwt is correct; the repo's OIDC form is broken.
- **"trailing slash matters":** myth -- Convex trims it.
- **"provider 2 omits applicationID because tokens lack aud":** incoherent; the
  real reason is that a client-specific issuer isn't on Convex's shared-issuer
  blocklist. And the config needs the JWT-template `aud` step the handoff omitted.
- **"pin SDK ^0.8.2":** refuted -- that range carries an IDOR; target `^0.11.0`.
- **provisioning via a WorkOS Management API action on every mount:** wrong shape
  -- provision from JWT claims in a mutation.

Full research artifacts (6 evidence agents + 6 adversarial verdicts + synthesis)
are in the 2026-07-08 workflow transcript.

## Audit of other r9stack-derived repos (2026-07-08, report only)

The tell: `providers: []` (or the OIDC form) + functions taking `workosId` args
+ no `getUserIdentity`. Wrapper names differ per project (`authedQuery`,
`queryWithAuth`, `authenticatedQuery`), so grep for `customQuery(` /
`getUserIdentity` rather than one name.

- **mission-control:** fix authored on the unmerged `security-convex-auth`
  branch; `main`/`dev` are still vulnerable (29 modules, 16 taking `workosId`,
  zero `getUserIdentity`). **Not currently exploitable -- the Convex projects are
  paused.** Merge before any redeploy.
- **fortcreek-pq, starlog:** fixed (differently-named wrappers).
- **grant:** not vulnerable (customJwt + a `getUser(ctx)` helper on every public
  function).
- **mc-track1 / mc-track2 / mc-security:** fixed worktrees carrying `7881222`.
- **r9teststack, new-bhr-website, marathon-coach, bamboohr.dev,
  demo.r9stack.dev:** vulnerable -- all pre-fix clones of the old standard demo
  (`messages:list`/`send`, no auth). Confirmed live on the shared throwaway
  deployment. Regenerating or applying the wrapper pattern fixes each.

## Related

- Earlier backport work (against the pre-rename `starters/` paths) is preserved
  on branch `wip/convex-auth-backport-prerename` -- reference only, do not merge.
