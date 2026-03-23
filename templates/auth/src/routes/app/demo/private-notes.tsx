/**
 * Demo: Private Notes — Pattern B
 *
 * This page demonstrates authenticated Convex functions with per-user data scoping.
 * Each user can only see and modify their own notes.
 *
 * Key learning: identity.subject is the user's unique ID from WorkOS.
 * All data is scoped using this ID. The ownership check prevents
 * User A from accessing User B's data.
 */

import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Trash2 } from 'lucide-react'
import type { Id } from '../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/app/demo/private-notes')({
  component: PrivateNotesDemo,
})

function PrivateNotesDemo() {
  const notes = useQuery(api.notes.list)
  const identity = useQuery(api.notes.getMyIdentity)
  const createNote = useMutation(api.notes.create)
  const removeNote = useMutation(api.notes.remove)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    await createNote({ title: title.trim(), content: content.trim() })
    setTitle('')
    setContent('')
  }

  const handleDelete = async (noteId: Id<'notes'>) => {
    await removeNote({ noteId })
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Private Notes</h1>
      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-4">
        Pattern B: Authenticated
      </span>

      {/* Explanation */}
      <div className="border border-border rounded-lg p-4 mb-6 bg-muted/30">
        <h3 className="text-sm font-semibold mb-2">How this works</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Every function in <code className="bg-muted px-1 py-0.5 rounded text-xs">convex/notes.ts</code>{' '}
          calls <code className="bg-muted px-1 py-0.5 rounded text-xs">ctx.auth.getUserIdentity()</code>{' '}
          and throws if the user is not authenticated.
        </p>
        <p className="text-sm text-muted-foreground">
          Data is scoped using <code className="bg-muted px-1 py-0.5 rounded text-xs">identity.subject</code>{' '}
          (the WorkOS user ID). The list query filters by userId, and the delete
          mutation checks ownership before allowing deletion.
        </p>
      </div>

      {/* Identity Debug Panel */}
      {identity && (
        <div className="border border-border rounded-lg p-4 mb-6 bg-muted/10">
          <h3 className="text-sm font-semibold mb-2">
            Your Identity (from ctx.auth.getUserIdentity())
          </h3>
          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
            {JSON.stringify(identity, null, 2)}
          </pre>
          <p className="text-xs text-muted-foreground mt-2">
            The <code>subject</code> field above is used as <code>userId</code>{' '}
            to scope all notes to you.
          </p>
        </div>
      )}

      {/* Create Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Note content"
          rows={3}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
        />
        <Button type="submit" disabled={!title.trim() || !content.trim()}>
          Create Note
        </Button>
      </form>

      {/* Notes List */}
      <h2 className="text-lg font-semibold mb-3">Your Notes</h2>
      {notes === undefined ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No notes yet. Create one above! Only you will be able to see it.
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note._id}
              className="border border-border rounded-lg p-4 flex justify-between items-start"
            >
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{note.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {note.content}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDelete(note._id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Code Reference */}
      <div className="mt-8 border border-border rounded-lg p-4 bg-muted/20">
        <h3 className="text-sm font-semibold mb-2">Code Reference</h3>
        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`// convex/notes.ts
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }
    // Only return THIS user's notes
    return await ctx.db
      .query('notes')
      .withIndex('by_user_and_created', (q) =>
        q.eq('userId', identity.subject)
      )
      .order('desc')
      .collect()
  },
})`}
        </pre>
      </div>
    </div>
  )
}
