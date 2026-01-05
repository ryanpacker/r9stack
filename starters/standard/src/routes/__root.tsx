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
      { title: '__PROJECT_NAME__' },
      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: '__PROJECT_NAME__' },
      {
        property: 'og:description',
        content:
          'A modern web application built with TanStack Start, Convex, and WorkOS.',
      },
      { property: 'og:image', content: '/images/your-project-logo.png' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: '__PROJECT_NAME__' },
      {
        name: 'twitter:description',
        content:
          'A modern web application built with TanStack Start, Convex, and WorkOS.',
      },
      { name: 'twitter:image', content: '/images/your-project-logo.png' },
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
            triggerImage: '/images/r9stack-icon-circle.png',
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
