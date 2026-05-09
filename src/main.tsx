import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Cover from "./routes/Cover";
import Play from "./routes/Play";
import Result from "./routes/Result";
import Methode from "./routes/Methode";
import Legal from "./routes/Legal";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App>
        <Routes>
          <Route path="/" element={<Cover />} />
          <Route path="/play" element={<Play />} />
          <Route path="/result" element={<Result />} />
          <Route path="/methode" element={<Methode />} />
          <Route path="/legal" element={<Legal />} />
        </Routes>
      </App>
    </BrowserRouter>
  </StrictMode>,
);
