import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all messages, ordered by creation time (newest first)
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
    return messages;
  },
});

/**
 * Add a new message
 */
export const send = mutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      text: args.text,
      createdAt: Date.now(),
    });
    return messageId;
  },
});

