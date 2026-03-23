/**
 * Landing Page — / (Public)
 *
 * The public landing page shown to all visitors.
 * Shows auth status and links to sign in or access the app.
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { useConvexAuth } from 'convex/react'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <AuthPatterns />
      <Footer />
    </div>
  )
}

function Header() {
  const { isLoading, isAuthenticated } = useConvexAuth()

  return (
    <header className="border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/images/your-project-logo.png"
            alt=""
            className="w-6 h-6"
          />
          <span className="text-lg font-semibold">__PROJECT_NAME__</span>
        </div>
        <div>
          {isLoading ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : isAuthenticated ? (
            <Button asChild>
              <Link to="/app">Go to App</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/auth/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

function Hero() {
  const { isLoading, isAuthenticated } = useConvexAuth()

  return (
    <section className="max-w-4xl mx-auto px-6 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight mb-4">
        Auth Template
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        A production-grade authentication template demonstrating proper auth
        patterns with TanStack Start, Convex, and WorkOS AuthKit.
      </p>
      <div className="flex gap-4 justify-center">
        {isLoading ? null : isAuthenticated ? (
          <Button size="lg" asChild>
            <Link to="/app">Open App</Link>
          </Button>
        ) : (
          <>
            <Button size="lg" asChild>
              <Link to="/auth/sign-in">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a
                href="https://github.com/ryanpacker/r9stack"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Source
              </a>
            </Button>
          </>
        )}
      </div>
    </section>
  )
}

function AuthPatterns() {
  const patterns = [
    {
      title: 'Public Functions',
      description:
        'Convex queries with no auth check. Anyone can call them.',
      icon: '🌐',
    },
    {
      title: 'Authenticated Functions',
      description:
        'Requires a valid JWT. Data scoped per-user via identity.subject.',
      icon: '🔐',
    },
    {
      title: 'Role-Based (RBAC)',
      description:
        'Checks WorkOS permissions from JWT claims. Admin-only features.',
      icon: '👑',
    },
    {
      title: 'Internal Functions',
      description:
        'Server-only functions. Cannot be called from the client.',
      icon: '🔒',
    },
    {
      title: 'API Access (M2M)',
      description:
        'HTTP Actions with API key auth for scripts and external services.',
      icon: '🤖',
    },
    {
      title: 'Full Token Flow',
      description:
        'WorkOS issues JWT, TanStack Start manages sessions, Convex validates.',
      icon: '🔄',
    },
  ]

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold text-center mb-10">
        Five Auth Patterns, One Template
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patterns.map((pattern) => (
          <div
            key={pattern.title}
            className="border border-border rounded-lg p-6 hover:border-primary/30 transition-colors"
          >
            <div className="text-3xl mb-3">{pattern.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{pattern.title}</h3>
            <p className="text-sm text-muted-foreground">
              {pattern.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
        Built with{' '}
        <a
          href="https://github.com/ryanpacker/r9stack"
          className="underline hover:text-foreground"
        >
          r9stack
        </a>{' '}
        — TanStack Start + Convex + WorkOS AuthKit
      </div>
    </footer>
  )
}
