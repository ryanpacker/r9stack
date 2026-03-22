/* eslint-disable */
/**
 * Generated API types - this file will be replaced when you run `npx convex dev`
 */
import type { FilterApi, FunctionReference } from "convex/server";

export declare const api: {
  messages: {
    list: FunctionReference<"query", "public", Record<string, never>, any>;
    send: FunctionReference<"mutation", "public", { text: string }, any>;
  };
};
export declare const internal: FilterApi<any, "internal">;

