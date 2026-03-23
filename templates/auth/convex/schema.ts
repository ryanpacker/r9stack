/**
 * Convex Database Schema
 *
 * Each table here is designed to demonstrate a different auth pattern.
 * See docs/auth-architecture.md for the full explanation of each pattern.
 *
 * TABLE              AUTH PATTERN         DEMO PAGE
 * ─────────────────  ──────────────────   ─────────────────────
 * announcements      Public               /app/demo/public-data
 * notes              Authenticated        /app/demo/private-notes
 * admin_settings     Role-based (RBAC)    /app/demo/admin-panel
 * audit_logs         Internal only        /app/demo/audit-log
 * users              Synced from JWT      (used throughout)
 */

import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC TABLE — No auth required to read
  // Anyone can read these, even without being logged in.
  // Used by: convex/announcements.ts (Pattern A: Public)
  // ═══════════════════════════════════════════════════════════════════════════
  announcements: defineTable({
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index('by_created_at', ['createdAt']),

  // ═══════════════════════════════════════════════════════════════════════════
  // USER-SCOPED TABLE — Requires authentication, scoped by userId
  // Each note belongs to a specific user. Only that user can read/write it.
  // Used by: convex/notes.ts (Pattern B: Authenticated)
  // ═══════════════════════════════════════════════════════════════════════════
  notes: defineTable({
    userId: v.string(), // WorkOS user ID from identity.subject
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
  })
    .index('by_user_id', ['userId'])
    .index('by_user_and_created', ['userId', 'createdAt']),

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN-ONLY TABLE — Requires specific WorkOS RBAC permission
  // Only users with the "settings:read" permission can view these.
  // Only users with the "settings:write" permission can modify these.
  // Used by: convex/adminSettings.ts (Pattern C: Role-based)
  // ═══════════════════════════════════════════════════════════════════════════
  admin_settings: defineTable({
    key: v.string(),
    value: v.string(),
    updatedBy: v.string(), // WorkOS user ID of last editor
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNAL-ONLY TABLE — Only writable by internal functions
  // No client can write to this table directly. Entries are created
  // automatically by internal functions when other operations happen.
  // Used by: convex/auditLog.ts (Pattern D: Internal)
  // ═══════════════════════════════════════════════════════════════════════════
  audit_logs: defineTable({
    action: v.string(), // e.g., "note:created", "setting:updated"
    userId: v.string(), // Who performed the action
    details: v.optional(v.string()), // Human-readable description
    timestamp: v.number(),
  }).index('by_timestamp', ['timestamp']),

  // ═══════════════════════════════════════════════════════════════════════════
  // USERS TABLE — Synced from WorkOS JWT identity
  // Created/updated when a user first authenticates. Stores profile info
  // from the JWT so you can display it without calling WorkOS APIs.
  // ═══════════════════════════════════════════════════════════════════════════
  users: defineTable({
    workosId: v.string(), // identity.subject — the WorkOS user ID
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
