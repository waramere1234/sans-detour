import React, { type ReactNode } from "react";
import { track } from "../lib/analytics";
import { CONTACT_EMAIL, mailto } from "../lib/contact";
import {
  ERROR_FALLBACK_HEADING,
  ERROR_FALLBACK_MESSAGE,
  ERROR_FALLBACK_RELOAD_LABEL,
  ERROR_FALLBACK_PERSISTENCE_HELP_PREFIX,
  ERROR_STACK_TRACE_MAX_LENGTH,
} from "../types";

interface State { hasError: boolean; }

export class ErrorBoundary extends React.Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(err: Error, info: { componentStack: string }) {
    track("error", {
      msg: err.message,
      stack: info.componentStack.slice(0, ERROR_STACK_TRACE_MAX_LENGTH),
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
      {/* Visually-hidden h1 so the fallback page has a landmark in the SR
        heading rotor — without it, SR users hit the boundary with no
        indication that they're on an error screen. */}
      <h1 className="sr-only">{ERROR_FALLBACK_HEADING}</h1>
      <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5 }}>
        {ERROR_FALLBACK_MESSAGE}
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
      >{ERROR_FALLBACK_RELOAD_LABEL}</button>
      <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8 }}>
        {ERROR_FALLBACK_PERSISTENCE_HELP_PREFIX}<a href={mailto()} style={{ color: "var(--accent)" }}>{CONTACT_EMAIL}</a>
      </p>
    </section>
  );
}
