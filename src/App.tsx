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
      minHeight: "100dvh",
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
