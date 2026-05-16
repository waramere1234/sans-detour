import React, { type ReactNode } from "react";
import { track } from "../lib/analytics";

interface State { hasError: boolean; }

export class ErrorBoundary extends React.Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(err: Error, info: { componentStack: string }) {
    track("error", {
      msg: err.message,
      stack: info.componentStack.slice(0, 200),
    });
  }

  render() {
    if (this.state.hasError) return <ErrorFallback />;
    return this.props.children;
  }
}

function ErrorFallback() {
  return (
    <section style={{
      maxWidth: "var(--max-content)", margin: "0 auto",
      padding: "48px var(--gutter)", textAlign: "center",
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5 }}>
        Quelque chose s'est cassé de notre côté.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          alignSelf: "center",
          background: "var(--accent)", color: "var(--bg)", border: "none",
          padding: "12px 20px", borderRadius: 6,
          fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14,
          cursor: "pointer",
        }}
      >Recharger</button>
      <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8 }}>
        Si ça persiste : <a href="mailto:contact@sansdetour.fr" style={{ color: "var(--accent)" }}>contact@sansdetour.fr</a>
      </p>
    </section>
  );
}
