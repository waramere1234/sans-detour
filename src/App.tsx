import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { TopBar } from "./components/TopBar";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App({ children }: { children: ReactNode }) {
  // ErrorBoundary is a class component without its own routing awareness.
  // Once it traps an error, `hasError` stays true and every route renders
  // the fallback — even if the user clicks the TopBar wordmark to escape.
  // Keying by pathname remounts the boundary on navigation so each route
  // gets a clean attempt instead of being stuck behind a previous crash.
  const location = useLocation();
  return (
    <div style={{
      // 100dvh covers the full visual viewport, but body has safe-area
      // padding (index.css :body { padding: env(safe-area-inset-*) })
      // so the outer wrapper needs to subtract those insets to avoid
      // overflowing body by ~81px on iPhone 13 PWA (pushing the Cover
      // CTA / Play bottom buttons below the visible fold). The fallback
      // `0px` keeps non-notched devices at exactly 100dvh.
      minHeight:
        "calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg)",
      color: "var(--ink)",
    }}>
      <TopBar />
      <main style={{ flex: 1 }}>
        <ErrorBoundary key={location.pathname}>{children}</ErrorBoundary>
      </main>
    </div>
  );
}
