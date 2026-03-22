import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Button } from '../../../components/ui/button'
import { useState } from 'react'

export const Route = createFileRoute('/app/demo/convex/messages')({
  component: MessagesDemo,
})

function MessagesDemo() {
  const messages = useQuery(api.messages.list)
  const sendMessage = useMutation(api.messages.send)
  const [newMessage, setNewMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    await sendMessage({ text: newMessage.trim() })
    setNewMessage('')
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Convex Messages Demo</h1>
      <p className="text-muted-foreground mb-8">
        Real-time message board powered by Convex. Open this page in two tabs to
        see messages sync instantly!
      </p>

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="submit" disabled={!newMessage.trim()}>
          Send
        </Button>
      </form>

      {/* Messages List */}
      <div className="space-y-3">
        {messages === undefined ? (
          <p className="text-muted-foreground">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-muted-foreground">
            No messages yet. Send the first one!
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className="p-4 bg-muted/50 rounded-lg border border-border"
            >
              <p className="text-foreground">{message.text}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(message.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

