 
/**
 * Generated API types - this file will be replaced when you run `npx convex dev`
 */
import type * as adminSettings from "../adminSettings.js";
import type * as announcements from "../announcements.js";
import type * as auditLog from "../auditLog.js";
import type * as auditLogReader from "../auditLogReader.js";
import type * as functions from "../functions.js";
import type * as http from "../http.js";
import type * as notes from "../notes.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminSettings: typeof adminSettings;
  announcements: typeof announcements;
  auditLog: typeof auditLog;
  auditLogReader: typeof auditLogReader;
  functions: typeof functions;
  http: typeof http;
  notes: typeof notes;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
