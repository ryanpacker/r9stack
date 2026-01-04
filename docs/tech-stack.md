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
| Auth | WorkOS AuthKit | 7.x |
| Sessions | iron-session | 8.x |
| Styling | Tailwind CSS | 4.x |
| Component Library | shadcn/ui | — |

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
