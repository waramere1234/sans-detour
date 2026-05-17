// src/components/Wordmark.tsx
import type { CSSProperties } from "react";

export interface WordmarkProps {
  size?: number;        // px
}

export function Wordmark({ size = 14 }: WordmarkProps) {
  const style: CSSProperties = { fontSize: `${size}px` };
  return (
    <span className="sd-wordmark" style={style}>
      sans<span className="sd-slash">/</span>détour
      <span className="sd-caret" aria-hidden="true" />
    </span>
  );
}
