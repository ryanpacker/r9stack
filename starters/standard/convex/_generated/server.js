/* eslint-disable */
/**
 * Generated server module - this file will be replaced when you run `npx convex dev`
 *
 * The internal* builders MUST map to the internal generics. Aliasing them to
 * the public generics registers internal functions on the public API, which
 * would expose them to any caller on the project's first `npx convex dev`.
 */
import {
  actionGeneric,
  httpActionGeneric,
  internalActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
  mutationGeneric,
  queryGeneric,
} from 'convex/server'

export const query = queryGeneric
export const internalQuery = internalQueryGeneric
export const mutation = mutationGeneric
export const internalMutation = internalMutationGeneric
export const action = actionGeneric
export const internalAction = internalActionGeneric
export const httpAction = httpActionGeneric
