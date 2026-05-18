// src/components/Wordmark.tsx
import type { CSSProperties } from "react";
import { WORDMARK_PART_1, WORDMARK_SLASH, WORDMARK_PART_2 } from "../types";

export interface WordmarkProps {
  size?: number;        // px
}

export function Wordmark({ size = 14 }: WordmarkProps) {
  const style: CSSProperties = { fontSize: `${size}px` };
  return (
    <span className="sd-wordmark" style={style}>
      {WORDMARK_PART_1}<span className="sd-slash">{WORDMARK_SLASH}</span>{WORDMARK_PART_2}
      <span className="sd-caret" aria-hidden="true" />
    </span>
  );
}
