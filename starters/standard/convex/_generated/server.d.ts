/* eslint-disable */
/**
 * Generated server types - this file will be replaced when you run `npx convex dev`
 */
import type {
  QueryBuilder,
  MutationBuilder,
  ActionBuilder,
  GenericQueryCtx,
  GenericMutationCtx,
  GenericActionCtx,
} from 'convex/server'
import type { DataModel } from './dataModel'

export declare const query: QueryBuilder<DataModel, 'public'>
export declare const internalQuery: QueryBuilder<DataModel, 'internal'>
export declare const mutation: MutationBuilder<DataModel, 'public'>
export declare const internalMutation: MutationBuilder<DataModel, 'internal'>
export declare const action: ActionBuilder<DataModel, 'public'>
export declare const internalAction: ActionBuilder<DataModel, 'internal'>

export type QueryCtx = GenericQueryCtx<DataModel>
export type MutationCtx = GenericMutationCtx<DataModel>
export type ActionCtx = GenericActionCtx<DataModel>
