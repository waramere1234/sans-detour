// src/hooks/useModalA11y.ts
import { useEffect, useRef, type RefObject } from "react";

export interface UseModalA11yArgs {
  /** Whether the modal is currently visible. Effects no-op when false. */
  open: boolean;
  /** Fires when the user presses Escape inside the modal. */
  onClose: () => void;
}

export interface UseModalA11yResult {
  /** Attach to the dialog container. Used by the focus-trap selector and
   *  to scope the Tab cycle within the modal. */
  dialogRef: RefObject<HTMLDivElement | null>;
  /** Attach to the close button. Auto-focused on open via requestAnimationFrame
   *  (after the modal mount paints, otherwise focus() runs before the button
   *  exists in the DOM). */
  closeBtnRef: RefObject<HTMLButtonElement | null>;
}

/** All four modal-a11y effects that MethodeSheet and RankingOverlay used to
 *  inline, plus the underlying refs the consumer needs to wire up:
 *
 *  1. Escape key closes the modal.
 *  2. Body scroll is locked while open so the backdrop doesn't pass
 *     wheel/touch through to the page underneath.
 *  3. On open transition, the previously-focused element is captured and
 *     focus moves to the close button on the next animation frame; on
 *     close transition, focus is restored to the captured element (or
 *     is a no-op if it was unmounted in the meantime).
 *  4. Tab and Shift+Tab cycle focus within the dialog so keyboard users
 *     can't escape into the underlying page.
 *
 *  The focus-trap selector includes form inputs (`input, select, textarea`)
 *  even though current callers don't use them — a future modal with a form
 *  would otherwise have its inputs escape the trap. */
export function useModalA11y({ open, onClose }: UseModalA11yArgs): UseModalA11yResult {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // (3) Capture opener + focus close button on open; restore on close.
  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement as HTMLElement | null;
      const id = requestAnimationFrame(() => closeBtnRef.current?.focus());
      return () => cancelAnimationFrame(id);
    } else {
      openerRef.current?.focus();
    }
  }, [open]);

  // (1) Escape closes the modal.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // (2) Body scroll lock while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // (4) Focus trap: Tab and Shift+Tab cycle within the dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = dialog.querySelectorAll<HTMLElement>(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return { dialogRef, closeBtnRef };
}
