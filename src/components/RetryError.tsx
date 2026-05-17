// src/components/RetryError.tsx
//
// Shared retry-error block used by Play.tsx + Result.tsx when fetchScrutins
// rejects or returns an empty pool. Before this component, the 22-line
// `<div><p>...</p><button>Réessayer</button></div>` block was duplicated
// 4× (Play has 2 error branches, Result has 2) with the same styles and
// the same "Réessayer" copy. A change to the button background or the
// padding had to be made 4 times in lockstep.

import type { CSSProperties } from "react";

export interface RetryErrorProps {
  message: string;
  onRetry: () => void;
  /** Override the default "Réessayer" label — used by Play.tsx's
   *  "Aucun scrutin disponible" branch which actually navigates to
   *  /result rather than retrying. */
  retryLabel?: string;
}

export function RetryError({ message, onRetry, retryLabel = "Réessayer" }: RetryErrorProps) {
  return (
    <div style={containerStyle}>
      <p style={messageStyle}>{message}</p>
      <button type="button" onClick={onRetry} style={buttonStyle}>
        {retryLabel}
      </button>
    </div>
  );
}

const containerStyle: CSSProperties = {
  padding: 24,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  maxWidth: "var(--max-content)",
  margin: "0 auto",
};

const messageStyle: CSSProperties = {
  color: "var(--ink)",
  fontSize: 15,
  lineHeight: 1.5,
};

const buttonStyle: CSSProperties = {
  alignSelf: "flex-start",
  background: "var(--accent)",
  color: "var(--bg)",
  border: "none",
  padding: "10px 16px",
  borderRadius: 6,
  fontFamily: "var(--font-sans)",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};
