# Tech Stack

This document describes the technical environment for the r9stack CLI project.

---

## CLI Technology

| Component | Technology | Version |
|-----------|------------|---------|
| Language | TypeScript | 5.x |
| Runtime | Node.js | >=18.0.0 |
| Build | tsc (TypeScript compiler) | — |
| Package Manager | npm | — |

### Key Dependencies

| Package | Purpose |
|---------|---------|
| commander | CLI argument parsing |
| @inquirer/prompts | Interactive prompts |
| execa | Process execution |
| picocolors | Terminal colors |

---

## Starter Compilation

Starters are compiled using TanStack Start's built-in starter system:

```bash
# Initialize starter metadata
npx @tanstack/create-start@latest starter init

# Compile starter to JSON
npx @tanstack/create-start@latest starter compile
```

See [tanstack-start-starter-system.md](tanstack-start-starter-system.md) for detailed documentation.

---

## Testing

### Framework

- **Vitest** (planned) - Fast unit testing compatible with TypeScript
- **E2E tests** - Shell scripts or Vitest tests that invoke the CLI and verify output

### Test Location & Naming

```
tests/
├── output/          # Temporary test output (gitignored)
└── e2e/             # End-to-end tests
    └── *.test.ts    # Test files
```

### Running Tests

```bash
# Run all tests (once configured)
npm test

# Run E2E tests
npm run test:e2e
```

### Patterns & Conventions

- E2E tests create projects in `tests/output/`
- Compare generated files against expected structure
- Clean up test output after successful runs

---

## Generated Project Technology

Projects created by r9stack use:

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React | 19.x |
| Meta-framework | TanStack Start | 1.x |
| Backend/Database | Convex | 1.x |
| Auth | WorkOS AuthKit (`@workos/authkit-tanstack-react-start`) | 0.8.x |
| Convex auth helpers | convex-helpers | 0.1.x |
| Styling | Tailwind CSS | 4.x |
| Component Library | shadcn/ui | — |

### Generated Project Auth Architecture

The Convex data plane is authenticated end to end (backported from the
mission-control security fix, July 2026):

1. **Convex validates WorkOS JWTs** — `convex/auth.config.ts` defines two
   `customJwt` providers (WorkOS SSO and AuthKit user-management issuers)
   against the WorkOS JWKS.
2. **Wrapper builders inject verified identity** — `convex/functions.ts`
   provides `authedQuery` / `authedMutation` / `requireActionUser`, which
   resolve the JWT subject to a `users` row and expose it as `ctx.user`.
   Public functions never take caller-identity args.
3. **The official AuthKit SDK replaces iron-session** — middleware in
   `src/start.ts`, PKCE sign-in/callback/sign-out routes, and a
   `ConvexProviderWithAuth` bridge that pushes the access token into the
   Convex websocket. `users.ensureUser` provisions users server-side.

Three manual setup steps per generated project (documented in the starter
README): `npx convex env set WORKOS_CLIENT_ID/WORKOS_API_KEY` (Convex does
not read `.env`), WorkOS dashboard redirect registrations (login callback +
sign-out redirect), and a 32+ char `WORKOS_COOKIE_PASSWORD`.

**AuthKit SDK version pin:** SDK 0.9.0+ requires `@tanstack/react-start >=
1.168.25`; the starter is on `^1.132.0`, so the SDK is pinned to `^0.8.2`.
Take the SDK upgrade together with a TanStack Start upgrade, not separately.

---

## Development Workflow

### Building the CLI

```bash
npm run build    # Compile TypeScript to dist/
npm run dev      # Watch mode
```

### Testing Locally

```bash
npm link         # Link globally for testing
r9stack init test-project
```

### Starter Development

```bash
cd starters/standard
# Make changes to the project
npx @tanstack/create-start@latest starter compile
# starter.json is regenerated
```
