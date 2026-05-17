// src/components/RetryError.tsx
//
// Shared retry-error block used by Play.tsx + Result.tsx when fetchScrutins
// rejects or returns an empty pool. Before this component, the 22-line
// `<div><p>...</p><button>Réessayer</button></div>` block was duplicated
// 4× (Play has 2 error branches, Result has 2) with the same styles and
// the same "Réessayer" copy. A change to the button background or the
// padding had to be made 4 times in lockstep.

import type { CSSProperties } from "react";

/** Canonical "fetchScrutins rejected" message — used identically by
 *  Play.tsx and Result.tsx loadError branches. Exported so a rewording
 *  is a single edit and the two routes can't drift apart. */
export const RETRY_FETCH_FAILED_MESSAGE =
  "Impossible de charger les scrutins. Vérifie ta connexion puis réessaie.";

/** Default label for the retry button. Used as the inline default
 *  arg of `RetryError` + pinned by 3 tests in tests/RetryError.test.tsx
 *  via `name: "Réessayer"`. Centralised so a rewording propagates to
 *  source + tests in one edit. */
export const RETRY_DEFAULT_LABEL = "Réessayer";

export interface RetryErrorProps {
  message: string;
  onRetry: () => void;
  /** Override the default RETRY_DEFAULT_LABEL — used by Play.tsx's
   *  "Aucun scrutin disponible" branch which actually navigates to
   *  /result rather than retrying. */
  retryLabel?: string;
}

export function RetryError({ message, onRetry, retryLabel = RETRY_DEFAULT_LABEL }: RetryErrorProps) {
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
