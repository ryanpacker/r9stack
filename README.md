# r9stack

A CLI tool that scaffolds opinionated SaaS projects with a fully functional walking skeleton—a complete frontend, backend, and database stack with auth and payments pre-integrated.

## Status

🚧 **Early Development** - The CLI currently scaffolds TanStack Start projects. Additional integrations (shadcn, Convex, WorkOS) are coming in future releases.

| Feature | Status |
|---------|--------|
| TanStack Start scaffold | ✅ Working |
| shadcn/ui integration | 🔜 Next |
| Convex backend | 🔜 Planned |
| WorkOS auth | 🔜 Planned |
| Stripe payments | 📋 Post-V1 |

## Why r9stack?

Agentic coding has dramatically accelerated feature development, but initial project setup—configuring the frontend framework, wiring up the backend and database, integrating auth providers, setting up payments—remains tedious and error-prone.

r9stack eliminates this friction. Run a single command and have a scaffolded full-stack project in minutes.

## Tech Stack (V1 Target)

| Layer | Technology |
|-------|------------|
| Frontend | React via TanStack Start |
| Backend | Convex |
| Database | Convex (built-in) |
| Auth | WorkOS |
| Payments | Stripe |
| Styling | shadcn/ui (Tailwind CSS) |

## Getting Started

### From npm (once published)

```bash
# Install globally
npm install -g r9stack

# Or run directly with npx
npx r9stack init my-project
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/ryanpacker/r9stack.git
cd r9stack

# Install dependencies and build
npm install
npm run build

# Link globally for testing
npm link

# Create a new project
r9stack init my-project
```

## Usage

```bash
# Interactive mode - prompts for project name
r9stack init

# Or provide project name directly
r9stack init my-awesome-app

# View help
r9stack --help
```

## What Gets Generated (Current)

Running `r9stack init` currently creates a TanStack Start project with:

- React + file-based routing
- TypeScript configuration
- ESLint + Prettier
- Vite build setup
- Git repository initialized

## Planned Features (V1)

The generated project will include:

- TanStack Start frontend with routing and basic application shell
- Convex backend with API patterns established
- Convex database configured and connected
- shadcn/ui component library configured with Tailwind
- User authentication via WorkOS + Convex integration
- Clear setup instructions for third-party services

## License

Apache 2.0 - See [LICENSE](LICENSE) for details.
