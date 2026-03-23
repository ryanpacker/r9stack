/* eslint-disable */
/**
 * Generated API types - this file will be replaced when you run `npx convex dev`
 */
import type { FilterApi, FunctionReference } from "convex/server";

export declare const api: {
  adminSettings: {
    checkPermissions: FunctionReference<"query", "public", Record<string, never>, any>;
    list: FunctionReference<"query", "public", Record<string, never>, any>;
    update: FunctionReference<"mutation", "public", { key: string; value: string }, any>;
  };
  announcements: {
    create: FunctionReference<"mutation", "public", { title: string; content: string }, any>;
    list: FunctionReference<"query", "public", Record<string, never>, any>;
  };
  auditLogReader: {
    listRecent: FunctionReference<"query", "public", Record<string, never>, any>;
  };
  notes: {
    create: FunctionReference<"mutation", "public", { title: string; content: string }, any>;
    getMyIdentity: FunctionReference<"query", "public", Record<string, never>, any>;
    list: FunctionReference<"query", "public", Record<string, never>, any>;
    remove: FunctionReference<"mutation", "public", { noteId: any }, any>;
  };
  users: {
    getByWorkosId: FunctionReference<"query", "public", { workosId: string }, any>;
    me: FunctionReference<"query", "public", Record<string, never>, any>;
    upsertFromIdentity: FunctionReference<"mutation", "public", Record<string, never>, any>;
  };
};
export declare const internal: FilterApi<{
  announcements: {
    listInternal: FunctionReference<"query", "internal", Record<string, never>, any>;
  };
  auditLog: {
    listAll: FunctionReference<"query", "internal", Record<string, never>, any>;
    record: FunctionReference<"mutation", "internal", { action: string; userId: string; details?: string }, any>;
  };
}, "internal">;
