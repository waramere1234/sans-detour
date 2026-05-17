import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RetryError } from "../src/components/RetryError";

// RetryError was extracted from 4 inline copies of the same
// "<p>{message}</p><button>Réessayer</button>" block (Play.tsx had 3,
// Result.tsx had 2 -- they shared identical styles and the "Réessayer"
// copy). Pin the contract: message renders, onRetry fires on click,
// retryLabel overridable.

describe("RetryError", () => {
  it("renders the message verbatim", () => {
    render(<RetryError message="Impossible de charger les scrutins." onRetry={vi.fn()} />);
    expect(screen.getByText("Impossible de charger les scrutins.")).toBeInTheDocument();
  });

  it("uses 'Réessayer' as the default button label", () => {
    render(<RetryError message="msg" onRetry={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeInTheDocument();
  });

  it("overrides the label via retryLabel (Play.tsx 'Voir mon résultat' branch)", () => {
    render(<RetryError message="msg" onRetry={vi.fn()} retryLabel="Voir mon résultat" />);
    expect(screen.getByRole("button", { name: "Voir mon résultat" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Réessayer" })).not.toBeInTheDocument();
  });

  it("calls onRetry exactly once on button click", () => {
    const onRetry = vi.fn();
    render(<RetryError message="msg" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("button has type='button' (no implicit form submission)", () => {
    render(<RetryError message="msg" onRetry={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
