import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { AuthProvider } from '../components/AuthProvider'
import { ConvexClientProvider } from '../components/ConvexClientProvider'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'r9stack' },
      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'r9stack' },
      {
        property: 'og:description',
        content:
          'A walking skeleton for building modern web applications with TanStack Start, Convex, WorkOS, and shadcn/ui.',
      },
      { property: 'og:image', content: '/images/r9stack-logo.png' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'r9stack' },
      {
        name: 'twitter:description',
        content:
          'A walking skeleton for building modern web applications with TanStack Start, Convex, WorkOS, and shadcn/ui.',
      },
      { name: 'twitter:image', content: '/images/r9stack-logo.png' },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </AuthProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
            triggerImage: '/images/r9stack-logo-markonly-circle.png',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
