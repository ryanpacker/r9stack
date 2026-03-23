/**
 * PATTERN E: HTTP ACTIONS — M2M / API Access
 *
 * HTTP Actions expose Convex functions as regular HTTP endpoints.
 * External systems can call them using standard HTTP requests (curl, fetch, etc.).
 *
 * This file demonstrates API key authentication for machine-to-machine access
 * WITHOUT requiring paid WorkOS features.
 *
 * When to use this pattern:
 * - External services calling your API (webhooks, integrations)
 * - Scripts and CLI tools accessing your data
 * - CI/CD pipelines
 * - Mobile backends calling Convex via HTTP
 * - Any non-browser client that needs data access
 *
 * Demo page: /app/demo/api-access
 *
 * SETUP:
 * 1. Generate an API key: openssl rand -base64 32
 * 2. Store it as a Convex env var: npx convex env set API_KEY "your-key"
 * 3. Call the endpoint: curl -H "Authorization: Bearer your-key" https://your.convex.site/api/announcements
 *
 * SECURITY NOTE:
 * API keys are stored as Convex environment variables, NOT in .env files.
 * They never touch client-side code. Convex env vars are set via the CLI
 * and are only accessible in server-side functions.
 */

import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'

const http = httpRouter()

/**
 * GET /api/announcements — Returns all announcements.
 *
 * Requires a valid API key in the Authorization header.
 * Uses Bearer token format: Authorization: Bearer <your-api-key>
 */
http.route({
  path: '/api/announcements',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    // Step 1: Extract and validate the API key
    const authHeader = request.headers.get('Authorization')
    const apiKey = process.env.API_KEY

    if (!apiKey) {
      // API_KEY not configured — return helpful error
      return new Response(
        JSON.stringify({
          error: 'API key not configured',
          help: 'Set the API_KEY environment variable: npx convex env set API_KEY "your-key"',
        }),
        {
          status: 500,
          headers: corsHeaders('application/json'),
        },
      )
    }

    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          help: 'Include header: Authorization: Bearer <your-api-key>',
        }),
        {
          status: 401,
          headers: corsHeaders('application/json'),
        },
      )
    }

    // Step 2: API key is valid — fetch data using internal function
    // HTTP actions can call internal functions, keeping business logic encapsulated
    const announcements = await ctx.runQuery(
      internal.announcements.listInternal,
    )

    return new Response(JSON.stringify({ data: announcements }), {
      status: 200,
      headers: corsHeaders('application/json'),
    })
  }),
})

/**
 * OPTIONS /api/announcements — CORS preflight handler.
 *
 * Required for cross-origin requests from browsers.
 * M2M clients (curl, server scripts) don't need this,
 * but it's good practice to include it.
 */
http.route({
  path: '/api/announcements',
  method: 'OPTIONS',
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    })
  }),
})

/**
 * Helper: Build CORS headers for HTTP action responses.
 */
function corsHeaders(contentType?: string): HeadersInit {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
  }
  if (contentType) {
    headers['Content-Type'] = contentType
  }
  return headers
}

export default http
