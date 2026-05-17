import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Wordmark } from "../src/components/Wordmark";

// Wordmark is small but appears on every secondary header (TopBar trigger,
// Cover hero, Methode + Legal page headers). Session 81 stripped the unused
// `className` prop — pin the simplified surface so a future regression
// (re-adding the className escape hatch, breaking the size→fontSize
// conversion, etc.) surfaces here.

describe("Wordmark", () => {
  it("renders the 'sans/détour' wordmark text", () => {
    const { container } = render(<Wordmark />);
    expect(container.textContent).toBe("sans/détour");
  });

  it("uses the default 14px font size when size is omitted", () => {
    const { container } = render(<Wordmark />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.fontSize).toBe("14px");
  });

  it("applies a custom size as inline fontSize in px", () => {
    const { container } = render(<Wordmark size={24} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.fontSize).toBe("24px");
  });

  it("uses the sd-wordmark class for the typographic styling hook", () => {
    const { container } = render(<Wordmark />);
    expect(container.firstElementChild).toHaveClass("sd-wordmark");
  });

  it("renders the slash inside its own .sd-slash span (theming hook)", () => {
    const { container } = render(<Wordmark />);
    const slash = container.querySelector(".sd-slash");
    expect(slash).not.toBeNull();
    expect(slash?.textContent).toBe("/");
  });

  it("renders an aria-hidden caret (decorative blinking cursor)", () => {
    const { container } = render(<Wordmark />);
    const caret = container.querySelector(".sd-caret");
    expect(caret).not.toBeNull();
    expect(caret).toHaveAttribute("aria-hidden", "true");
  });

  it("has no interactive role (purely text content)", () => {
    render(<Wordmark />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
