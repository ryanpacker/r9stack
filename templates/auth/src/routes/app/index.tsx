/**
 * App Dashboard — /app (Protected)
 *
 * The main dashboard shown after login.
 * Displays the user's identity and links to all auth pattern demos.
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAuth } from '@workos/authkit-tanstack-react-start/client'

export const Route = createFileRoute('/app/')({
  component: Dashboard,
})

function Dashboard() {
  const { user } = useAuth()
  const convexUser = useQuery(api.users.me)

  const demos = [
    {
      title: 'Public Data',
      description:
        'Pattern A: Convex functions with no auth check. Anyone can call them, even without logging in.',
      path: '/app/demo/public-data',
      pattern: 'Public',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    {
      title: 'Private Notes',
      description:
        'Pattern B: Authenticated functions. Data scoped per-user. Only you can see your notes.',
      path: '/app/demo/private-notes',
      pattern: 'Authenticated',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
    {
      title: 'Admin Panel',
      description:
        'Pattern C: Role-based access. Requires specific WorkOS RBAC permissions to view/edit settings.',
      path: '/app/demo/admin-panel',
      pattern: 'Role-Based',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    },
    {
      title: 'Audit Log',
      description:
        'Pattern D: Internal functions. Entries created automatically by other operations. Cannot be called from the client.',
      path: '/app/demo/audit-log',
      pattern: 'Internal',
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    },
    {
      title: 'API Access',
      description:
        'Pattern E: HTTP Actions with API key auth. For scripts, CI/CD, and external services.',
      path: '/app/demo/api-access',
      pattern: 'M2M / API',
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
  ]

  return (
    <div className="p-8 max-w-5xl">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Explore the auth pattern demos below. Each one demonstrates a
          different way to handle authentication and authorization in Convex.
        </p>
      </div>

      {/* Identity Card */}
      {convexUser && (
        <div className="border border-border rounded-lg p-4 mb-8 bg-muted/30">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            Your Identity (from Convex database)
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">WorkOS ID: </span>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {convexUser.workosId}
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">Email: </span>
              {convexUser.email}
            </div>
            <div>
              <span className="text-muted-foreground">Name: </span>
              {convexUser.firstName} {convexUser.lastName}
            </div>
            <div>
              <span className="text-muted-foreground">Joined: </span>
              {new Date(convexUser.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {/* Demo Cards */}
      <h2 className="text-lg font-semibold mb-4">Auth Pattern Demos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demos.map((demo) => (
          <Link
            key={demo.path}
            to={demo.path}
            className="block border border-border rounded-lg p-5 hover:border-primary/40 hover:bg-muted/20 transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
                {demo.title}
              </h3>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${demo.color}`}
              >
                {demo.pattern}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{demo.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
