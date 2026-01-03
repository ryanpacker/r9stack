import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Demo messages table
  messages: defineTable({
    text: v.string(),
    createdAt: v.number(),
  }).index('by_created_at', ['createdAt']),

  // Users table for storing WorkOS user information
  users: defineTable({
    // WorkOS user ID
    workosId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_workos_id', ['workosId'])
    .index('by_email', ['email']),
})
