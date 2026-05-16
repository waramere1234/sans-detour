import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Cover from "./routes/Cover";
import Play from "./routes/Play";
import Result from "./routes/Result";
import "./index.css";

// Methode and Legal are reading-only secondary pages (TOC + paragraphs)
// that most users never visit. Lazy-loading splits them off the main
// bundle — saves ~50-80 kB on the initial paint critical path.
const Methode = lazy(() => import("./routes/Methode"));
const Legal = lazy(() => import("./routes/Legal"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Cover />} />
            <Route path="/play" element={<Play />} />
            <Route path="/result" element={<Result />} />
            <Route path="/methode" element={<Methode />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </App>
    </BrowserRouter>
  </StrictMode>,
);
