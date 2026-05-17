import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import {
  ERROR_FALLBACK_MESSAGE,
  ERROR_FALLBACK_RELOAD_LABEL,
} from "../src/types";
import * as analytics from "../src/lib/analytics";

function ChildThatThrows(): never {
  throw new Error("kaboom");
}

describe("ErrorBoundary", () => {
  let trackSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    trackSpy = vi.spyOn(analytics, "track").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    trackSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <p>Hello</p>
      </ErrorBoundary>
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <ChildThatThrows />
      </ErrorBoundary>
    );
    expect(screen.getByText(new RegExp(ERROR_FALLBACK_MESSAGE.slice(0, 30), "i"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(ERROR_FALLBACK_RELOAD_LABEL, "i") })).toBeInTheDocument();
  });

  it("calls track('error', ...) when a child throws", () => {
    render(
      <ErrorBoundary>
        <ChildThatThrows />
      </ErrorBoundary>
    );
    expect(trackSpy).toHaveBeenCalledWith(
      "error",
      expect.objectContaining({ msg: "kaboom" }),
    );
  });
});
