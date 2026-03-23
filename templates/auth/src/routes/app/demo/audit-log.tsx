/**
 * Demo: Audit Log — Pattern D
 *
 * This page demonstrates internal Convex functions.
 * The audit log entries are created AUTOMATICALLY by other operations
 * (creating/deleting notes, updating settings). They cannot be created
 * directly from the client.
 *
 * Key learning: internalMutation and internalQuery do NOT appear in the
 * client API. The only way to write to the audit log is from another
 * Convex function using ctx.runMutation(internal.auditLog.record, ...).
 */

import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Lock, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/app/demo/audit-log')({
  component: AuditLogDemo,
})

function AuditLogDemo() {
  const auditLogs = useQuery(api.auditLogReader.listRecent)

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Audit Log</h1>
      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 mb-4">
        Pattern D: Internal
      </span>

      {/* Explanation */}
      <div className="border border-border rounded-lg p-4 mb-6 bg-muted/30">
        <h3 className="text-sm font-semibold mb-2">How this works</h3>
        <p className="text-sm text-muted-foreground mb-2">
          The write function{' '}
          <code className="bg-muted px-1 py-0.5 rounded text-xs">auditLog.record</code>{' '}
          is an <code className="bg-muted px-1 py-0.5 rounded text-xs">internalMutation</code>.
          It does <strong>not</strong> exist in the client API. You cannot call it from React.
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          Entries appear here automatically when you:
        </p>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>Create or delete a note (Private Notes demo)</li>
          <li>Update an admin setting (Admin Panel demo)</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-2">
          Try creating a note in the Private Notes demo, then come back here to see the entry!
        </p>
      </div>

      {/* Internal vs Public */}
      <div className="border border-border rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold mb-3">
          <Lock className="w-4 h-4 inline mr-1" />
          Internal vs Public Functions
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              INTERNAL (server-only)
            </p>
            <code className="text-xs bg-muted p-2 rounded block">
              internalMutation, internalQuery
            </code>
            <p className="text-xs text-muted-foreground mt-1">
              Called via: <code>internal.auditLog.record</code>
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              PUBLIC (client-callable)
            </p>
            <code className="text-xs bg-muted p-2 rounded block">
              mutation, query
            </code>
            <p className="text-xs text-muted-foreground mt-1">
              Called via: <code>api.notes.create</code>
            </p>
          </div>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="border border-border rounded-lg p-4 mb-6 bg-muted/10">
        <h3 className="text-sm font-semibold mb-2">How entries are created</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <code className="bg-muted px-2 py-1 rounded">React: useMutation(api.notes.create)</code>
          <ArrowRight className="w-3 h-3" />
          <code className="bg-muted px-2 py-1 rounded">notes.create mutation runs</code>
          <ArrowRight className="w-3 h-3" />
          <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
            ctx.runMutation(internal.auditLog.record)
          </code>
          <ArrowRight className="w-3 h-3" />
          <code className="bg-muted px-2 py-1 rounded">Entry saved to audit_logs table</code>
        </div>
      </div>

      {/* Audit Log Entries */}
      <h2 className="text-lg font-semibold mb-3">Recent Entries</h2>
      {auditLogs === undefined ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : auditLogs.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <Lock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No audit log entries yet.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Go create or delete a note in the Private Notes demo to generate entries.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {auditLogs.map((entry) => (
            <div
              key={entry._id}
              className="border border-border rounded-md p-3 flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-semibold bg-muted px-1.5 py-0.5 rounded">
                    {entry.action}
                  </code>
                </div>
                {entry.details && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {entry.details}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Code Reference */}
      <div className="mt-8 border border-border rounded-lg p-4 bg-muted/20">
        <h3 className="text-sm font-semibold mb-2">Code Reference</h3>
        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`// convex/auditLog.ts — INTERNAL, not callable from client
export const record = internalMutation({
  args: {
    action: v.string(),
    userId: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('audit_logs', {
      ...args,
      timestamp: Date.now(),
    })
  },
})

// Called from notes.ts:
await ctx.runMutation(internal.auditLog.record, {
  action: 'note:created',
  userId: identity.subject,
  details: \`Created note: \${args.title}\`,
})`}
        </pre>
      </div>
    </div>
  )
}
