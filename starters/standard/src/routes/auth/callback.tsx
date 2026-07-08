import { createFileRoute } from '@tanstack/react-router'
import { handleCallbackRoute } from '@workos/authkit-tanstack-react-start'

export const Route = createFileRoute('/auth/callback')({
  server: {
    handlers: {
      GET: handleCallbackRoute({
        returnPathname: '/app',
        errorRedirectUrl: '/auth/sign-in',
      }),
    },
  },
})
