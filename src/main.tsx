import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Cover from "./routes/Cover";
import Play from "./routes/Play";
import Result from "./routes/Result";
import { ROUTES } from "./lib/routes";
import { READING_PAGE_MAX_WIDTH } from "./types";
import "./index.css";

// Methode and Legal are reading-only secondary pages (TOC + paragraphs)
// that most users never visit. Lazy-loading splits them off the main
// bundle — saves ~50-80 kB on the initial paint critical path.
const Methode = lazy(() => import("./routes/Methode"));
const Legal = lazy(() => import("./routes/Legal"));

// Minimal route-loading placeholder — same gutter/max-width as the real
// reading pages so the layout doesn't snap when the lazy chunk arrives.
// role="status" + aria-live="polite" so SR users know it's a transitory
// loading state, not the destination page.
function RouteLoader() {
  return (
    <section
      role="status"
      aria-live="polite"
      style={{
        maxWidth: READING_PAGE_MAX_WIDTH, margin: "0 auto",
        padding: "48px var(--gutter)",
        color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 11,
        letterSpacing: "0.08em", textTransform: "uppercase",
      }}
    >
      Chargement…
    </section>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path={ROUTES.cover} element={<Cover />} />
            <Route path={ROUTES.play} element={<Play />} />
            <Route path={ROUTES.result} element={<Result />} />
            <Route path={ROUTES.methode} element={<Methode />} />
            <Route path={ROUTES.legal} element={<Legal />} />
            <Route path="*" element={<Navigate to={ROUTES.cover} replace />} />
          </Routes>
        </Suspense>
      </App>
    </BrowserRouter>
  </StrictMode>,
);
