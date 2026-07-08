import { v } from 'convex/values'
import { authedMutation, authedQuery } from './functions'

const MAX_MESSAGE_LENGTH = 1024

/**
 * List all messages with author info, ordered by creation time (newest first).
 *
 * Demo of the authed-wrapper pattern: `authedQuery` rejects unauthenticated
 * callers before the handler runs, and `ctx.user` is the verified caller.
 */
export const list = authedQuery({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_created_at')
      .order('desc')
      .collect()

    // Batch-fetch the authors and join them in
    const userIds = [...new Set(messages.map((m) => m.userId))]
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)))
    const userMap = new Map(users.filter(Boolean).map((u) => [u!._id, u!]))

    return messages.map((message) => {
      const user = userMap.get(message.userId)
      return {
        _id: message._id,
        text: message.text,
        createdAt: message.createdAt,
        author: user
          ? {
              name:
                [user.firstName, user.lastName].filter(Boolean).join(' ') ||
                user.email,
              avatar: user.profilePictureUrl ?? null,
            }
          : null,
      }
    })
  },
})

/**
 * Add a new message, attributed to the authenticated caller.
 *
 * Note the author is `ctx.user` (verified identity), never a client arg.
 */
export const send = authedMutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const text = args.text.trim()
    if (text.length === 0) {
      throw new Error('Message cannot be empty')
    }
    if (text.length > MAX_MESSAGE_LENGTH) {
      throw new Error(`Message exceeds ${MAX_MESSAGE_LENGTH} character limit`)
    }

    const messageId = await ctx.db.insert('messages', {
      userId: ctx.user._id,
      text,
      createdAt: Date.now(),
    })
    return messageId
  },
})
