import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MethodeSheet } from "../src/components/MethodeSheet";
import {
  MODAL_CLOSE_LABEL,
  METHODESHEET_FULL_METHODE_LINK_LABEL,
  METHODESHEET_REPORT_ERROR_LINK_LABEL,
  METHODESHEET_CLAUDE_MISSION_STRONG,
} from "../src/types";

function renderSheet(open: boolean, onClose = vi.fn()) {
  return render(
    <MemoryRouter>
      <MethodeSheet open={open} onClose={onClose} />
    </MemoryRouter>
  );
}

describe("MethodeSheet", () => {
  it("renders nothing when open=false", () => {
    renderSheet(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog with aria-modal and aria-labelledby when open=true", () => {
    renderSheet(true);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
    const titleId = dialog.getAttribute("aria-labelledby")!;
    expect(document.getElementById(titleId)).toBeInTheDocument();
  });

  it("focuses the close button on mount", async () => {
    renderSheet(true);
    const closeBtn = screen.getByRole("button", { name: new RegExp(MODAL_CLOSE_LABEL, "i") });
    await new Promise((r) => setTimeout(r, 0));
    expect(closeBtn).toHaveFocus();
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    renderSheet(true, onClose);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    renderSheet(true, onClose);
    fireEvent.click(screen.getByTestId("methode-sheet-backdrop"));
    expect(onClose).toHaveBeenCalled();
  });

  it("includes mailto and methode link", () => {
    renderSheet(true);
    const mailLink = screen.getByRole("link", { name: new RegExp(METHODESHEET_REPORT_ERROR_LINK_LABEL, "i") });
    expect(mailLink).toHaveAttribute("href", expect.stringContaining("mailto:"));
    expect(screen.getByRole("link", { name: new RegExp(METHODESHEET_FULL_METHODE_LINK_LABEL, "i") })).toBeInTheDocument();
  });

  it("surfaces METHODESHEET_CLAUDE_MISSION_STRONG inside a <strong> (AI-role-boundary contract)", () => {
    renderSheet(true);
    // The mission line lives inside a <strong> in the Claude block.
    // Round-trip via the const so a future rewording that softens
    // "pas commenter" propagates to both the source and this test.
    const strongs = Array.from(document.querySelectorAll("strong"));
    const missionStrong = strongs.find(
      (el) => el.textContent === METHODESHEET_CLAUDE_MISSION_STRONG,
    );
    expect(missionStrong).toBeDefined();
  });
});
