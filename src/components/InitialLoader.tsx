import type { ReactNode } from "react";

// Route Suspense handles actual loading. Never delay mounting the page or its
// data requests for a timed splash screen, especially on slower phones.
export function InitialLoader({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
