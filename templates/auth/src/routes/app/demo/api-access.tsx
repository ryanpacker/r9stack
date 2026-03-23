/**
 * Demo: API Access (M2M) — Pattern E
 *
 * This page demonstrates HTTP Actions with API key authentication
 * for machine-to-machine access. External scripts and services
 * can call your Convex backend via HTTP.
 *
 * Key learning: Convex HTTP Actions are regular HTTP endpoints.
 * Combined with API keys stored as Convex environment variables,
 * they provide M2M access without any paid external services.
 */

import { createFileRoute } from '@tanstack/react-router'
import { Terminal, Key, Server, ArrowRight, ExternalLink } from 'lucide-react'

export const Route = createFileRoute('/app/demo/api-access')({
  component: ApiAccessDemo,
})

function ApiAccessDemo() {
  // Get the Convex site URL from the env — HTTP actions are served from .convex.site
  const convexUrl = import.meta.env.VITE_CONVEX_URL ?? 'https://your-deployment.convex.cloud'
  // HTTP actions are served from .convex.site (not .convex.cloud)
  const siteUrl = convexUrl.replace('.convex.cloud', '.convex.site')

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">API Access (M2M)</h1>
      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mb-4">
        Pattern E: M2M / API
      </span>

      {/* Explanation */}
      <div className="border border-border rounded-lg p-4 mb-6 bg-muted/30">
        <h3 className="text-sm font-semibold mb-2">How this works</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Convex <strong>HTTP Actions</strong> expose functions as regular HTTP endpoints.
          External systems can call them using standard HTTP requests.
        </p>
        <p className="text-sm text-muted-foreground">
          Authentication uses a simple <strong>API key</strong> stored as a Convex environment
          variable. No paid external services required. The API key is validated in the
          HTTP action handler before any data is returned.
        </p>
      </div>

      {/* Architecture Diagram */}
      <div className="border border-border rounded-lg p-4 mb-6 bg-muted/10">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Server className="w-4 h-4" />
          How M2M Access Works
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="bg-muted px-2 py-1 rounded">External Client</code>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <code className="bg-muted px-2 py-1 rounded">HTTP request + API key</code>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">Convex HTTP Action</code>
          </div>
          <div className="flex items-center gap-2 flex-wrap pl-4">
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Validates API key against env var</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap pl-4">
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <code className="bg-muted px-2 py-1 rounded">ctx.runQuery(internal.announcements.listInternal)</code>
          </div>
          <div className="flex items-center gap-2 flex-wrap pl-4">
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <code className="bg-muted px-2 py-1 rounded">JSON response</code>
          </div>
        </div>
      </div>

      {/* Setup Steps */}
      <div className="border border-border rounded-lg p-5 mb-6">
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Key className="w-4 h-4" />
          Setup Guide
        </h3>
        <div className="space-y-4">
          <Step
            number={1}
            title="Generate an API key"
            code="openssl rand -base64 32"
          />
          <Step
            number={2}
            title="Store it as a Convex environment variable"
            code='npx convex env set API_KEY "your-generated-key-here"'
            note="This stores the key server-side in Convex. It never touches client code."
          />
          <Step
            number={3}
            title="Call the endpoint"
            code={`curl -H "Authorization: Bearer YOUR_KEY" \\\n  ${siteUrl}/api/announcements`}
            note="Replace YOUR_KEY with the key you generated in step 1."
          />
        </div>
      </div>

      {/* Example curl commands */}
      <div className="border border-border rounded-lg p-5 mb-6">
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          Example Requests
        </h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Get announcements:</p>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  ${siteUrl}/api/announcements`}
            </pre>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Expected success response:</p>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`{
  "data": [
    {
      "_id": "abc123",
      "title": "Hello World",
      "content": "First announcement",
      "createdAt": 1711234567890
    }
  ]
}`}
            </pre>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Error (no API key):</p>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`curl ${siteUrl}/api/announcements

# Response: 401 Unauthorized
# { "error": "Unauthorized", "help": "Include header: Authorization: Bearer <your-api-key>" }`}
            </pre>
          </div>
        </div>
      </div>

      {/* When to use vs. Convex client */}
      <div className="border border-border rounded-lg p-4 mb-6 bg-muted/10">
        <h3 className="text-sm font-semibold mb-2">When to use HTTP Actions vs. Convex Client SDK</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-xs text-muted-foreground mb-1">USE HTTP ACTIONS WHEN:</p>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
              <li>External scripts (Python, Go, etc.)</li>
              <li>Webhook receivers</li>
              <li>CI/CD pipelines</li>
              <li>Partner API integrations</li>
              <li>Any non-JavaScript client</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-xs text-muted-foreground mb-1">USE CONVEX CLIENT SDK WHEN:</p>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
              <li>React/browser apps (this app!)</li>
              <li>Real-time subscriptions needed</li>
              <li>TypeScript type safety wanted</li>
              <li>Reactive updates (auto-refresh)</li>
              <li>Node.js scripts (can use JS SDK)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Code Reference */}
      <div className="border border-border rounded-lg p-4 bg-muted/20">
        <h3 className="text-sm font-semibold mb-2">Code Reference</h3>
        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`// convex/http.ts
http.route({
  path: '/api/announcements',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get('Authorization')
    const apiKey = process.env.API_KEY

    if (!apiKey || authHeader !== \`Bearer \${apiKey}\`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const data = await ctx.runQuery(
      internal.announcements.listInternal
    )
    return new Response(JSON.stringify({ data }))
  }),
})`}
        </pre>
      </div>

      {/* Learn more */}
      <div className="mt-6 text-center">
        <a
          href="https://docs.convex.dev/functions/http-actions"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Learn more about HTTP Actions
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}

function Step({
  number,
  title,
  code,
  note,
}: {
  number: number
  title: string
  code: string
  note?: string
}) {
  return (
    <div>
      <p className="text-sm font-medium mb-1">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs mr-2">
          {number}
        </span>
        {title}
      </p>
      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto ml-7">
        {code}
      </pre>
      {note && (
        <p className="text-xs text-muted-foreground mt-1 ml-7">{note}</p>
      )}
    </div>
  )
}
