//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  // Never lint machine-generated files (convex codegen, router route tree).
  {
    ignores: ['convex/_generated/**', 'src/routeTree.gen.ts'],
  },

  ...tanstackConfig,

  // ── Security enforcement ──────────────────────────────────────────────────
  // Ban the raw public function builders in Convex code. Public queries and
  // mutations MUST go through the wrappers in convex/functions.ts
  // (authedQuery/authedMutation/authedAction for authenticated endpoints, or
  // the explicit publicQuery/publicMutation for deliberately public ones), so
  // no function can silently ship without an auth decision. Internal builders
  // (internalQuery/internalMutation/internalAction) and httpAction stay allowed.
  {
    files: ['convex/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: './_generated/server',
              importNames: ['query', 'mutation', 'action'],
              message:
                'Do not use the raw query/mutation/action builders. Import ' +
                'authedQuery/authedMutation/authedAction (or publicQuery/' +
                'publicMutation for intentionally public endpoints) from ' +
                './functions. Internal builders are fine to import here.',
            },
            {
              name: 'convex/server',
              importNames: [
                'queryGeneric',
                'mutationGeneric',
                'actionGeneric',
                'httpActionGeneric',
              ],
              message:
                'Do not use the generic builders from convex/server; define ' +
                'functions via the wrappers in convex/functions.ts.',
            },
          ],
        },
      ],
    },
  },
  // functions.ts is the one file allowed to import the raw builders (it defines
  // the wrappers). _generated is machine-authored.
  {
    files: ['convex/functions.ts', 'convex/_generated/**'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]
