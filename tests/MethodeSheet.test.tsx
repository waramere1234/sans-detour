import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MethodeSheet } from "../src/components/MethodeSheet";
import {
  MODAL_CLOSE_LABEL,
  METHODESHEET_FULL_METHODE_LINK_LABEL,
  METHODESHEET_REPORT_ERROR_LINK_LABEL,
  METHODESHEET_CLAUDE_MISSION_STRONG,
  METHODESHEET_AN_BLOCK_BODY, METHODESHEET_CLAUDE_NO_AI_IN_SCORE,
  METHODESHEET_CLAUDE_TASKS_BODY, METHODESHEET_CLAUDE_PROMPT_NEUTRALITY_BODY,
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

  it("surfaces METHODESHEET_CLAUDE_TASKS_BODY in the Claude block (round-trip)", () => {
    renderSheet(true);
    // The 4-output listing in the 1st Claude block paragraph. Round-trip
    // via the const so a future add/drop of a Claude output propagates
    // to source + test in one edit.
    expect(screen.getByText(METHODESHEET_CLAUDE_TASKS_BODY)).toBeInTheDocument();
  });

  it("surfaces METHODESHEET_CLAUDE_PROMPT_NEUTRALITY_BODY in the Claude block (round-trip)", () => {
    renderSheet(true);
    // The 2-sentence prompt-input neutrality claim. The JSX renders
    // it as `{BODY} <strong>{MISSION_STRONG}</strong>` — so the text
    // appears followed by a space + the strong tag. getByText with
    // a regex anchored to the body text round-trips through the const.
    const match = Array.from(document.querySelectorAll("p")).find(
      (p) => p.textContent?.startsWith(METHODESHEET_CLAUDE_PROMPT_NEUTRALITY_BODY),
    );
    expect(match).toBeDefined();
  });

  it("surfaces METHODESHEET_AN_BLOCK_BODY in the AN block (round-trip)", () => {
    renderSheet(true);
    // The AN block lists the 5 fields ingested from data.assemblee-nationale.fr.
    // Round-trip via the const so a schema change propagates to source +
    // test in one edit.
    expect(screen.getByText(METHODESHEET_AN_BLOCK_BODY)).toBeInTheDocument();
  });

  it("surfaces METHODESHEET_CLAUDE_NO_AI_IN_SCORE in the Claude block (round-trip)", () => {
    renderSheet(true);
    // The no-AI-in-scoring contract paragraph closes the Claude block.
    // Round-trip via the const so a softening of "formule mathématique
    // pure" or "aucune IA dans le score" propagates to source + test.
    expect(screen.getByText(METHODESHEET_CLAUDE_NO_AI_IN_SCORE)).toBeInTheDocument();
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
