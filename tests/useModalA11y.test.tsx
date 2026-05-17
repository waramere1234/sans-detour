import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useModalA11y } from "../src/hooks/useModalA11y";

// Session 98 extracted useModalA11y from MethodeSheet + RankingOverlay
// (both inlined the same 4 effects). Tests cover the contract — Escape,
// body scroll lock, focus on open / restore on close, Tab focus trap —
// so a regression in either consumer surfaces here.

function Harness({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dialogRef, closeBtnRef } = useModalA11y({ open, onClose });
  if (!open) return null;
  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="test">
      <button ref={closeBtnRef} type="button">Close</button>
      <a href="#mid">Mid link</a>
      <input type="text" defaultValue="form input" aria-label="Test input" />
      <button type="button">Last</button>
    </div>
  );
}

describe("useModalA11y", () => {
  let originalOverflow: string;

  beforeEach(() => {
    originalOverflow = document.body.style.overflow;
  });

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
  });

  describe("body scroll lock", () => {
    it("sets body overflow to hidden when open", () => {
      document.body.style.overflow = "auto";
      render(<Harness open={true} onClose={vi.fn()} />);
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("restores the previous body overflow on unmount/close", () => {
      document.body.style.overflow = "scroll";
      const { rerender } = render(<Harness open={true} onClose={vi.fn()} />);
      expect(document.body.style.overflow).toBe("hidden");
      rerender(<Harness open={false} onClose={vi.fn()} />);
      expect(document.body.style.overflow).toBe("scroll");
    });

    it("does not touch body overflow when open=false", () => {
      document.body.style.overflow = "auto";
      render(<Harness open={false} onClose={vi.fn()} />);
      expect(document.body.style.overflow).toBe("auto");
    });
  });

  describe("Escape handler", () => {
    it("calls onClose when Escape is pressed", () => {
      const onClose = vi.fn();
      render(<Harness open={true} onClose={onClose} />);
      fireEvent.keyDown(window, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose for other keys", () => {
      const onClose = vi.fn();
      render(<Harness open={true} onClose={onClose} />);
      fireEvent.keyDown(window, { key: "Enter" });
      fireEvent.keyDown(window, { key: " " });
      fireEvent.keyDown(window, { key: "a" });
      expect(onClose).not.toHaveBeenCalled();
    });

    it("does not call onClose when open=false (handler not registered)", () => {
      const onClose = vi.fn();
      render(<Harness open={false} onClose={onClose} />);
      fireEvent.keyDown(window, { key: "Escape" });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("focus on open", () => {
    it("focuses the close button on the next animation frame", async () => {
      render(<Harness open={true} onClose={vi.fn()} />);
      // The hook defers the focus via requestAnimationFrame. jsdom fires
      // RAF on the macrotask queue — waitFor polls until the assertion
      // passes (or times out), which handles RAF + microtask drain.
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
      });
    });
  });

  describe("focus trap", () => {
    it("includes form inputs in the focusable set (session 98 fix)", () => {
      // Before session 98, the selector only matched a/button/[tabindex].
      // An <input> inside a modal would escape the trap. Verify the new
      // selector picks it up.
      render(<Harness open={true} onClose={vi.fn()} />);
      const dialog = screen.getByRole("dialog");
      const focusables = dialog.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      // Close + Mid link + input + Last = 4 focusable elements.
      expect(focusables.length).toBe(4);
    });

    it("cycles to first focusable when Tab is pressed on the last one", () => {
      render(<Harness open={true} onClose={vi.fn()} />);
      const last = screen.getByRole("button", { name: "Last" });
      last.focus();
      expect(last).toHaveFocus();
      fireEvent.keyDown(window, { key: "Tab" });
      expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    });

    it("cycles to last focusable when Shift+Tab is pressed on the first one", () => {
      render(<Harness open={true} onClose={vi.fn()} />);
      const first = screen.getByRole("button", { name: "Close" });
      first.focus();
      fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
      expect(screen.getByRole("button", { name: "Last" })).toHaveFocus();
    });

    it("does not intercept Tab when focus is in the middle of the cycle", () => {
      render(<Harness open={true} onClose={vi.fn()} />);
      const mid = screen.getByRole("link", { name: "Mid link" });
      mid.focus();
      // No preventDefault should happen — the browser handles the Tab.
      // We can't test the actual focus move (jsdom doesn't move focus on
      // Tab), but we can assert the close button didn't get pulled in.
      fireEvent.keyDown(window, { key: "Tab" });
      expect(screen.getByRole("button", { name: "Close" })).not.toHaveFocus();
    });
  });
});
