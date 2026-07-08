# Convex Data-Plane Auth (r9stack templates)

**Status (2026-07-08):** Phase 1 landed on `main` (stub-exposure fix + standard
relabel + CI guard). Phase 2 (auth-template rebuild) is planned, not started.

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

## Phase 2 -- auth-template rebuild (planned, needs a live deployment)

The `auth` template does not authenticate a single request as shipped. Do not
promote it to default until fixed and proven live. Verified defects:
- `auth.config.ts` uses the OIDC `{ domain, applicationID: 'convex' }` form,
  which cannot work: WorkOS serves no `.well-known/openid-configuration` (404),
  and no WorkOS token carries `aud='convex'`.
- the client bridge destructures `{ isLoaded }` from `useAuth()`, but the SDK
  field is `loading` -- so Convex's "auth ready" signal is permanently wrong.
- `forceRefreshToken` is ignored.
- `users.getByWorkosId` takes a client `workosId` and returns that user without
  comparing to `identity.subject` (IDOR); `auditLogReader.listRecent` lets any
  authenticated user read all audit rows.

Steps: adopt the dual `customJwt` config (throw, don't fall back to a placeholder
clientId); fix the bridge and mount it in `InnerWrap`; add `convex/functions.ts`
+ the ESLint ban + `convex function-spec` CI check; make `getByWorkosId` an
`internalQuery` and gate `listRecent` on an admin permission; add
`convex-helpers`, bump the SDK to `^0.11.0` + add `@workos-inc/node`; add the
missing `template-info.json`; add the mandatory JWT-template README step; then
**verify against a live dev deployment** (Ryan's personal Convex team, not
BambooHR's -- see the scratch-project note) that a signed-in call yields a
non-null `getUserIdentity()`.

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
