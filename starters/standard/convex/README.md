# Convex functions

Write your Convex functions here. See https://docs.convex.dev/functions for more.

## The rule: public functions must be authenticated

The Convex function API is reachable by anyone who has the deployment URL —
and the URL ships in the client JS bundle. Route guards in the web app do NOT
protect Convex. Every public function must therefore verify the caller itself:

- **Public queries and mutations use `authedQuery` / `authedMutation` from
  `functions.ts`** — never the raw `query` / `mutation` builders from
  `_generated/server`. The wrappers validate the caller's WorkOS JWT, resolve
  their `users` row, and inject it as `ctx.user`.
- **Public actions call `requireActionUser(ctx)`** at the top of the handler.
- **Never take caller identity from args.** No `workosId`, `email`, or
  `userId`-of-the-caller arguments — they are forgeable. The caller is always
  `ctx.user`.
- **Seeds, migrations, and crons use `internalQuery` / `internalMutation` /
  `internalAction`** — internal functions are not exposed on the public API.
- The one exception is `users.ensureUser`, which provisions the `users` row
  at login (it authenticates the JWT itself and fetches the profile
  server-side from the WorkOS API).

## Writing an authenticated query

```ts
// convex/myFunctions.ts
import { v } from 'convex/values'
import { authedQuery } from './functions'

export const myList = authedQuery({
  args: {},
  handler: async (ctx) => {
    // ctx.user is the verified caller's users row
    return await ctx.db
      .query('tablename')
      .withIndex('by_owner', (q) => q.eq('ownerId', ctx.user._id))
      .collect()
  },
})
```

## Writing an authenticated mutation

```ts
// convex/myFunctions.ts
import { v } from 'convex/values'
import { authedMutation } from './functions'

export const myCreate = authedMutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert('tablename', {
      ownerId: ctx.user._id, // attribute to the verified caller
      text: args.text,
      createdAt: Date.now(),
    })
  },
})
```

Use them in React components exactly like ordinary Convex functions:

```ts
const data = useQuery(api.myFunctions.myList)
const create = useMutation(api.myFunctions.myCreate)
```

## Deployment environment

`auth.config.ts` and `users.ensureUser` run on the Convex deployment, which
does not read `.env.local`. Set the WorkOS variables there once per project:

```bash
npx convex env set WORKOS_CLIENT_ID client_xxx
npx convex env set WORKOS_API_KEY sk_xxx
```

Use the Convex CLI to push your functions to a deployment. See everything
the Convex CLI can do by running `npx convex -h` in your project root
directory. To learn more, launch the docs with `npx convex docs`.
