# r9stack

A CLI tool that scaffolds opinionated SaaS projects with a fully functional walking skeleton—a complete frontend, backend, and database stack with auth and payments pre-integrated.

## Why r9stack?

Agentic coding has dramatically accelerated feature development, but initial project setup—configuring the frontend framework, wiring up the backend and database, integrating auth providers, setting up payments—remains tedious and error-prone.

r9stack eliminates this friction. Run a single command and have a scaffolded full-stack project in minutes.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React via TanStack Start |
| Backend | Convex |
| Database | Convex (built-in) |
| Auth | WorkOS |
| Payments | Stripe |
| Styling | shadcn/ui (Tailwind CSS) |

## Features

The generated project includes:

- TanStack Start frontend with routing and basic application shell
- Convex backend with API patterns established
- Convex database configured and connected
- shadcn/ui component library configured with Tailwind
- User authentication via WorkOS + Convex integration
- Stripe payment integration (subscription-ready)
- Clear setup instructions for third-party services

## Getting Started

```bash
# Install globally
npm install -g r9stack

# Or run directly with npx
npx r9stack init
```

The CLI will scaffold your project and provide step-by-step instructions for configuring third-party services (WorkOS, Convex, Stripe).

## License

Apache 2.0 - See [LICENSE](LICENSE) for details.
