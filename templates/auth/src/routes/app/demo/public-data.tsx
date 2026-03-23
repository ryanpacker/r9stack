/**
 * Demo: Public Data — Pattern A
 *
 * This page demonstrates Convex functions that have NO auth check.
 * The announcements query and mutation are public — anyone can call them.
 *
 * Key learning: The absence of ctx.auth.getUserIdentity() is intentional.
 * Public functions are a deliberate choice, not an oversight.
 */

import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useState } from 'react'
import { Button } from '../../../components/ui/button'

export const Route = createFileRoute('/app/demo/public-data')({
  component: PublicDataDemo,
})

function PublicDataDemo() {
  const announcements = useQuery(api.announcements.list)
  const createAnnouncement = useMutation(api.announcements.create)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    await createAnnouncement({ title: title.trim(), content: content.trim() })
    setTitle('')
    setContent('')
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Public Data</h1>
      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mb-4">
        Pattern A: Public
      </span>

      {/* Explanation */}
      <div className="border border-border rounded-lg p-4 mb-6 bg-muted/30">
        <h3 className="text-sm font-semibold mb-2">How this works</h3>
        <p className="text-sm text-muted-foreground mb-2">
          The Convex functions behind this page have <strong>no auth check</strong>.
          The <code className="bg-muted px-1 py-0.5 rounded text-xs">announcements.list</code> query
          does not call <code className="bg-muted px-1 py-0.5 rounded text-xs">ctx.auth.getUserIdentity()</code>.
        </p>
        <p className="text-sm text-muted-foreground">
          Even though you are logged in right now, this Convex function does not require it.
          Anyone with the Convex deployment URL could call this function directly
          using the Convex client SDK.
        </p>
      </div>

      {/* Create Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Announcement title"
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Announcement content"
          rows={3}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
        />
        <Button type="submit" disabled={!title.trim() || !content.trim()}>
          Post Announcement
        </Button>
      </form>

      {/* Announcements List */}
      <h2 className="text-lg font-semibold mb-3">Announcements</h2>
      {announcements === undefined ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : announcements.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No announcements yet. Create one above!
        </p>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className="border border-border rounded-lg p-4"
            >
              <h3 className="font-semibold mb-1">{announcement.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {announcement.content}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(announcement.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Code Reference */}
      <div className="mt-8 border border-border rounded-lg p-4 bg-muted/20">
        <h3 className="text-sm font-semibold mb-2">Code Reference</h3>
        <p className="text-xs text-muted-foreground mb-2">
          See <code>convex/announcements.ts</code> — notice there is no{' '}
          <code>ctx.auth.getUserIdentity()</code> call.
        </p>
        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`// convex/announcements.ts
export const list = query({
  args: {},
  handler: async (ctx) => {
    // No auth check — intentionally public
    return await ctx.db
      .query('announcements')
      .withIndex('by_created_at')
      .order('desc')
      .collect()
  },
})`}
        </pre>
      </div>
    </div>
  )
}
