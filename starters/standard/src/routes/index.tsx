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
              src="/images/your-project-logo.png"
              alt="<%= projectName %>"
              className="w-8 h-8"
            />
            <span className="text-xl font-semibold text-foreground">
              <%= projectName %>
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
            Welcome to
            <span className="block text-primary mt-2"><%= projectName %></span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10">
            Your modern web application is ready to go. This project includes
            authentication, a real-time database, and beautiful UI components —
            everything you need to start building.
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

          {/* Tech Stack Section */}
          <div className="mt-8 mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Built With Modern Technology
            </h2>
          </div>

          {/* Tech Stack Cards - 8 items in 2 rows */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TechCard
              title="TanStack Start"
              description="Full-stack React framework with SSR and server functions"
            />
            <TechCard
              title="React"
              description="Declarative UI library for building user interfaces"
            />
            <TechCard
              title="TypeScript"
              description="Type-safe JavaScript for reliable, maintainable code"
            />
            <TechCard
              title="Tailwind CSS"
              description="Utility-first CSS framework for rapid styling"
            />
            <TechCard
              title="Vite"
              description="Lightning-fast build tool and dev server"
            />
            <TechCard
              title="Convex"
              description="Real-time backend with automatic sync and subscriptions"
            />
            <TechCard
              title="WorkOS"
              description="Enterprise-ready authentication with SSO and MFA"
            />
            <TechCard
              title="shadcn/ui"
              description="Beautiful, accessible components built with Radix"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Built with</span>
          <img
            src="/images/r9stack-icon-circle.png"
            alt="r9stack"
            className="w-6 h-6"
          />
          <span className="font-medium">r9stack</span>
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
