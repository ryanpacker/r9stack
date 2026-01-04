import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '../lib/auth-client'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/')({ component: LandingPage })

function LandingPage() {
  const { user, isAuthenticated, isLoading, signIn } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/r9stack-logo-markonly-circle.png"
              alt="r9stack"
              className="w-8 h-8"
            />
            <span className="text-xl font-semibold text-foreground">
              r9stack
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
            ) : isAuthenticated ? (
              <Link to="/app">
                <Button>Go to App</Button>
              </Link>
            ) : (
              <>
                <Button variant="ghost" onClick={signIn}>
                  Sign In
                </Button>
                <Button onClick={signIn}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight text-foreground mb-6">
            Build Modern Web Apps
            <span className="block text-primary mt-2">In Minutes, Not Weeks</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10">
            r9stack is a production-ready walking skeleton with TanStack Start,
            Convex, WorkOS, and shadcn/ui pre-integrated. Skip the boilerplate
            and start building your product.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            {isAuthenticated ? (
              <Link to="/app">
                <Button size="lg" className="px-8">
                  Open App
                </Button>
              </Link>
            ) : (
              <>
                <Button size="lg" className="px-8" onClick={signIn}>
                  Get Started Free
                </Button>
                <Button size="lg" variant="outline" onClick={signIn}>
                  Sign In
                </Button>
              </>
            )}
          </div>

          {/* Welcome message for authenticated users */}
          {isAuthenticated && user && (
            <div className="mb-16 p-4 bg-muted/50 rounded-lg border border-border inline-block">
              <p className="text-sm text-muted-foreground">
                Signed in as{' '}
                <span className="font-medium text-foreground">
                  {user.email}
                </span>
              </p>
            </div>
          )}

          {/* Tech Stack Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TechCard
              title="TanStack Start"
              description="Full-stack React framework with SSR, file-based routing, and server functions"
            />
            <TechCard
              title="Convex"
              description="Real-time backend with automatic sync, subscriptions, and built-in database"
            />
            <TechCard
              title="WorkOS"
              description="Enterprise-ready authentication with SSO, MFA, and user management"
            />
            <TechCard
              title="shadcn/ui"
              description="Beautiful, accessible UI components built with Radix and Tailwind CSS"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          Built with r9stack — the opinionated full-stack starter for modern web
          applications.
        </div>
      </footer>
    </div>
  )
}

function TechCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="p-6 bg-card rounded-lg border border-border text-left">
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
