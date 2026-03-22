/* eslint-disable */
/**
 * Generated server types - this file will be replaced when you run `npx convex dev`
 */
import type {
  QueryBuilder,
  MutationBuilder,
  ActionBuilder,
} from "convex/server";
import type { DataModel } from "./dataModel";

export declare const query: QueryBuilder<DataModel, "public">;
export declare const internalQuery: QueryBuilder<DataModel, "internal">;
export declare const mutation: MutationBuilder<DataModel, "public">;
export declare const internalMutation: MutationBuilder<DataModel, "internal">;
export declare const action: ActionBuilder<DataModel, "public">;
export declare const internalAction: ActionBuilder<DataModel, "internal">;

