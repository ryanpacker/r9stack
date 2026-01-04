import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState } from "react";

/**
 * ConvexClientProvider wraps the app with ConvexProvider.
 * It handles SSR by only rendering the provider on the client side.
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ConvexReactClient | null>(null);

  useEffect(() => {
    // Only create the client on the client side
    // Vite exposes env vars prefixed with VITE_
    const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
    if (convexUrl) {
      setClient(new ConvexReactClient(convexUrl));
    }
  }, []);

  // During SSR or before hydration, just render children without Convex
  if (!client) {
    return <>{children}</>;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}

