/* eslint-disable */
/**
 * Generated API types - this file will be replaced when you run `npx convex dev`
 */
import type * as functions from '../functions.js'
import type * as messages from '../messages.js'
import type * as users from '../users.js'

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from 'convex/server'

declare const fullApi: ApiFromModules<{
  functions: typeof functions
  messages: typeof messages
  users: typeof users
}>
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, 'public'>
>
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, 'internal'>
>
