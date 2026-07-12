import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * ⚠️ PUBLIC, UNAUTHENTICATED DEMO — do not store real data here.
 *
 * These functions use the raw `query`/`mutation` builders with no auth check,
 * so ANYONE with the deployment URL can read and write this table directly via
 * the Convex API — the app's login wall does NOT protect it. This is fine for a
 * throwaway "public guestbook" demo and nothing else.
 *
 * For real features, authenticate every public function: validate the caller's
 * identity and derive it from the verified token, never from client args. See
 * the `auth` template (r9stack init --template auth) for the customJwt +
 * `authedQuery`/`authedMutation` wrapper pattern.
 */

/**
 * List all guestbook messages, newest first. PUBLIC — see file header.
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
 * Add a guestbook message. PUBLIC and unauthenticated — see file header.
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
