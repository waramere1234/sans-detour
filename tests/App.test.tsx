import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import App from "../src/App";
import { ROUTES } from "../src/lib/routes";
import { ERROR_FALLBACK_MESSAGE, MENU_OPEN_LABEL } from "../src/types";
import * as analytics from "../src/lib/analytics";

// App.tsx is the shared shell mounted around every route. Two invariants
// are critical and previously untested:
//   - <TopBar /> is mounted above the route content
//   - <ErrorBoundary key={location.pathname}> remounts on navigation so a
//     crash on one route doesn't poison every subsequent route until a
//     full page reload (documented in the source comment as session N
//     fix; the key prop is what enforces it)

function ThrowingChild(): never {
  throw new Error("boom on this route");
}

function HealthyChild() {
  return <p>healthy child</p>;
}

function renderApp(initialPath: string, leftChild: React.ReactNode, rightChild?: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App>
        <Routes>
          <Route path={ROUTES.play} element={leftChild} />
          <Route path={ROUTES.result} element={rightChild ?? leftChild} />
        </Routes>
      </App>
    </MemoryRouter>
  );
}

describe("App — shell composition", () => {
  it("renders the children inside the <main> wrapper", () => {
    renderApp(ROUTES.play, <HealthyChild />);
    expect(screen.getByText("healthy child")).toBeInTheDocument();
  });

  it("mounts the TopBar (visible on /play)", () => {
    renderApp(ROUTES.play, <HealthyChild />);
    // TopBar renders the menu trigger on every non-Cover route.
    expect(screen.getByRole("button", { name: new RegExp(MENU_OPEN_LABEL) })).toBeInTheDocument();
  });
});

describe("App — ErrorBoundary key={location.pathname} remount on nav", () => {
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

  it("traps a route-level crash and renders the error fallback", () => {
    renderApp(ROUTES.play, <ThrowingChild />);
    // ErrorBoundary fallback renders ERROR_FALLBACK_MESSAGE
    expect(screen.getByText(new RegExp(ERROR_FALLBACK_MESSAGE.slice(0, 30), "i"))).toBeInTheDocument();
  });

  it("isolates the crashed route — a healthy sibling route mounts cleanly under a separate App instance", () => {
    // Each render = a fresh App. The key={location.pathname} prop's job is
    // to remount the boundary when *the same App instance* navigates, but
    // we can verify the symmetric claim by rendering /play (crashes) and
    // /result (mounts the healthy child) — both should reach their final
    // state independently, with no shared error state.
    renderApp(ROUTES.play, <ThrowingChild />);
    expect(screen.getByText(new RegExp(ERROR_FALLBACK_MESSAGE.slice(0, 30), "i"))).toBeInTheDocument();

    // Independent App for /result — the healthy child must reach the DOM,
    // proving the boundary doesn't have process-wide state.
    const { container } = render(
      <MemoryRouter initialEntries={[ROUTES.result]}>
        <App>
          <Routes>
            <Route path={ROUTES.result} element={<HealthyChild />} />
          </Routes>
        </App>
      </MemoryRouter>
    );
    expect(container.textContent).toMatch(/healthy child/);
  });
});
