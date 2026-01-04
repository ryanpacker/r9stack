import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../../lib/auth-client'

export const Route = createFileRoute('/app/')({
  component: AppHome,
})

function AppHome() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8">
      <div className="max-w-lg text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          You're now signed in to r9stack. Explore the demos or start building
          your application.
        </p>
        <div className="flex flex-col gap-4 text-left bg-muted/50 rounded-lg p-6 border border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Tech Stack
          </h2>
          <ul className="space-y-2 text-sm text-foreground">
            <li>TanStack Start — Full-stack React framework</li>
            <li>Convex — Real-time backend & database</li>
            <li>WorkOS — Authentication ✓</li>
            <li>shadcn/ui — UI components with Tailwind</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
